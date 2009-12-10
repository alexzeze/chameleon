<?php
/**
 * Autologin function
 *
 * @return array containing the user row or empty if no auto login should take place
 */
function login_groupoffice(&$username, &$password)
{
	global $db;
	
	if (!$password)
	{
		return array(
			'status'	=> LOGIN_ERROR_PASSWORD,
			'error_msg'	=> 'NO_PASSWORD_SUPPLIED',
			'user_row'	=> array('user_id' => ANONYMOUS),
		);
	}

	if (!$username)
	{
		return array(
			'status'	=> LOGIN_ERROR_USERNAME,
			'error_msg'	=> 'LOGIN_ERROR_USERNAME',
			'user_row'	=> array('user_id' => ANONYMOUS),
		);
	}
	$gorow = user_row_groupoffice($username, $password);

	if($gorow)
	{
		$sql = 'SELECT user_id, username, user_password, user_passchg, user_email, user_type
			FROM ' . USERS_TABLE . "
			WHERE username = '" . $db->sql_escape($username) . "'";
		$result = $db->sql_query($sql);
		$row = $db->sql_fetchrow($result);
		$db->sql_freeresult($result);

		if ($row)
		{
			// User inactive...
			if ($row['user_type'] == USER_INACTIVE || $row['user_type'] == USER_IGNORE)
			{
				return array(
					'status'		=> LOGIN_ERROR_ACTIVE,
					'error_msg'		=> 'ACTIVE_ERROR',
					'user_row'		=> $row,
				);
			}

			// Successful login...
			return array(
				'status'		=> LOGIN_SUCCESS,
				'error_msg'		=> false,
				'user_row'		=> $row,
			);
		}

		// this is the user's first login so create an empty profile
		return array(
			'status'		=> LOGIN_SUCCESS_CREATE_PROFILE,
			'error_msg'		=> false,
			'user_row'		=> $gorow,
		);

	}else
	{
		return array(
				'status'	=> LOGIN_ERROR_USERNAME,
				'error_msg'	=> 'LOGIN_ERROR_USERNAME',
				'user_row'	=> array('user_id' => ANONYMOUS),
		);
	}
}

function autologin_groupoffice()
{	
	if(isset($_REQUEST['goauth']))
	{
		$file = base64_decode($_REQUEST['goauth']);
		$user_id = intval(file_get_contents($file));
		unlink($file);	
			
		$gorow = user_row_groupoffice('', '', $user_id);

		if($gorow)
		{
			global $db;
		
			$sql = 'SELECT * FROM ' . USERS_TABLE . "
			WHERE username = '" . $db->sql_escape($gorow['username']) . "'";
			$result = $db->sql_query($sql);
			$row = $db->sql_fetchrow($result);
			$db->sql_freeresult($result);
			

			if ($row)
			{
				return ($row['user_type'] == USER_INACTIVE || $row['user_type'] == USER_IGNORE) ? array() : $row;
			}
			
			if (!function_exists('user_add'))
			{
				global $phpbb_root_path, $phpEx;
	
				include($phpbb_root_path . 'includes/functions_user.' . $phpEx);
			}
	
			// create the user if he does not exist yet
			user_add($gorow);
	
			$sql = 'SELECT *
				FROM ' . USERS_TABLE . "
				WHERE username_clean = '" . $db->sql_escape(utf8_clean_string($gorow['username'])) . "'";
			$result = $db->sql_query($sql);
			$row = $db->sql_fetchrow($result);
			$db->sql_freeresult($result);
	
			if ($row)
			{
				return $row;
			}
		}
		
	}
	return array();
}

function get_godb()
{
	global $config;
	
	$godb = new dbal_mysqli();
	$godb->sql_connect($config['groupoffice_server'], $config['groupoffice_user'], $config['groupoffice_pass'], $config['groupoffice_database']);
	return $godb;
}


/**
 * This function generates an array which can be passed to the user_add function in order to create a user
 */
function user_row_groupoffice($username, $password, $user_id=false)
{
	global $db, $config, $user;
	
	$pw = $encrypted ? $password : md5($password);

	// first retrieve default group id
	$sql = 'SELECT group_id
		FROM ' . GROUPS_TABLE . "
		WHERE group_name = '" . $db->sql_escape('REGISTERED') . "'
			AND group_type = " . GROUP_SPECIAL;
	$result = $db->sql_query($sql);
	$row = $db->sql_fetchrow($result);
	$db->sql_freeresult($result);

	if (!$row)
	{
		trigger_error('NO_GROUP');
	}

	
	$godb=get_godb();
	

	$sql = "SELECT username,email FROM go_users WHERE ";

	if($user_id)	
	{
		$sql .= "id=".$user_id;		
	}else
	{
		$sql .= "username= '" . $db->sql_escape(utf8_clean_string($username)) . "' AND password='".$pw."'"; 
	}

	$result = $godb->sql_query($sql);
	$gorow = $godb->sql_fetchrow($result);
	$godb->sql_freeresult($result);

	if(!$gorow)
	{
		return false;
	}

	// generate user account data
	return array(
		'username'		=> $gorow['username'],
		'user_password'	=> phpbb_hash($password),
		'user_email'	=> $gorow['email'],
		'group_id'		=> (int) $row['group_id'],
		'user_type'		=> USER_NORMAL,
		'user_ip'		=> $user->ip,
	);
}

function acp_groupoffice(&$new)
{
	global $user;

	$tpl = '

	<dl>
		<dt><label for="groupoffice_server">Database server:</label><br /><span></span></dt>
		<dd><input type="text" id="groupoffice_server" size="40" name="config[groupoffice_server]" value="' . $new['groupoffice_server'] . '" /></dd>
	</dl>
	<dl>
		<dt><label for="groupoffice_server">Database name:</label><br /><span></span></dt>
		<dd><input type="text" id="groupoffice_server" size="40" name="config[groupoffice_database]" value="' . $new['groupoffice_database'] . '" /></dd>
	</dl>
	<dl>
		<dt><label for="groupoffice_server">Database user:</label><br /><span></span></dt>
		<dd><input type="text" id="groupoffice_server" size="40" name="config[groupoffice_user]" value="' . $new['groupoffice_user'] . '" /></dd>
	</dl>
	<dl>
		<dt><label for="groupoffice_server">Database password:</label><br /><span></span></dt>
		<dd><input type="password" id="groupoffice_server" size="40" name="config[groupoffice_pass]" value="' . $new['groupoffice_pass'] . '" /></dd>
	</dl>
	<dl>
		<dt><label for="groupoffice_server">Database port:</label><br /><span></span></dt>
		<dd><input type="text" id="groupoffice_server" size="40" name="config[groupoffice_port]" value="' . $new['groupoffice_port'] . '" /></dd>
	</dl>
		';

	// These are fields required in the config table
	return array(
		'tpl'		=> $tpl,
		'config'	=> array('groupoffice_server', 'groupoffice_database', 'groupoffice_user', 'groupoffice_pass', 'groupoffice_port')
	);
}

?>