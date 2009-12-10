<?php
/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @copyright Copyright Intermesh
 * @version $Id: en.inc.php 1131 2008-10-13 18:12:25Z mschering $
 * @author Merijn Schering <mschering@intermesh.nl>
 */

//This is a translation by hodrag. If you have questions please e-mail to hodrag@gmail.com , modify chinese traditional by quincy
require($GO_LANGUAGE->get_fallback_language_file('addressbook'));
$lang['addressbook']['name'] = '通訊錄';
$lang['addressbook']['description'] = '連絡人管理模組.';



$lang['addressbook']['allAddressbooks'] = '所有通訊錄';
$lang['common']['addressbookAlreadyExists'] = '你要建立的通訊錄已經存在';
$lang['addressbook']['notIncluded'] = '不能匯入';

$lang['addressbook']['comment'] = '備註';
$lang['addressbook']['bankNo'] = '銀行帳號'; 
$lang['addressbook']['vatNo'] = 'VAT number';
$lang['addressbook']['contactsGroup'] = '組';

$lang['link_type'][2]=$lang['addressbook']['contact'] = '連絡人';
$lang['link_type'][3]=$lang['addressbook']['company'] = '公司';

$lang['addressbook']['customers'] = '客戶';
$lang['addressbook']['suppliers'] = '供應商';
$lang['addressbook']['prospects'] = '潛在客戶';


$lang['addressbook']['contacts'] = '連絡人';
$lang['addressbook']['companies'] = '公司';

?>
