<?php

if(!empty($GO_CONFIG->serverclient_domains))
{
	global $GO_CONFIG, $GO_MODULES, $GO_USERS;

	$domains = explode(',', $GO_CONFIG->serverclient_domains);
	
	foreach($domains as $domain)
	{
		if(!empty($domain))
		{
			require_once ($GO_CONFIG->root_path."modules/postfixadmin/classes/postfixadmin.class.inc.php");
			$postfixadmin = new postfixadmin();

			$d['domain']=$domain;
			$d['user_id']=1;
			$d['transport']='virtual';
			$d['active']='1';
			$d['acl_read']=$GO_SECURITY->get_new_acl('domain');
			$d['acl_write']=$GO_SECURITY->get_new_acl('domain');

			$mailbox['domain_id']=$postfixadmin->add_domain($d);
			$mailbox['maildir']=$domain.'/admin/';
			$mailbox['username']='admin@'.$domain;
			$mailbox['active']='1';
			$mailbox['password']=md5('admin');

			$postfixadmin->add_mailbox($mailbox);

			$alias['active']='1';
			$alias['goto']=$mailbox['username'];
			$alias['address']=$mailbox['username'];
			$alias['domain_id']=$mailbox['domain_id'];

			$postfixadmin->add_alias($alias);


			if(isset($GO_MODULES->modules['email']))
			{
				require_once($GO_MODULES->modules['email']['class_path'].'email.class.inc.php');

				$email = new email();

				$user = $GO_USERS->get_user(1);

				$account['user_id']=1;
				$account['mbroot'] = $GO_CONFIG->serverclient_mbroot;
				$account['use_ssl'] = $GO_CONFIG->serverclient_use_ssl;
				$account['novalidate_cert'] = $GO_CONFIG->serverclient_novalidate_cert;
				$account['type']=$GO_CONFIG->serverclient_type;
				$account['host']=$GO_CONFIG->serverclient_host;
				$account['port']=$GO_CONFIG->serverclient_port;
				$account['username']=$mailbox['username'];
				$account['password']='admin';
				$account['name']=String::format_name($user);
				$account['email']=$mailbox['username'];
				$account['smtp_host']=$GO_CONFIG->serverclient_smtp_host;
				$account['smtp_port']=$GO_CONFIG->serverclient_smtp_port;
				$account['smtp_encryption']=$GO_CONFIG->serverclient_smtp_encryption;
				$account['smtp_username']=$GO_CONFIG->serverclient_smtp_username;
				$account['smtp_password']=$GO_CONFIG->serverclient_smtp_password;


				$account['id'] = $email->add_account($account);

				if($account['id']>0)
				{
					//get the account because we need special folder info
					$account = $email->get_account($account['id']);
					$email->synchronize_folders($account);
				}
			}
		}
	}
}
