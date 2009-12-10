<?php
$module = $this->get_module('notes');

global $GO_LANGUAGE, $GO_USERS, $GO_SECURITY;

require($GLOBALS['GO_LANGUAGE']->get_language_file('notes'));

require_once($module['class_path'].'notes.class.inc.php');
$notes = new notes();

$category['name']=$lang['notes']['general'];
$category['user_id']=1;
$category['acl_read']=$GO_SECURITY->get_new_acl('category', 1);
$category['acl_write']=$GO_SECURITY->get_new_acl('category', 1);

$notes->add_category($category);
$GLOBALS['GO_SECURITY']->add_group_to_acl($GO_CONFIG->group_everyone, $category['acl_write']);

$GO_USERS->get_users();
while($GO_USERS->next_record())
{
	$user = $GO_USERS->record;		
	
	$category['name']=String::format_name($user);
	$category['user_id']=$user['id'];
	$category['acl_read']=$GO_SECURITY->get_new_acl('category', $user['id']);
	$category['acl_write']=$GO_SECURITY->get_new_acl('category', $user['id']);
	
	$notes->add_category($category);
}
