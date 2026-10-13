import phoneCall from '../assets/experience-icons/Phone Call.png';
import messageOne from '../assets/experience-icons/Message-1.png';
import envelope from '../assets/experience-icons/Envelope.png';
import notification from '../assets/experience-icons/Notification.png';
import clock from '../assets/experience-icons/Clock.png';
import settings from '../assets/experience-icons/Settings.png';
import paging from '../assets/experience-icons/paging.png';
import display from '../assets/experience-icons/Display.png';
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
import strobeRed from '../assets/experience-icons/8138 RED.png';
import strobeBlue from '../assets/experience-icons/8138 BLUE.png';
import algoHorn from '../assets/experience-icons/Horn.png';
import algoDoorphone from '../assets/experience-icons/ALGO DOORPHONE.png';
import safetyIncident from '../assets/experience-icons/SAFETY INCIDENT.png';
import codeRed from '../assets/experience-icons/CODE RED.png';
import codeBlue from '../assets/experience-icons/CODE BLUE.png';
import lockdownDisplay from '../assets/experience-icons/LOCKDOWN.png';
import emergencyDisplay from '../assets/experience-icons/EMERGENCY.png';
import evacuationDisplay from '../assets/experience-icons/EVACUATION.png';
import medicalEmergencyDisplay from '../assets/experience-icons/MEDICAL EMERGENCY.png';
import allClearDisplay from '../assets/experience-icons/ALL CLEAR.png';

/** Central registry for artwork that exists in src/assets/experience-icons/. */
export const EXPERIENCE_IMAGE_REGISTRY = {
  'phone-call': phoneCall,
  'message-1': messageOne,
  envelope,
  notification,
  clock,
  settings,
  paging,
  display,
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
  'strobe-red': strobeRed,
  'strobe-blue': strobeBlue,
  'algo-horn': algoHorn,
  'algo-doorphone': algoDoorphone,
  'safety-incident': safetyIncident,
  'code-red': codeRed,
  'code-blue': codeBlue,
  'lockdown-display': lockdownDisplay,
  'emergency-display': emergencyDisplay,
  'evacuation-display': evacuationDisplay,
  'medical-emergency-display': medicalEmergencyDisplay,
  'all-clear-display': allClearDisplay,
};

/** Event artwork is separate from action artwork, even when a file is shared. */
export const EVENT_IMAGE_REGISTRY = {
  'call-help': ['phone-call'],
  'message-someone': ['message-1'],
  'email-someone': ['envelope'],
  'notify-someone': ['notification'],
  'water-leak-response': ['water-leak'],
  'emergency-response': ['emergency-response'],
  'equipment-failure': ['equipment-failure'],
  'school-lockdown': ['lockdown'],
  'water-leak': ['water-sensor'],
  'door-opened': ['door-sensor'],
  'high-temperature': ['temperature-sensor'],
  'motion-detected': ['motion-sensor'],
  'school-bell': ['school-bells'],
  'morning-announcement': ['morning-announcement'],
  'snow-day': ['snow-day-closure'],
  'emergency-notification': ['emergency-notification'],
  'staff-announcement': ['staff-announcement'],
  'algo-strobe': ['strobe-red'],
  'algo-blue-strobe': ['strobe-blue'],
  'algo-display': ['display'],
  'algo-audio': ['algo-horn'],
  'algo-combined': ['strobe-red', 'algo-horn'],
  'make-phone-call': ['phone-call'],
  'page-speaker': ['algo-horn'],
  'sip-intercom': ['algo-doorphone'],
  'send-email': ['envelope'],
  'webhook-incident': ['safety-incident'],
  'webhook-sync': ['settings'],
};

export const ACTION_IMAGE_REGISTRY = {
  phone: 'phone-call',
  sms: 'message-1',
  email: 'envelope',
  notification: 'notification',
  wait: 'clock',
  device: 'settings',
  paging: 'paging',
  strobe: 'strobe-red',
  display: 'display',
};

export const TRIGGER_IMAGE_REGISTRY = {
  sip: 'phone-call',
};

export function experienceIconSrc(name) {
  return EXPERIENCE_IMAGE_REGISTRY[name] || null;
}

export function eventIconSrcs(event) {
  const keys = EVENT_IMAGE_REGISTRY[event?.id] || (event?.iconFile ? [event.iconFile] : []);
  return keys.map(experienceIconSrc).filter(Boolean);
}

export function actionIconSrc(actionOrType) {
  const action = typeof actionOrType === 'string' ? { type: actionOrType } : actionOrType;
  if (action?.type === 'display' && action.displayText === 'ALL CLEAR') {
    return experienceIconSrc('all-clear-display');
  }
  return experienceIconSrc(action?.imageKey || ACTION_IMAGE_REGISTRY[action?.type]);
}

export function triggerIconSrc(triggerId) {
  return experienceIconSrc(TRIGGER_IMAGE_REGISTRY[triggerId]);
}
