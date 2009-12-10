<?php
$updates[]="CREATE TABLE IF NOT EXISTS `go_links_12` (
  `id` int(11) NOT NULL,
  `folder_id` int(11) NOT NULL,
  `link_id` int(11) NOT NULL,
  `link_type` int(11) NOT NULL,
  `description` varchar(100) NOT NULL,
  KEY `link_id` (`link_id`,`link_type`),
  KEY `id` (`id`,`folder_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;";

$updates[]="ALTER TABLE `ta_tasks` CHANGE `completion_time` `completion_time` INT( 11 ) NULL";
$updates[]="ALTER TABLE `ta_tasks` CHANGE `completion_time` `completion_time` INT( 11 ) NOT NULL DEFAULT '0'";
$updates[]="ALTER TABLE `ta_tasks` CHANGE `rrule` `rrule` VARCHAR( 50 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL";

$updates[]="CREATE TABLE IF NOT EXISTS `ta_settings` (
  `user_id` int(11) NOT NULL,
  `reminder_days` int(11) NOT NULL,
  `reminder_time`  VARCHAR( 10 ) NOT NULL,
  `remind` enum('0','1') NOT NULL,
  PRIMARY KEY  (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;";

$updates[]="ALTER TABLE `ta_tasks` ADD `files_folder_id` INT NOT NULL;";

$updates[]="ALTER TABLE `ta_settings` ADD `default_tasklist_id` INT NOT NULL ";


$updates[]="ALTER TABLE `ta_lists` ADD `shared_acl` BOOL NOT NULL ";
?>