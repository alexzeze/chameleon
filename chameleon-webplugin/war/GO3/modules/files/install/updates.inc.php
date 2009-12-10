<?php
$updates[] = "script:1.inc.php";
//do it twice because it went wrong the first time on some installations
$updates[] = "script:1.inc.php";
$updates[] = "script:2.inc.php";

$updates[] = "ALTER TABLE `fs_folders` CHANGE `path` `path` VARCHAR( 255 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL";  

$updates[]="UPDATE fs_files SET path=replace(path, '".$GO_CONFIG->file_storage_path."','');";
$updates[]="UPDATE fs_folders SET path=replace(path, '".$GO_CONFIG->file_storage_path."','');";
$updates[]="ALTER TABLE `fs_folders` ADD `thumbs` ENUM( '0', '1' ) NOT NULL DEFAULT '0';";

$updates[]="ALTER TABLE `fs_folders` CHANGE `comments` `comments` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NULL";
$updates[]="ALTER TABLE `fs_files` CHANGE `comments` `comments` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NULL";  
$updates[]="ALTER TABLE `fs_files` CHANGE `locked_user_id` `locked_user_id` INT( 11 ) NOT NULL DEFAULT '0'";
$updates[]="ALTER TABLE `fs_templates` CHANGE `content` `content` MEDIUMBLOB NOT NULL";

$updates[]="CREATE TABLE IF NOT EXISTS `fs_new_files` (
  `file_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  KEY `file_id` (`file_id`,`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;";

//twice on purpose
$updates[]="CREATE TABLE IF NOT EXISTS `fs_new_files` (
  `file_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  KEY `file_id` (`file_id`,`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;";






$updates[]="ALTER TABLE `fs_files` ADD `folder_id` INT NOT NULL AFTER `id`";
$updates[]="ALTER TABLE `fs_files` ADD `name` VARCHAR( 255 ) NOT NULL AFTER `folder_id`";
$updates[]="ALTER TABLE `fs_files` ADD `size` INT NOT NULL AFTER `mtime`";
$updates[]="ALTER TABLE `fs_folders` ADD `parent_id` INT( 11 ) NOT NULL AFTER `id`;";
$updates[]="ALTER TABLE `fs_folders` ADD `name` VARCHAR( 255 ) NOT NULL AFTER `parent_id`";
$updates[]="ALTER TABLE `fs_folders` ADD `ctime` INT NOT NULL ,
ADD `mtime` INT NOT NULL";

//sometimes id wan't unique
$updates[]="RENAME TABLE `fs_files`  TO `fs_files_old` ;";
$updates[]="CREATE TABLE fs_files SELECT * FROM fs_files_old GROUP BY id;";
$updates[]="RENAME TABLE `fs_folders`  TO `fs_folders_old` ;";
$updates[]="CREATE TABLE fs_folders SELECT * FROM fs_folders_old GROUP BY id;";


$updates[]="ALTER TABLE `fs_files` ADD PRIMARY KEY ( `id` )"; 
$updates[]="ALTER TABLE `fs_folders` ADD PRIMARY KEY ( `id` ) ";
$updates[]="ALTER TABLE `fs_folders` DROP INDEX `link_id_2`"; 
$updates[]="ALTER TABLE `fs_folders` DROP INDEX `visible`"; 

$updates[]="ALTER TABLE `fs_notifications` ADD `folder_id` INT NOT NULL FIRST";
$updates[]="update fs_notifications n set folder_id=(select path from fs_folders where path=n.path);";

$updates[]="ALTER TABLE `fs_notifications` DROP PRIMARY KEY , ADD PRIMARY KEY ( `folder_id` , `user_id` ) ;";

$updates[]="ALTER TABLE `fs_folders` ADD `readonly` ENUM( '0', '1' ) NOT NULL ";


$updates[] = "ALTER TABLE `fs_folders` ADD INDEX ( `name` ) ;";
$updates[] = "ALTER TABLE `fs_files` ADD INDEX ( `folder_id` ) ";
$updates[] = "ALTER TABLE `fs_files` ADD INDEX ( `name` )";
$updates[] = "ALTER TABLE `fs_folders` ADD INDEX ( `parent_id` ) ";

$updates[] = "script:3_convert_old_paths.inc.php";

$updates[] = "ALTER TABLE `fs_folders` ADD INDEX (`visible`)";

$updates[] = "ALTER TABLE `fs_files` ADD `extension` VARCHAR( 4 ) NOT NULL ,
ADD INDEX ( extension )";

$updates[] = "script:4_set_extension.inc.php";

