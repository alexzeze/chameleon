<?php
/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: json.tpl 2030 2008-06-04 10:12:13Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */
require('../../Group-Office.php');
$GO_SECURITY->json_authenticate('comments');
require_once ($GO_MODULES->modules['comments']['class_path'].'comments.class.inc.php');
$comments = new comments();
$task=isset($_REQUEST['task']) ? ($_REQUEST['task']) : '';
try{
	switch($task)
	{
		case 'comment':
			$comment = $comments->get_comment(($_REQUEST['comment_id']));
			$user = $GO_USERS->get_user($comment['user_id']);
			$comment['user_name']=String::format_name($user);
			$comment['mtime']=Date::get_timestamp($comment['mtime']);
			$comment['ctime']=Date::get_timestamp($comment['ctime']);
			$response['data']=$comment;
			$response['success']=true;
			break;
		case 'comments':
			
			require_once($GO_CONFIG->class_path.'/base/search.class.inc.php');
			$search = new search();
			
			if(isset($_POST['delete_keys']))
			{
				try{
					$response['deleteSuccess']=true;
					$delete_comments = json_decode(($_POST['delete_keys']));
					foreach($delete_comments as $comment_id)
					{
						$comments->delete_comment($comment_id);
					}
				}catch(Exception $e)
				{
					$response['deleteSuccess']=false;
					$response['deleteFeedback']=$e->getMessage();
				}
			}
			$sort = isset($_REQUEST['sort']) ? ($_REQUEST['sort']) : 'id';
			$dir = isset($_REQUEST['dir']) ? ($_REQUEST['dir']) : 'DESC';
			$start = isset($_REQUEST['start']) ? ($_REQUEST['start']) : '0';
			$limit = isset($_REQUEST['limit']) ? ($_REQUEST['limit']) : '0';
			$query = isset($_REQUEST['query']) ? '%'.($_REQUEST['query']).'%' : '';
			
			
			$link_id = isset($_REQUEST['link_id']) ? ($_REQUEST['link_id']) : '';
			$link_type = isset($_REQUEST['link_type']) ? ($_REQUEST['link_type']) : '';
			
			
			$record = $search->get_search_result($link_id, $link_type);
			$response['write_permission']=$GO_SECURITY->has_permission($GO_SECURITY->user_id, $record['acl_write']);
			if(!$response['write_permission'] && !$GO_SECURITY->has_permission($GO_SECURITY->user_id, $record['acl_read']))
			{
				throw new AccessDeniedException();
			}
			
			
			$response['total'] = $comments->get_comments($link_id, $link_type, $query, $sort, $dir, $start, $limit);
			$response['results']=array();
			while($comments->next_record())
			{
				$comment = $comments->record;
				$user = $GO_USERS->get_user($comment['user_id']);
				$comment['user_name']=String::format_name($user);
				$comment['mtime']=Date::get_timestamp($comment['mtime']);
				$comment['ctime']=Date::get_timestamp($comment['ctime']);
				$comment['comments']=String::text_to_html($comment['comments']);
				$response['results'][] = $comment;
			}
			break;
/* {TASKSWITCH} */
	}
}catch(Exception $e)
{
	$response['feedback']=$e->getMessage();
	$response['success']=false;
}
echo json_encode($response);
