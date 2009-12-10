<?php
define('CONFIG_FILE', '/etc/groupoffice/servermanager.group-office.com/config.php');
require('../../../Group-Office.php');

require('../classes/postfixadmin.class.inc.php');

$pa = new postfixadmin();
$pa2 = new postfixadmin();
$pa->get_domains();

$doreal=true;

while($pa->next_record())
{
	
			$admin['username']=$pa->f('domain');
			
			$pass = $GO_USERS->random_password();
			$admin['password']=md5($pass);
			$admin['first_name']=$pa->f('domain');
			$admin['last_name']='admin';
			$admin['email']='admin@'.$pa->f('domain');
			if($doreal)
			{
				
				$up_domain['user_id']=$GO_USERS->add_user($admin);

				if($up_domain['user_id']>0)
				{
				
					$GO_SECURITY->add_user_to_acl($pa->f('acl_write'), $up_domain['user_id']);
					$GO_SECURITY->add_user_to_acl($pa->f('acl_read'), $up_domain['user_id']);
				
					$up_domain['id']=$pa->f('id');

					
					$pa2->update_domain($up_domain);
					}
				
			}
			
			echo $admin['username'].':'.$pass."\n";
	
}
