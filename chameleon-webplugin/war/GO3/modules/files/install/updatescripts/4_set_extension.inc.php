<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

$updb=new db();

$sql = "SELECT id,name FROM fs_files";
$db->query($sql);

while($db->next_record())
{
	$file['id']=$db->f('id');
	$file['extension']=File::get_extension($db->f('name'));

	$updb->update_row('fs_files', 'id', $file);
}


?>
