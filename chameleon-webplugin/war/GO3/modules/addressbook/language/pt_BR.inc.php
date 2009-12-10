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

//Uncomment this line in new translations!
require($GO_LANGUAGE->get_fallback_language_file('addressbook'));
$lang['addressbook']['name'] = 'Contatos';
$lang['addressbook']['description'] = 'Módulo para administrar todos os contatos.';



$lang['addressbook']['allAddressbooks'] = 'Todos os contatos';
$lang['common']['addressbookAlreadyExists'] = 'O contato que você está criando já existe';
$lang['addressbook']['notIncluded'] = 'Não importe';

$lang['addressbook']['comment'] = 'Comentário';
$lang['addressbook']['bankNo'] = 'Nro. banco'; 
$lang['addressbook']['vatNo'] = 'Nro. VAT';
$lang['addressbook']['contactsGroup'] = 'Grupo';

$lang['link_type'][2]=$lang['addressbook']['contact'] = 'Contato';
$lang['link_type'][3]=$lang['addressbook']['company'] = 'Empresa';

$lang['addressbook']['customers'] = 'Clientes';
$lang['addressbook']['suppliers'] = 'Fornecedores';
$lang['addressbook']['prospects'] = 'Prospectos';


$lang['addressbook']['contacts'] = 'Contatos';
$lang['addressbook']['companies'] = 'Empresas';

?>