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
 * @version $Id: en.inc.php 1616 2008-12-17 16:16:28Z mschering $
 * @author Merijn Schering <mschering@intermesh.nl>
 */

//Uncomment this line in new translations!
require($GO_LANGUAGE->get_fallback_language_file('addressbook'));
$lang['addressbook']['name'] = 'Adressebog';
$lang['addressbook']['description'] = 'Modul til håndtering af alle kontakter.';



$lang['addressbook']['allAddressbooks'] = 'Alle adressebøger';
$lang['common']['addressbookAlreadyExists'] = 'Adressebogen du forsøger at oprette eksisterer allerede';
$lang['addressbook']['notIncluded'] = 'Importer ikke';

$lang['addressbook']['comment'] = 'Kommentar';
$lang['addressbook']['bankNo'] = 'Bankkonto'; 
$lang['addressbook']['vatNo'] = 'CVR-nr.';
$lang['addressbook']['contactsGroup'] = 'Gruppe';

$lang['link_type'][2]=$lang['addressbook']['contact'] = 'Kontakt';
$lang['link_type'][3]=$lang['addressbook']['company'] = 'Virksomhed';

$lang['addressbook']['customers'] = 'Kunder';
$lang['addressbook']['suppliers'] = 'Leverandører';
$lang['addressbook']['prospects'] = 'Prospekter';


$lang['addressbook']['contacts'] = 'Kontakter';
$lang['addressbook']['companies'] = 'Virksomheder';

$lang['addressbook']['newContactAdded']='Ny kontakt tilføjet';
$lang['addressbook']['newContactFromSite']='En ny kontakt er blevet tilføjet via en formular på hjemmesiden.';
$lang['addressbook']['clickHereToView']='Klik for at se kontakten';
?>