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
 * @version $Id: nl.inc.php 1616 2008-12-17 16:16:28Z mschering $
 * @author Merijn Schering <mschering@intermesh.nl>
 */

require($GO_LANGUAGE->get_fallback_language_file('addressbook'));
$lang['addressbook']['name'] = 'Adresboek';
$lang['addressbook']['description'] = 'Module om alle contacten te beheren.';

$lang['addressbook']['allAddressbooks'] = 'Alle Adresboeken';
$lang['common']['addressbookAlreadyExists'] = 'Het adresboek wat je probeert te maken bestaat al';
$lang['addressbook']['notIncluded'] = 'Niet importeren';

$lang['addressbook']['comment'] = 'Opmerking';
$lang['addressbook']['bankNo'] = 'Bankrekeningnummer'; 
$lang['addressbook']['vatNo'] = 'BTW-nummer';
$lang['addressbook']['contactsGroup'] = 'Groep';

$lang['link_type'][2]=$lang['addressbook']['contact'] = 'Contact';
$lang['link_type'][3]=$lang['addressbook']['company'] = 'Bedrijf';

$lang['addressbook']['customers'] = 'Klanten';
$lang['addressbook']['suppliers'] = 'Leveranciers';
$lang['addressbook']['prospects'] = 'Potentiële klanten';

$lang['addressbook']['contacts']= 'Contactpersonen';
$lang['addressbook']['companies']= 'Bedrijven';

$lang['addressbook']['newContactAdded']='Nieuw contactpersoon toegevoegd';
$lang['addressbook']['newContactFromSite']='Een nieuw contactpersoon was via een websiteformulier toegevoegd';
$lang['addressbook']['clickHereToView']='Klik hier om de contactpersoon te bekijken';
?>