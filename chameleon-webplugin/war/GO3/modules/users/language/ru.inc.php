<?php
/**
 * Russian translation
 * By Valery Yanchenko (utf-8 encoding)
 * vajanchenko@hotmail.com
 * 10 December 2008
*/
//Uncomment this line in new translations!
require($GO_LANGUAGE->get_fallback_language_file('users'));
$lang['users']['name'] = 'Пользователи';
$lang['users']['description'] = 'Модуль администрирования; Управление системными пользователями.';

$lang['users']['deletePrimaryAdmin'] = 'Вы не можете удалить главного администратора';
$lang['users']['deleteYourself'] = 'Вы не можете удалить самого себя';

$lang['link_type'][8]=$us_user = 'Пользователь';

$lang['users']['error_username']='Вы ввели недопустимый символ в имени пользователя';
$lang['users']['error_username_exists']='Такое имя пользователя уже существует';
$lang['users']['error_email_exists']='Извините, такой e-mail адрес уже зарегистрирован.';
$lang['users']['error_match_pass']='Пароли не совпадают';
$lang['users']['error_email']='Вы ввели неверный e-mail адрес';

$lang['users']['imported']='Импортировано %s пользователей';
$lang['users']['failed']='Ошибка';

$lang['users']['incorrectFormat']='Формат CSV Файла некоректен';