<?php
//Uncomment this line in new translations!
require($GO_LANGUAGE->get_fallback_language_file('users'));

$lang['users']['name'] = 'Gebruikers';
$lang['users']['description'] = 'Beheren van de gebruikers';

$lang['users']['deletePrimaryAdmin'] = 'U kunt de primaire Administrator niet verwijderen';
$lang['users']['deleteYourself'] = 'U kunt zichzelf niet verwijderen';

$lang['link_type'][8]=$us_user = 'Gebruiker';

$lang['users']['error_username']='Er staan ongeldige tekens in de gebruikersnaam';
$lang['users']['error_username_exists']='Sorry, die gebruikersnaam bestaat al';
$lang['users']['error_email_exists']='Sorry, dat e-mail adres staat hier al geregistreerd.';
$lang['users']['error_match_pass']='De wachtwoorden kwamen niet overeen';
$lang['users']['error_email']='U heeft een ongeldig e-mail adres ingevoerd';

$lang['users']['imported']='%s gebruikers geïmporteerd';
$lang['users']['failed']='Mislukt';

$lang['users']['incorrectFormat']='Bestand was niet in het jusite CSV formaat';