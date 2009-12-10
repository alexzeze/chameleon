<?php
//Uncomment this line in new translations!
require($GO_LANGUAGE->get_fallback_language_file('email'));
$lang['email']['name'] = 'E-mail';
$lang['email']['description'] = 'Webový e-mailový klient. Každý uživatel může  posílat a přijímat e-maily nebo přeposílat.';

$lang['link_type'][9]='E-mail';

$lang['email']['feedbackNoReciepent'] = 'Nezadali jste příjemce';
$lang['email']['feedbackSMTPProblem'] = 'Došlo k problému při komunikaci s SMTP: ';
$lang['email']['feedbackUnexpectedError'] = 'Došlo k nečekanému problému s úpravou emailu: ';
$lang['email']['feedbackCreateFolderFailed'] = 'Chyba při vytváření složky';
$lang['email']['feedbackDeleteFolderFailed'] = 'Chyba při mazání složky';
$lang['email']['feedbackSubscribeFolderFailed'] = 'Nepodařilo se přihlásit složky';
$lang['email']['feedbackUnsubscribeFolderFailed'] = 'Nepodařilo se odhlásit od složky';
$lang['email']['feedbackCannotConnect'] = 'Nelze se připojit k %1$s<br /><br />The mail server returned: %2$s';
$lang['email']['inbox'] = 'Příchozí pošta';

$lang['email']['spam']='Spam';
$lang['email']['trash']='Koš';
$lang['email']['sent']='Odeslaná pošta';
$lang['email']['drafts']='Koncepty';

$lang['email']['no_subject']='Žádný předmět';
$lang['email']['to']='Příjemce';
$lang['email']['from']='Odesílatel';
$lang['email']['subject']='Předmět';
$lang['email']['no_recipients']='Žádný příjemce';
$lang['email']['original_message']='--- Původní zpráva ---';
$lang['email']['attachments']='Přílohy';

$lang['email']['notification_subject']='Přečtení: %s';
$lang['email']['notification_body']='Vaše zpráva s předmětem "%s" byla zobrazena v %s';

$lang['email']['errorGettingMessage']='Nelze přijmout zprávy ze serveru';
$lang['email']['no_recipients_drafts']='Žádný příjemce';
$lang['email']['usage_limit'] = '%s z %s používáno';
$lang['email']['usage'] = '%s používáno';

$lang['email']['event']='Událost';
$lang['email']['calendar']='kalendář';

$lang['email']['quotaError']="Vaše schránka je plná. Nejdříve vyprázdněte koš. Když je koš prázdný a pořád máte plnou schránku, musíte zakázat složku koše pro mazání zpráv z ostatních složek. Zakázat složku můžete zde:\n\nNastavení -> Účty -> Váš účet -> Složky.";

$lang['email']['draftsDisabled']="Zpráve nemůže být uložena, protože složka 'Koncept' je zakázaná.<br /><br />Jděte do Nastavení -> Účty -> Váš účet -> Složky a nakonfigurujte ji.";
$lang['email']['noSaveWithPop3']='Zpráva nemůže být uložena, protože Váš POP3 účet tuto funkci nepodporuje.';

$lang['email']['goAlreadyStarted']='Group-Office byl spuštěn a zpráva byla vytvořena. Nyní můžete toto okno zavřít a přejít do Group-office k úpravě zprávy.';

//At Tuesday, 07-04-2009 on 8:58 Group-Office Administrator <test@intermeshdev.nl> wrote:
$lang['email']['replyHeader']='Dne %s, %s v %s %s napsal:';
