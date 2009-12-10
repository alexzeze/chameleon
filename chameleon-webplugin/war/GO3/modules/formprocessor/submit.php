<?php
/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: action.php 1524 2008-12-03 09:35:45Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */

require_once("../../Group-Office.php");

require_once($GO_CONFIG->root_path.'modules/formprocessor/classes/formprocessor.class.inc.php');

$ajax = !isset($_POST['return_to']);

$return_to = isset($_POST['return_to']) ? $_POST['return_to'] : '';

$fp = new formprocessor();

try
{
	$fp->process_form();
	$response['success']= true;
}
catch(Exception $e)
{
	$response['feedback']=$e->getMessage();
	$response['success']= false;
	
	$_POST['feedback']=$e->getMessage();
}

if($ajax)
{
	echo json_encode($response);
}else
{
	?>
	<html>
	<body onload="document.return.submit();">
	<form method="POST" name="return" action="<?php echo $return_to; ?>">
	<input type="hidden" name="submitted" value="true" />
	<?php 
	foreach($_POST as $key=>$value)
	{
		if(is_string($value))
			echo '<input type="hidden" name="'.htmlspecialchars($key, ENT_QUOTES, 'UTF-8').'" value="'.htmlspecialchars($value, ENT_QUOTES, 'UTF-8').'" />';
	}
	?>
	</form>
	</body>
	</html>
	<?php 	
}
?>