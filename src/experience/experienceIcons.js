import phone from '../assets/experience-icons/phone.png';
import sms from '../assets/experience-icons/sms.png';
import envelope from '../assets/experience-icons/envelope.webp';
import message from '../assets/experience-icons/message.png';
import paging from '../assets/experience-icons/paging.png';
import fireAlarm from '../assets/experience-icons/fire-alarm.png';
import waterSensor from '../assets/experience-icons/WATER SENSOR.png';
import doorSensor from '../assets/experience-icons/DOOR SENSOR.png';
import motionSensor from '../assets/experience-icons/MOTION SENSOR.png';
import temperatureSensor from '../assets/experience-icons/TEMPERATURE SENSOR.png';
import waterLeak from '../assets/experience-icons/Water Leak.png';
import emergencyResponse from '../assets/experience-icons/Emergency Response.png';
import equipmentFailure from '../assets/experience-icons/Equipment Failure.png';
import lockdown from '../assets/experience-icons/LockDown ICON.png';
import schoolBells from '../assets/experience-icons/School Bells.png';
import morningAnnouncement from '../assets/experience-icons/Morning Announcement.png';
import snowDayClosure from '../assets/experience-icons/Snow Day Closure.png';
import emergencyNotification from '../assets/experience-icons/Emergency Notification.png';
import staffAnnouncement from '../assets/experience-icons/Staff Announcement.png';

/** Artwork in src/assets/experience-icons/, keyed by file name without the extension. */
const icons = {
  phone,
  sms,
  envelope,
  message,
  paging,
  'fire-alarm': fireAlarm,
  'water-sensor': waterSensor,
  'door-sensor': doorSensor,
  'motion-sensor': motionSensor,
  'temperature-sensor': temperatureSensor,
  'water-leak': waterLeak,
  'emergency-response': emergencyResponse,
  'equipment-failure': equipmentFailure,
  lockdown,
  'school-bells': schoolBells,
  'morning-announcement': morningAnnouncement,
  'snow-day-closure': snowDayClosure,
  'emergency-notification': emergencyNotification,
  'staff-announcement': staffAnnouncement,
};

const actionIcons = {
  phone: 'phone',
  sms: 'sms',
  email: 'envelope',
  notification: 'message',
  paging: 'paging',
  strobe: 'fire-alarm',
};

export function experienceIconSrc(name) {
  return icons[name] || null;
}

export function actionIconSrc(type) {
  return experienceIconSrc(actionIcons[type]);
}
