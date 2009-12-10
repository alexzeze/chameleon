<?php
/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: action.php 2583 2009-05-26 13:37:11Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */

require('../../Group-Office.php');

$GO_SECURITY->json_authenticate('files');

require_once ($GO_MODULES->modules['files']['class_path']."files.class.inc.php");
$files = new files();

require($GO_LANGUAGE->get_language_file('files'));

$task=isset($_REQUEST['task']) ? ($_REQUEST['task']) : '';

$response=array();

try{
	switch($task)
	{
				
		case 'set_view':
			$up_folder['id']=$_POST['id'];
			$up_folder['thumbs']=$_POST['thumbs'];

			$files->update_folder($up_folder);

			$response['success']=true;

			break;
			/*case 'delete':

			$delete_path = $GO_CONFIG->file_storage_path.$_POST['path'];

			if(!$files->has_write_permission($GO_SECURITY->user_id, $delete_path))
			{
			throw new AccessDeniedException();
			}

			$files->notify_users($_POST['path'], $GO_SECURITY->user_id, array(), array(), array(utf8_basename($delete_path)));

			$response['success']=$files->delete($delete_path);
			break;*/
		case 'file_properties':
			$file = $files->get_file($_POST['file_id']);
			$folder = $files->get_folder($file['folder_id']);
			if(!$folder)
			{
				throw new FileNotFoundException();
			}elseif(!$files->has_write_permission($GO_SECURITY->user_id, $folder))
			{
				throw new AccessDeniedException();
			}

			$up_file['id']=$file['id'];
			$up_file['comments']=$_POST['comments'];
			


			if(empty($_POST['name']))
			{
				throw new MissingFieldException();
			}
			$extension = File::get_extension($file['name']);
			if(!empty($extension))
			{
				$_POST['name'] .= '.'.$extension;
			}

			if($_POST['name'] != $file['name'])
			{
				$path=$files->build_path($folder);
				$oldpath = $path.'/'.$file['name'];
				$newpath = $path.'/'.$_POST['name'];
						
				$fs = new filesystem();
				$fs->move($GO_CONFIG->file_storage_path.$oldpath, $GO_CONFIG->file_storage_path.$newpath);		
				$response['path']=$newpath;
				
				$up_file['name']=$_POST['name'];
			}			
			$files->update_file($up_file);
				
			$GO_EVENTS->fire_event('save_file_properties', array(&$response,$up_file));

			$response['success']=true;

			break;

		case 'folder_properties':
			$folder = $files->get_folder($_POST['folder_id']);
			if(!$folder)
			{
				throw new FileNotFoundException();
			}elseif(!$files->has_write_permission($GO_SECURITY->user_id, $folder))
			{
				throw new AccessDeniedException();
			}
				
			if(isset($_POST['name']) && empty($_POST['name']))
			{
				throw new MissingFieldException();
			}

			$new_notify = isset($_POST['notify']);
			$old_notify = $files->is_notified($_POST['folder_id'], $GO_SECURITY->user_id);

			if($new_notify && !$old_notify)
			{
				$files->add_notification($_POST['folder_id'], $GO_SECURITY->user_id);
			}
			if(!$new_notify && $old_notify)
			{
				$files->remove_notification($_POST['folder_id'], $GO_SECURITY->user_id);
			}

			$up_folder['id']=$_POST['folder_id'];
			$up_folder['comments']=$_POST['comments'];
				
			$usersfolder = $files->resolve_path('users');

			if($folder['parent_id']!=$usersfolder['id'] && ($files->is_owner($folder) || $GO_SECURITY->has_admin_permission($GO_SECURITY->user_id)))
			{
				if (isset($_POST['share']) && $folder['acl_read']==0) {

					$up_folder['acl_read']=$GO_SECURITY->get_new_acl();
					$up_folder['acl_write']=$GO_SECURITY->get_new_acl();
					$up_folder['visible']='1';

					$response['acl_read']=$up_folder['acl_read'];
					$response['acl_write']=$up_folder['acl_write'];
				}
				if (!isset ($_POST['share']) && $folder['acl_read']) {
					$up_folder['acl_read']=0;
					$up_folder['acl_write']=0;

					$GO_SECURITY->delete_acl($folder['acl_read']);
					$GO_SECURITY->delete_acl($folder['acl_write']);
				}
			}
				
			$files->update_folder($up_folder);

			if(isset($_POST['name']))
			{
				if($_POST['name'] != $folder['name'])
				{
					$path=$files->build_path($folder);
					$newpath = dirname($path).'/'.$_POST['name'];
						
					$fs = new filesystem();
					$fs->move($GO_CONFIG->file_storage_path.$path, $GO_CONFIG->file_storage_path.$newpath);

					$up_folder['name']=$_POST['name'];
						
					$response['path']=$newpath;
				}
			}
				
			$files->update_folder($up_folder);

			$GO_EVENTS->fire_event('save_folder_properties', array(&$response,$up_folder));

			$response['success']=true;

			break;

		case 'new_folder':
				
			
			
			$folder=$files->mkdir($_POST['folder_id'], $_POST['name']);
			$response['folder_id']=$folder['id'];
			$response['success']=true;

			break;

		case 'upload':
			$response['success']=true;
			$fs = new filesystem();
			$fs->mkdir_recursive($GO_CONFIG->tmpdir.'files_upload');

			$_SESSION['GO_SESSION']['files']['uploaded_files']=array();

			for ($n = 0; $n < count($_FILES['attachments']['tmp_name']); $n ++)
			{
				if (is_uploaded_file($_FILES['attachments']['tmp_name'][$n]))
				{
					$tmp_file = $GO_CONFIG->tmpdir.'files_upload/'.$_FILES['attachments']['name'][$n];
					move_uploaded_file($_FILES['attachments']['tmp_name'][$n], $tmp_file);
					chmod($tmp_file, $GO_CONFIG->file_create_mode);

					$_SESSION['GO_SESSION']['files']['uploaded_files'][]=$tmp_file;
				}
			}
			$response['success']=true;
			break;

		case 'overwrite':

			require_once($GO_CONFIG->class_path.'base/quota.class.inc.php');
			$quota = new quota();
				
			$fs = new filesystem();

			$new = array();
			$modified=array();

			$command = isset($_POST['command']) ? $_POST['command'] : 'ask';
				
			$folder = $files->get_folder($_POST['folder_id']);
			if(!$folder)
			{
				throw new FileNotFoundException();
			}
			if(!$files->has_write_permission($GO_SECURITY->user_id, $folder))
			{
				throw new AccessDeniedException();
			}

			$rel_path = $files->build_path($folder);
			$full_path = $GO_CONFIG->file_storage_path.$rel_path;

			while($tmp_file = array_shift($_SESSION['GO_SESSION']['files']['uploaded_files']))
			{
				$filename = utf8_basename($tmp_file);
				$new_path = $full_path.'/'.$filename;

				if(file_exists($new_path) && $command!='yes' && $command!='yestoall')
				{
					if($command!='no' && $command != 'notoall')
					{
						array_unshift($_SESSION['GO_SESSION']['files']['uploaded_files'], $tmp_file);
						$response['file_exists']=utf8_basename($tmp_file);
						throw new Exception('File exists');
					}
				}else
				{
					$size = filesize($tmp_file)/1024;
					/*if(!$quota->check($size))
					 {
						throw new Exception($lang['common']['quotaExceeded']);
						}*/
						
					$existing_file = $files->file_exists($folder['id'], $filename);
					if($existing_file)
					{
						$modified[]=$filename;
					}else
					{
						$new[]=$filename;
					}
                    
					if($existing_file)
					{
							$version_filepath = $files->get_versions_dir($existing_file['id']).'/'.date('YmdGi',filectime($new_path)).'_'.$_SESSION['GO_SESSION']['username'].'_'.$filename;
							$fs->move($new_path, $version_filepath);
					}

					if(!$fs->move($tmp_file, $new_path))
					{
						throw new Exception($lang['common']['saveError']);
					}

					$file_id = $files->import_file($new_path, $folder['id']);

					if(!$existing_file && $GO_MODULES->has_module('workflow'))
					{
						require_once($GO_MODULES->modules['workflow']['class_path'].'workflow.class.inc.php');
						$wf = new workflow();

						$wf_folder = $wf->get_folder($folder['id']);
						if(!empty($wf_folder['default_process_id']))
						{
							$wf->enable_workflow_process($file_id, $wf_folder['default_process_id']);
						}
					}
                    
					//$quota->add($size);

						
				}
				if($command != 'yestoall' && $command != 'notoall')
				{
					$command='ask';
				}
			}

			$files->notify_users($folder, $GO_SECURITY->user_id, $modified, $new);

			$response['success']=true;

			break;

		case 'paste':

			$command = isset($_POST['command']) ? $_POST['command'] : 'ask';

			if($command=='ask' && isset($_POST['paste_sources']) && isset($_POST['paste_destination']))
			{
				$_SESSION['GO_SESSION']['files']['paste_sources']= json_decode($_POST['paste_sources']);
				$_SESSION['GO_SESSION']['files']['paste_destination']= $_POST['paste_destination'];
			}

			if(isset($_SESSION['GO_SESSION']['files']['paste_sources']) && count($_SESSION['GO_SESSION']['files']['paste_sources']))
			{
				$response['success']=true;

				if(!$files->has_write_permission($GO_SECURITY->user_id, $_SESSION['GO_SESSION']['files']['paste_destination']))
				{
					throw new AccessDeniedException();
				}

				while($paste_source = array_shift($_SESSION['GO_SESSION']['files']['paste_sources']))
				{
					$destfolder = $files->get_folder($_SESSION['GO_SESSION']['files']['paste_destination']);
					$destpath = $GO_CONFIG->file_storage_path.$files->build_path($destfolder);
						
					$type_id = explode(':',$paste_source);
						
					if($type_id[0]=='d')
					{
						$sourcefolder = $files->get_folder($type_id[1]);
						$sourcepath = $GO_CONFIG->file_storage_path.$files->build_path($sourcefolder);
						$destpath .= '/'.$sourcefolder['name'];
					}else
					{
						$sourcefile = $files->get_file($type_id[1]);
						$sourcepath = $GO_CONFIG->file_storage_path.$files->build_path($sourcefile['folder_id']).'/'.$sourcefile['name'];
						$destpath .= '/'.$sourcefile['name'];
					}

					
						
					$fs = new filesystem();

					if($_POST['paste_mode']=='copy')
					{
						if($sourcepath==$destpath)
						{
							$name = $destpath;
							$x=0;
							while(file_exists($destpath))
							{
								$x++;
								if($type_id[0]=='d')
								{
									$destpath=$name.' ('.$x.')';
								}else
								{
									$destpath=File::strip_extension($name).' ('.$x.').'.File::get_extension($name);
								}
							}
						}
					}else
					{
						if($destpath==$sourcepath)
						{
							continue;
						}
					}

					$exists = file_exists($destpath);
					if($exists && $command!='yes' && $command!='yestoall')
					{
						if($command!='no' && $command != 'notoall')
						{
							array_unshift($_SESSION['GO_SESSION']['files']['paste_sources'], $paste_source);
							$response['file_exists']=utf8_basename($destpath);
							throw new Exception('File exists');
						}
					}else
					{
						if($_POST['paste_mode']=='cut')
						{
							if($type_id[0]=='d')
							{
								if(!$files->has_write_permission($GO_SECURITY->user_id, $sourcefolder))
								{
									throw new AccessDeniedException();
								}

								$fs->move($sourcepath, $destpath);
								$files->move_folder($sourcefolder, $destfolder);
							}else
							{
								if(!$files->has_write_permission($GO_SECURITY->user_id, $sourcefile['folder_id']))
								{
									throw new AccessDeniedException();
								}

								$fs->move($sourcepath, $destpath);
								$files->move_file($sourcefile, $destfolder);
							}
						}else
						{
							//todo check if exists on import
							$fs->copy($sourcepath, $destpath);
							if($type_id[0]=='d')
							{
								$files->import_folder($destpath,$destfolder['id']);
							}else
							{
								$files->import_file($destpath,$destfolder['id']);
							}
						}
					}

					if($command != 'yestoall' && $command != 'notoall')
					{
						$command='ask';
					}
				}

			}
			break;


		case 'save_template':

			$template['id']=isset($_POST['template_id']) ? ($_POST['template_id']) : 0;
			$template['name']=$_POST['name'];

			$types = 'is';

			if (is_uploaded_file($_FILES['file']['tmp_name'][0]))
			{
				/*$fp = fopen($_FILES['file']['tmp_name'][0], "rb");
				$template['content'] = fread($fp, $_FILES['file']['size'][0]);
				fclose($fp);*/
				
				$template['content'] = file_get_contents($_FILES['file']['tmp_name'][0]);

				$template['extension']=File::get_extension($_FILES['file']['name'][0]);
				$types .= 'bs';
			}

			if(isset($_POST['user_id']))
			{
				$template['user_id']=$_POST['user_id'];
				$types .= 'i';
			}

			if($template['id']>0)
			{
				$files->update_template($template, $types);
				$response['success']=true;
			}else
			{
				if(empty($template['user_id']))
				{
					$template['user_id']=$GO_SECURITY->user_id;
				}
				$response['acl_read']=$template['acl_read']=$GO_SECURITY->get_new_acl();
				$response['acl_write']=$template['acl_write']=$GO_SECURITY->get_new_acl();
				$types .= 'ii';
				$response['template_id']=$files->add_template($template, $types);
			}
			$response['success']=true;

			break;
	}
}
catch(Exception $e)
{
	$response['feedback']=$e->getMessage();
	$response['success']=false;
}
echo json_encode($response);