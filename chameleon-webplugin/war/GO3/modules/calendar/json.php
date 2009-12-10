<?php
/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: json.php 2584 2009-05-26 14:21:03Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */


require('../../Group-Office.php');

$GO_SECURITY->json_authenticate('calendar');

require($GO_LANGUAGE->get_language_file('calendar'));

require_once ($GO_MODULES->modules['calendar']['class_path']."calendar.class.inc.php");
$cal = new calendar();

$max_description_length=800;


$task=isset($_REQUEST['task']) ? ($_REQUEST['task']) : '';

try{

	switch($task)
	{

		case 'summary':
			//get the local times
			$local_time = time();
			$year = date("Y", $local_time);
			$month = date("m", $local_time);
			$day = date("j", $local_time);


			$timezone_offset = Date::get_timezone_offset(mktime(0, 0, 0, $month, $day, $year))*3600;
			$interval_start_time = mktime(0, 0, 0, $month, $day, $year)-$timezone_offset;
			$interval_end_time = mktime(0, 0, 0, $month, $day+2, $year)-$timezone_offset;
			$events = $cal->get_events_in_array(array(),$GO_SECURITY->user_id, $interval_start_time, $interval_end_time);

			$today_end = mktime(0, 0, 0, $month, $day+1, $year)-$timezone_offset;

			$response['count']=0;
			$response['results']=array();
			foreach($events as $event)
			{
				if($event['all_day_event'] == '1')
				{
					$date_format = $_SESSION['GO_SESSION']['date_format'];
				}else
				{
					if (date($_SESSION['GO_SESSION']['date_format'], $event['start_time']) != date($_SESSION['GO_SESSION']['date_format'], $event['end_time'])) {
						$date_format = $_SESSION['GO_SESSION']['date_format'].' '.$_SESSION['GO_SESSION']['time_format'];
					} else {
						$date_format = $_SESSION['GO_SESSION']['time_format'];
					}
				}
				
				$response['results'][] = array(
					'id'=>$response['count'],
					'event_id'=> $event['id'],
					'name'=> htmlspecialchars($event['name'],ENT_COMPAT,'UTF-8'),
					'time'=>date($date_format, $event['start_time']),
					'start_time'=> date('Y-m-d H:i', $event['start_time']),
					'end_time'=> date('Y-m-d H:i', $event['end_time']),
					'location'=>htmlspecialchars($event['location'], ENT_COMPAT, 'UTF-8'),
					'description'=>nl2br(htmlspecialchars(String::cut_string($event['description'],$max_description_length), ENT_COMPAT, 'UTF-8')),
					'private'=>($event['private']=='1' && $GO_SECURITY->user_id != $event['user_id']),
					'repeats'=>!empty($event['rrule']),
					'day'=>$event['start_time']<$today_end ? $lang['common']['today'] : $lang['common']['tomorrow']
				);
				$response['count']++;
			}

			break;

		/*case 'invitation':

			require_once($GO_CONFIG->class_path.'mail/RFC822.class.inc');
			require_once($GO_CONFIG->class_path.'filesystem.class.inc');

			$RFC822 = new RFC822();

			$response['success']=true;

			$event_id = ($_REQUEST['event_id']);
			$event = $cal->get_event($event_id);

			$response['data']['subject']=$lang['calendar']['appointment'].$event['name'];

			$response['data']['body']='<p>'.$lang['calendar']['invited'].'</p>'.
			$cal->event_to_html($event).
				'<p>'.$lang['calendar']['acccept_question'].'</p>'.
				'<a href="'.$GO_MODULES->modules['calendar']['full_url'].'invitation.php?event_id='.$event_id.'&task=accept&email=%email%">'.$lang['calendar']['accept'].'</a>'.
				'&nbsp;|&nbsp;'.
				'<a href="'.$GO_MODULES->modules['calendar']['full_url'].'invitation.php?event_id='.$event_id.'&task=decline&email=%email%">'.$lang['calendar']['decline'].'</a>';

			$response['replace_personal_fields']=true;

			$participants=array();
			$cal->get_participants($event_id);
			while($cal->next_record())
			{
				if($cal->f('user_id')!=$GO_SECURITY->user_id)
				{
					$participants[] = $RFC822->write_address($cal->f('name'), $cal->f('email'));
				}
			}

			$response['data']['to']=implode(',', $participants);

			//create ics attachment
			require_once ($GO_MODULES->modules['calendar']['class_path'].'go_ical.class.inc');
			$ical = new go_ical();
			$ics_string = $ical->export_event($event_id);

			$name = File::strip_invalid_chars($event['name']).'.ics';

			$dir=$GO_CONFIG->tmpdir.'attachments/';
			filesystem::mkdir_recursive($dir);

			$tmp_file = $dir.$name;

			$fp = fopen($tmp_file,"wb");
			fwrite ($fp,$ics_string);
			fclose($fp);

			$response['data']['attachments']=array(array(
					'tmp_name'=>$tmp_file,
					'name'=>$name,
					'size'=>strlen($ics_string),
					'type'=>File::get_filetype_description('ics')					
			));



			break;*/
		

		case 'event':

			require_once($GO_CONFIG->class_path.'ical2array.class.inc');
			require_once($GO_CONFIG->class_path.'Date.class.inc.php');
				
			$event = $cal->get_event($_REQUEST['event_id']);
				
			if(!$event)
			{
				throw new DatabaseSelectException();
			}
			$calendar = $cal->get_calendar($event['calendar_id']);
				
			$response['data']['write_permission']=$GO_SECURITY->has_permission($GO_SECURITY->user_id, $calendar['acl_write']);
			if((!$response['data']['write_permission'] && !$GO_SECURITY->has_permission($GO_SECURITY->user_id, $calendar['acl_read'])) ||
			($event['private']=='1' && $event['user_id']!=$GO_SECURITY->user_id))
			{
				throw new AccessDeniedException();
			}
				
			$response['data']=array_merge($response['data'], $cal->event_to_json_response($event));
			$response['data']['calendar_name']=$calendar['name'];
			$response['success']=true;

			break;
		case 'events':

			//setlocale(LC_ALL, 'nl_NL@euro');

			//return all events for a given period
			$calendar_id=isset($_REQUEST['calendar_id']) ? ($_REQUEST['calendar_id']) : 0;
			$calendars=isset($_REQUEST['calendars']) ? json_decode(($_REQUEST['calendars'])) : array($calendar_id);
			//$view_id=isset($_REQUEST['view_id']) ? ($_REQUEST['view_id']) : 0;
			$start_time=isset($_REQUEST['start_time']) ? strtotime($_REQUEST['start_time']) : 0;
			$end_time=isset($_REQUEST['end_time']) ? strtotime($_REQUEST['end_time']) : 0;

			$calendar_id=$calendars[0];

			$calendar = $cal->get_calendar($calendar_id);

			$response['write_permission']=$GO_SECURITY->has_permission($GO_SECURITY->user_id, $calendar['acl_write']);
			if(!$response['write_permission'] && !$GO_SECURITY->has_permission($GO_SECURITY->user_id, $calendar['acl_read']))
			{
				throw new AccessDeniedException();
			}
			//echo $calendar['acl_write'];

			$events = $cal->get_events_in_array($calendars, 0,
			$start_time,
			$end_time
			);
			$response['results']=array();
			$response['count']=0;
			foreach($events as $event)
			{
				if($event['all_day_event'] == '1')
				{
					$date_format = $_SESSION['GO_SESSION']['date_format'];
				}else
				{
					if (date($_SESSION['GO_SESSION']['date_format'], $event['start_time']) != date($_SESSION['GO_SESSION']['date_format'], $event['end_time'])) {
						$date_format = $_SESSION['GO_SESSION']['date_format'].' '.$_SESSION['GO_SESSION']['time_format'];
					} else {
						$date_format = $_SESSION['GO_SESSION']['time_format'];
					}
				}

			
				$private = ($event['private']=='1' && $GO_SECURITY->user_id != $event['user_id']);
				if($private)
				{
					$event['name']=$lang['calendar']['private'];
					$event['description']='';
					$event['location']='';					
				}

				$response['results'][] = array(
'id'=>$response['count'],
'event_id'=> $event['id'],
'name'=> htmlspecialchars($event['name'], ENT_COMPAT, 'UTF-8'),
'time'=>date($date_format, $event['start_time']),
'start_time'=> date('Y-m-d H:i', $event['start_time']),
'end_time'=> date('Y-m-d H:i', $event['end_time']),
'location'=>htmlspecialchars($event['location'], ENT_COMPAT, 'UTF-8'),
'description'=>nl2br(htmlspecialchars(String::cut_string($event['description'],$max_description_length), ENT_COMPAT, 'UTF-8')),
'background'=>$event['background'],
'private'=>($event['private']=='1' && $GO_SECURITY->user_id != $event['user_id']),
'repeats'=>!empty($event['rrule']),
'day'=>$lang['common']['full_days'][date('w', $event['start_time'])].' '.date($_SESSION['GO_SESSION']['date_format'], $event['start_time'])
				);
				$response['count']++;
			}
			break;

		case 'view_events':

			$view_id = ($_REQUEST['view_id']);
			$start_time=isset($_REQUEST['start_time']) ? strtotime($_REQUEST['start_time']) : 0;
			$end_time=isset($_REQUEST['end_time']) ? strtotime($_REQUEST['end_time']) : 0;

			if(isset($_REQUEST['update_event_id']))
			{
				//an event is moved or resized
				$update_event_id=$_REQUEST['update_event_id'];
				$old_event = $cal->get_event($update_event_id);

				if(isset($_REQUEST['createException']) && $_REQUEST['createException'] =='true')
				{

					$exceptionDate = strtotime(($_REQUEST['exceptionDate']));

					//an instance of a recurring event was modified. We must create an exception for the
					//recurring event.
					$exception['event_id'] = $update_event_id;
					$exception['time'] = mktime(date('G', $old_event['start_time']),date('i', $old_event['start_time']), 0, date('n', $exceptionDate), date('j', $exceptionDate), date('Y', $exceptionDate));

					//die(date('Ymd G:i', $exception['time']));
					$cal->add_exception($exception);

					//now we copy the recurring event to a new single event with the new time
					$update_event['repeat_type']=0;
					$update_event['start_time']=$exception['time'];
					$update_event['end_time']=$exception['time']+$old_event['end_time']-$old_event['start_time'];

					if(isset($_REQUEST['offset']))
					{
						//move an event
						$offset = ($_REQUEST['offset']);


						$update_event['start_time']=$update_event['start_time']+$offset;
						$update_event['end_time']=$update_event['end_time']+$offset;

					}


					if(isset($_REQUEST['offsetDays']))
					{
						//move an event
						$offsetDays = ($_REQUEST['offsetDays']);
						$update_event['start_time'] = Date::date_add($update_event['start_time'], $offsetDays);
						$update_event['end_time'] = Date::date_add($update_event['end_time'], $offsetDays);

					}

					if(isset($_REQUEST['duration']))
					{
						//change duration
						$duration = ($_REQUEST['duration']);
						$update_event['end_time']=$update_event['start_time']+$duration;
					}

					if(isset($_REQUEST['update_calendar_id']))
					{
						$update_event['calendar_id']=$_REQUEST['update_calendar_id'];
					}


					$update_event['id'] = $cal->copy_event($exception['event_id'], $update_event);
				}else
				{
					if(isset($_REQUEST['offset']))
					{
						//move an event
						$offset = ($_REQUEST['offset']);


						$update_event['start_time']=$old_event['start_time']+$offset;
						$update_event['end_time']=$old_event['end_time']+$offset;
					}

					if(isset($_REQUEST['offsetDays']))
					{
						//move an event
						$offsetDays = ($_REQUEST['offsetDays']);
						$update_event['start_time'] = Date::date_add($old_event['start_time'], $offsetDays);
						$update_event['end_time'] = Date::date_add($old_event['end_time'], $offsetDays);
					}

					if(isset($_REQUEST['duration']))
					{
						//change duration
						$duration = ($_REQUEST['duration']);

						$update_event['start_time']=$old_event['start_time'];
						$update_event['end_time']=$old_event['start_time']+$duration;
					}

					if(isset($_REQUEST['update_calendar_id']))
					{
						$update_event['calendar_id']=$_REQUEST['update_calendar_id'];
					}

					$update_event['id']=$update_event_id;
					$cal->update_event($update_event);

					//move the exceptions if a recurrent event is moved
					if($old_event['repeat_type']>0 && isset($offset))
					{
						$cal->move_exceptions(($_REQUEST['update_event_id']), $offset);
					}
				}

			}


			$cal2 = new calendar();
			$response=array();
			$count=0;
			$cal->get_view_calendars($view_id);
			while($cal->next_record())
			{
				$response[$cal->f('id')] = $cal2->get_calendar($cal->f('id'));
				$response[$cal->f('id')]['write_permission'] = $GO_SECURITY->has_permission($GO_SECURITY->user_id, $cal2->f('acl_write'));

				$events = $cal2->get_events_in_array(array($cal->f('id')), 0,
				$start_time,
				$end_time
				);

				$response[$cal->f('id')]['events']=array();

				foreach($events as $event)
				{
					if($event['all_day_event'] == '1')
					{
						$date_format = $_SESSION['GO_SESSION']['date_format'];
					}else
					{
						if (date($_SESSION['GO_SESSION']['date_format'], $event['start_time']) != date($_SESSION['GO_SESSION']['date_format'], $event['end_time'])) {
							$date_format = $_SESSION['GO_SESSION']['date_format'].' '.$_SESSION['GO_SESSION']['time_format'];
						} else {
							$date_format = $_SESSION['GO_SESSION']['time_format'];
						}
					}

		
					$private = ($event['private']=='1' && $GO_SECURITY->user_id != $event['user_id']);				
					if($private)
					{
						$event['name']=$lang['calendar']['private'];
						$event['description']='';
						$event['location']='';					
					}


					$response[$cal->f('id')]['events'][] = array(
					'id'=>$count,
					'calendar_id'=>$cal->f('id'),
					'event_id'=> $event['id'],
					'name'=>htmlspecialchars($event['name'], ENT_COMPAT, 'UTF-8'),
					'start_time'=> date('Y-m-d H:i', $event['start_time']),
					'end_time'=> date('Y-m-d H:i', $event['end_time']),
					'location'=>htmlspecialchars($event['location'], ENT_COMPAT, 'UTF-8'),
					'description'=>nl2br(htmlspecialchars(String::cut_string($event['description'],$max_description_length), ENT_COMPAT, 'UTF-8')),
					'background'=>$event['background'],
					'repeats'=>!empty($event['rrule']),
					'private'=>$private,
					'write_permission'=>$response[$cal->f('id')]['write_permission']
					);
					$count++;
				}
			}
			break;


		case 'calendars':

			$response['total'] = $cal->get_authorized_calendars($GO_SECURITY->user_id);
			if(!$response['total'])
			{
				$cal->get_calendar();
				$response['total'] = $cal->get_authorized_calendars($GO_SECURITY->user_id);
			}
			$response['results']=array();
			while($cal->next_record(DB_ASSOC))
			{
				//$user = $GO_USERS->get_user($cal->f('user_id'));

				//$cal->record['user_name'] = String::format_name($user);
				$response['results'][] = $cal->record;
			}
			break;

		case 'writable_calendars':

			if(isset($_REQUEST['delete_keys']))
			{
				try{
					$response['deleteSuccess']=true;
					$calendars = json_decode(($_REQUEST['delete_keys']));

					foreach($calendars as $calendar_id)
					{
						$calendar = $cal->get_calendar($calendar_id);
						if(!$GO_SECURITY->has_permission($GO_SECURITY->user_id, $calendar['acl_write']))
						{
							throw new AccessDeniedException();
						}
						$cal->delete_calendar($calendar_id);
					}
				}catch(Exception $e)
				{
					$response['deleteSuccess']=false;
					$response['deleteFeedback']=$e->getMessage();
				}
			}
				
			$start = isset($_REQUEST['start']) ? ($_REQUEST['start']) : '0';
			$limit = isset($_REQUEST['limit']) ? ($_REQUEST['limit']) : '0';


			$response['total'] = $cal->get_writable_calendars($GO_SECURITY->user_id, $start, $limit);
			if(!$response['total'])
			{
				$cal->get_calendar();
				$response['total'] = $cal->get_writable_calendars($GO_SECURITY->user_id, $start, $limit);
			}
			$response['results']=array();
			while($cal->next_record(DB_ASSOC))
			{
				$user = $GO_USERS->get_user($cal->f('user_id'));

				$cal->record['user_name'] = String::format_name($user);
				$response['results'][] = $cal->record;
			}
			break;


		case 'view_calendars':

			$view_id = ($_REQUEST['view_id']);

			$cal2 = new calendar();

			$response['total'] = $cal->get_authorized_calendars($GO_SECURITY->user_id);
			if(!$response['total'])
			{
				$cal->get_calendar();
				$response['total'] = $cal->get_authorized_calendars($GO_SECURITY->user_id);
			}
			$response['results']=array();
			while($cal->next_record(DB_ASSOC))
			{
				$user = $GO_USERS->get_user($cal->f('user_id'));

				$cal->record['user_name'] = String::format_name($user);

				$cal->record['selected']=$cal2->is_view_calendar($cal->f('id'), $view_id) ? '1' : '0';

				$response['results'][] = $cal->record;
			}
			break;

		case 'views':


			$response['total'] = $cal->get_authorized_views($GO_SECURITY->user_id);
			$response['results']=array();
			while($cal->next_record(DB_ASSOC))
			{
				$user = $GO_USERS->get_user($cal->f('user_id'));

				$cal->record['user_name'] = String::format_name($user);
				$response['results'][] = $cal->record;
			}
			break;


		case 'writable_views':

			if(isset($_REQUEST['delete_keys']))
			{
				try{
					$response['deleteSuccess']=true;
					$views = json_decode(($_REQUEST['delete_keys']));

					foreach($views as $view_id)
					{
						$view = $cal->get_view($view_id);
						if(!$GO_SECURITY->has_permission($GO_SECURITY->user_id, $view['acl_write']))
						{
							throw new AccessDeniedException();
						}
						$cal->delete_view($view_id);
					}
				}catch(Exception $e)
				{
					$response['deleteSuccess']=false;
					$response['deleteFeedback']=$e->getMessage();
				}
			}


			$response['total'] = $cal->get_writable_views($GO_SECURITY->user_id);
			$response['results']=array();
			while($cal->next_record(DB_ASSOC))
			{
				$user = $GO_USERS->get_user($cal->f('user_id'));

				$cal->record['user_name'] = String::format_name($user);
				$response['results'][] = $cal->record;
			}
			break;

		case 'view':

			$response['data']=$cal->get_view(($_REQUEST['view_id']));
			$user = $GO_USERS->get_user($response['data']['user_id']);
			$response['data']['user_name']=String::format_name($user);
			$response['success']=true;



			break;

		case 'calendar':

			$response['data']=$cal->get_calendar(($_REQUEST['calendar_id']));
			$user = $GO_USERS->get_user($response['data']['user_id']);
			$response['data']['user_name']=String::format_name($user);
			$response['success']=true;



			break;

		case 'participants':

			$event_id=$_REQUEST['event_id'];

			/*if(isset($_REQUEST['delete_keys']))
			{
				try{
					$response['deleteSuccess']=true;
					$participants = json_decode(($_REQUEST['delete_keys']));

					foreach($participants as $participant_id)
					{
						$cal->delete_participant($participant_id);
					}
				}catch(Exception $e)
				{
					$response['deleteSuccess']=false;
					$response['deleteFeedback']=$e->getMessage();
				}
			}

			if(isset($_REQUEST['add_participants']))
			{
				$participants = json_decode(($_REQUEST['add_participants']),true);
				foreach($participants as $participant)
				{
					$participant['event_id']=$event_id;
					//$participant['name']=$_REQUEST['name'];
					//$participant['email']=$_REQUEST['email'];

					$cal->add_participant($participant);
				}
			}*/

			if($event_id>0)
			{
				$cal2 = new calendar();		
	
				$event = $cal->get_event($event_id);
	
				$response['total'] = $cal->get_participants($event_id);
				$response['results']=array();
				while($cal->next_record(DB_ASSOC))
				{
					$participant = $cal->record;
	
					$participant['available']='?';
					$user=$GO_USERS->get_user_by_email($participant['email']);
					if($user)
					{
						$participant['available']=$cal2->is_available($user['id'], $event['start_time'], $event['end_time'], $event['id']) ? '1' : '0';
					}
	
					$response['results'][]=$participant;
				}
			}else
			{
				
			}
			break;
		case 'get_default_participant':
				$calendar = $cal->get_calendar($_REQUEST['calendar_id']);
				$calendar_user = $GO_USERS->get_user($calendar['user_id']);
				
				if($calendar_user)
				{
					$response['user_id']=$calendar_user['id'];
					$response['name']=String::format_name($calendar_user);
					$response['email']=$calendar_user['email'];
					$response['status']="1";
					$response['available']=$cal->is_available($response['user_id'], $_REQUEST['start_time'], $_REQUEST['end_time'], 0) ? '1' : '0';
				}
			break;
		
			
		case 'check_availability':
				$event_id = empty($_REQUEST['event_id']) ? 0 : $_REQUEST['event_id'];
				
				$emails=explode(',', $_REQUEST['emails']);
				
				$response=array();
				foreach($emails as $email)
				{
				 	$user=$GO_USERS->get_user_by_email($email);
	
					if($user)
					{
						$response[$email]=$cal->is_available($user['id'], $_REQUEST['start_time'], $_REQUEST['end_time'], $event_id) ? '1' : '0';
					}else
					{
						$response[$email]='?';
					}

				}
		break;
		
		case 'availability':
			$event_id = empty($_REQUEST['event_id']) ? 0 : $_REQUEST['event_id'];
			$date = Date::to_unixtime($_REQUEST['date']);
			$emails = explode(',',$_REQUEST['emails']);
			$names = isset($_REQUEST['names']) ? explode(',',$_REQUEST['names']) : $emails;


			$merged_free_busy=array();
			for($i=0;$i<1440;$i+=15)
			{
				$merged_free_busy[$i]=0;
			}

			$response['participants']=array();
			while($email = array_shift($emails))
			{
				$participant['name']=array_shift($names);
				$participant['email']=$email;
				$participant['freebusy']=array();
				
				$user = $GO_USERS->get_user_by_email($email);				
				if($user)
				{
					$freebusy=$cal->get_free_busy($user['id'], $date, $event_id);
					foreach($freebusy as $min=>$busy)
					{
						if($busy=='1')
						{
							$merged_free_busy[$min]=1;
						}
						$participant['freebusy'][]=array(
							'time'=>date('G:i', mktime(0,$min)),
							'busy'=>$busy);
					}
				}
				$response['participants'][]=$participant;
			}
			

			$participant['name']=$lang['calendar']['allTogether'];
			$participant['email']='';
			$participant['freebusy']=array();

			foreach($merged_free_busy as $min=>$busy)
			{
				$participant['freebusy'][]=array(
					'time'=>date($_SESSION['GO_SESSION']['time_format'], mktime(0,$min)),
					'busy'=>$busy);
			}

			$response['participants'][]=$participant;


			break;
	}
}catch(Exception $e)
{
	$response['feedback']=$e->getMessage();
	$response['success']=false;
}
echo json_encode($response);
