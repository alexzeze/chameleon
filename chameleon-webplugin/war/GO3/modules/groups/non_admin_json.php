<?php
/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: json.php 1647 2008-12-24 13:26:08Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */

require_once("../../Group-Office.php");

require_once ($GO_LANGUAGE->get_language_file('groups'));

$sort = isset($_REQUEST['sort']) ? ($_REQUEST['sort']) : 'name';
$dir = isset($_REQUEST['dir']) ? ($_REQUEST['dir']) : 'ASC';
$start = isset($_REQUEST['start']) ? ($_REQUEST['start']) : '0';
$limit = isset($_REQUEST['limit']) ? ($_REQUEST['limit']) : '0';

switch ($_POST['task'])
{
	case 'groups':
		$response['total'] = $GO_GROUPS->get_groups(null, $start, $limit, $sort, $dir);
		$response['results']=array();
		while($GO_GROUPS->next_record())
		{
			if ($GO_GROUPS->f('id') != 2)
			{
				$record = array(
					'id' => $GO_GROUPS->f('id'),
					'name' => $GO_GROUPS->f('name'),
					'user_id' => $GO_GROUPS->f('user_id'),
					'user_name' => String::format_name($GO_GROUPS->f('last_name'), $GO_GROUPS->f('first_name'), $GO_GROUPS->f('middle_name'))
				);
				$response['results'][] = $record;
			}
		}

		echo json_encode($response);
		break;
	case 'users_in_group':
		$response=array();

		$response['total'] = $GO_GROUPS->get_users_in_group($group_id, $start, $limit, $sort, $dir);
		$response['results']=array();
		while($GO_GROUPS->next_record())
		{
			$record = array(
				'id' => $GO_GROUPS->f('id'),
				'user_id' => $GO_GROUPS->f('user_id'),
				'name' => String::format_name($GO_GROUPS->f('last_name'), $GO_GROUPS->f('first_name'), $GO_GROUPS->f('middle_name')),
				'email' => $GO_GROUPS->f('email')
			);
			$response['results'][] = $record;
		}
		echo json_encode($response);
		break;
}


?>