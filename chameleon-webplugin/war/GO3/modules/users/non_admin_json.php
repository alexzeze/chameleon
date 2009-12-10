<?php
/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: non_admin_json.php 2829 2009-07-13 12:02:47Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */

require_once("../../Group-Office.php");
$GO_SECURITY->json_authenticate();

$task = isset($_REQUEST['task']) ? ($_REQUEST['task']) : '';

switch($task)
{
	case 'users':

		$sort = isset($_REQUEST['sort']) ? ($_REQUEST['sort']) : 'name';
		$dir = isset($_REQUEST['dir']) ? ($_REQUEST['dir']) : 'ASC';
		$start = isset($_REQUEST['start']) ? ($_REQUEST['start']) : '0';
		$limit = isset($_REQUEST['limit']) ? ($_REQUEST['limit']) : '0';
		$query = isset($_REQUEST['query']) ? '%'.($_REQUEST['query']).'%' : null;
		$search_field = isset($_REQUEST['search_field']) ? ($_REQUEST['search_field']) : null;

		$response['total'] = $GO_USERS->search($query, $search_field, $GO_SECURITY->user_id, $start, $limit, $sort,$dir);
		$response['results']=array();
		while($GO_USERS->next_record())
		{				
			$name = String::format_name($GO_USERS->f('last_name'),$GO_USERS->f('first_name'),$GO_USERS->f('middle_name'));
			$address = $GO_USERS->f('address').' '.$GO_USERS->f('address_no');
			$waddress = $GO_USERS->f('work_address').' '.$GO_USERS->f('work_address_no');
				
			$response['results'][]=array(
					'id'=>$GO_USERS->f('id'),
					'username'=>$GO_USERS->f('username'), 
					'name'=>htmlspecialchars($name), 
					'company'=>$GO_USERS->f('company'),
					'logins'=>$GO_USERS->f('logins'),
					'lastlogin'=>Date::get_timestamp($GO_USERS->f('lastlogin')), 
					'registration_time'=>Date::get_timestamp($GO_USERS->f('registration_time')),
					'address' => $address,
					'zip' => $GO_USERS->f('zip'),
					'city' => $GO_USERS->f('city'),
					'state' => $GO_USERS->f('state'),
					'country' => $GO_USERS->f('country'),
					'phone' => $GO_USERS->f('phone'),
					'email' => $GO_USERS->f('email'),
					'waddress' => $waddress,
					'wzip' => $GO_USERS->f('work_zip'),
					'wcity' => $GO_USERS->f('work_city'),
					'wstate' => $GO_USERS->f('work_state'),
					'wcountry' => $GO_USERS->f('work_country'),
					'wphone' => $GO_USERS->f('work_phone')
			);				
		}

		echo json_encode($response);
		break;
	case 'start_module':
		$records=array();
		foreach($GO_MODULES->modules as $module)
		{
			if($module['admin_menu']=='0' &&
					(($module['read_permission'] && (empty($_POST['user_id']) || $_POST['user_id']==$GO_SECURITY->user_id)) ||
						(!empty($_POST['user_id']) &&
							($GO_SECURITY->has_permission($_POST['user_id'], $module['acl_read']) || $GO_SECURITY->has_permission($_POST['user_id'], $module['acl_write']))
						)
					)
				)
			{
				$record = array(
					'id' => $module['id'],
					'name' => $module['humanName'] 
				);

				$records[] = $record;
			}
		}

		echo '{total:'.count($records).',results:'.json_encode($records).'}';
		break;

	case 'themes':
		$themes = $GO_THEME->get_themes();
		foreach($themes as $theme)
		{
			$record = array(
				'id' => $theme,
				'theme' => $theme 
			);

			$records[] = $record;
		}
		echo '{total:'.count($records).',results:'.json_encode($records).'}';
		break;
}