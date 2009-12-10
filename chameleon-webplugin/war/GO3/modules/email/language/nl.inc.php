<?php
//Uncomment this line in new translations!
require($GO_LANGUAGE->get_fallback_language_file('email'));
$lang['email']['name'] = 'Email';
$lang['email']['description'] = 'Uitgebreide Web-based email client. Het is voor iedere gebruiker mogelijk om emails te verzenden en te ontvangen.';
$lang['email']['feedbackNoReciepent'] = 'U heeft geen ontvanger ingevuld';
$lang['email']['feedbackSMTPProblem'] = 'Er was een probleem in de communicatie met SMTP: ';
$lang['email']['feedbackUnexpectedError'] = 'Er was een onverwacht probleem bij het opstellen van de email: ';
$lang['email']['feedbackCreateFolderFailed'] = 'Map kan niet worden gemaakt';
$lang['email']['feedbackSubscribeFolderFailed'] = 'Fout bij het opslaan van de gegevens';
$lang['email']['feedbackUnsubscribeFolderFailed'] = 'Fout bij het opslaan van de gegevens';
$lang['email']['feedbackCannotConnect'] = 'Kan geen verbinding maken met %1$s op poort %3$s<br /><br />De mail server antwoorde: %2$s';
$lang['email']['inbox'] = 'Postvak in';

$lang['email']['spam']='Spam';
$lang['email']['trash']='Prullenbak';
$lang['email']['sent']='Verzonden items';
$lang['email']['drafts']='Concepten';

$lang['email']['no_subject']='Geen onderwerp';
$lang['email']['to']='Naar';
$lang['email']['from']='Van';
$lang['email']['subject']='Onderwerp';
$lang['email']['no_recipients']='Vertrouwelijke ontvangers';
$lang['email']['original_message']='--- Origineel bericht volgt ---';
$lang['email']['attachments']='Bijlagen';
$lang['link_type'][9]='E-mail';

$lang['email']['notification_subject']='Gelezen: %s';
$lang['email']['notification_body']='Uw bericht met onderwerp "%s" is getoond op %s';

$lang['email']['errorGettingMessage']='Kon bericht niet ophalen van server';
$lang['email']['no_recipients_drafts']='Geen ontvangers';
$lang['email']['usage_limit'] = '%s van %s gebruikt';
$lang['email']['usage'] = '%s gebruikt';
$lang['email']['feedbackDeleteFolderFailed']= 'Failed to delete folder';

$lang['email']['event']='Afspraak';
$lang['email']['calendar']='agenda';

$lang['email']['quotaError']="Uw mailbox is vol. Leeg eerst uw 'Prullenbak' map. Indien die map al leeg is en uw mailbox is nog steeds vol, dan dient u de 'Prullenbak' map uit te schakelen om berichten uit andere mappen te kunnen verwijderen. U kunt de map uitschakkelen bij:\n\nInstellingen -> Accounts -> Dubbelklik account -> Mappen.";
$lang['email']['draftsDisabled']="Het bericht kon niet worden opgeslagen omdat de 'Concepten' map is uitgeschakeld.<br /><br />Ga naar Instellingen -> Accounts -> Dubbelklik account -> Mappen om deze in te stellen.";
$lang['email']['noSaveWithPop3']='Het bericht kon niet worden opgeslagen omdat POP3 accounts dit niet ondersteunen.';

$lang['email']['goAlreadyStarted']='Group-Office was already started. The e-mail composer is now loaded in Group-Office. Close this window and compose your message in Group-Office.';

//At Tuesday, 07-04-2009 on 8:58 Group-Office Administrator <test@intermeshdev.nl> wrote:
$lang['email']['replyHeader']='Op %s, %s om %s schreef %s:';

$lang['email']['noUidNext']='Uw mailserver ondersteund geen UIDNEXT. De \'Concepten\' map is nu automatisch uitgeschakeld voor deze account.';