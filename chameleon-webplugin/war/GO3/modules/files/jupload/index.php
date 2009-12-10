<?php
require('../../../Group-Office.php');
header('Content-Type: text/html; charset=UTF-8');

$GO_SECURITY->html_authenticate('files');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Group-Office - File Upload Applet</title>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
</head>
<body>
<p style="font:12px Arial;"><?php echo $lang['common']['uploadMultipleFiles']; ?></p>
        <applet
            code="wjhk.jupload2.JUploadApplet"
            name="JUpload"
            archive="<?php echo $GO_CONFIG->control_url; ?>wjhk.jupload.jar"
            width="640"
            height="400"
            mayscript
            alt="The java pugin must be installed.">
            <param name="lang" value="<?php 
            echo isset($lang['jupload_lang']) ? $lang['jupload_lang'] : $GO_LANGUAGE->language;            
            ?>" />
            <param name="lookAndFeel" value="system" />
            <param name="postURL" value="upload.php?id=<?php echo $_REQUEST['id']; ?>" />
            <param name="afterUploadURL" value="javascript:opener.GO.currentFilesStore.reload();if(%success%){window.close();}" />
            <param name="showLogWindow" value="true" />
            <param name="maxChunkSize" value="1048576" />    
            <param name="maxFileSize" value="<?php echo intval($GO_CONFIG->max_file_size); ?>" />
            <param name="nbFilesPerRequest" value="5" />
            Java 1.5 or higher plugin required. 
        </applet>

</body>
</html>