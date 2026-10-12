import phone from '../assets/experience-icons/phone.png';
import sms from '../assets/experience-icons/sms.png';
import envelope from '../assets/experience-icons/envelope.webp';
import message from '../assets/experience-icons/message.png';
import waterSensor from '../assets/experience-icons/WATER SENSOR.png';
import doorSensor from '../assets/experience-icons/DOOR SENSOR.png';
import motionSensor from '../assets/experience-icons/MOTION SENSOR.png';
import temperatureSensor from '../assets/experience-icons/TEMPERATURE SENSOR.png';
import waterLeak from '../assets/experience-icons/Water Leak.png';
import emergencyResponse from '../assets/experience-icons/Emergency Response.png';
import equipmentFailure from '../assets/experience-icons/Equipment Failure.png';
import lockdown from '../assets/experience-icons/LockDown ICON.png';

/** Artwork in src/assets/experience-icons/, keyed by file name without the extension. */
const icons = {
  phone,
  sms,
  envelope,
  message,
  'water-sensor': waterSensor,
  'door-sensor': doorSensor,
  'motion-sensor': motionSensor,
  'temperature-sensor': temperatureSensor,
  'water-leak': waterLeak,
  'emergency-response': emergencyResponse,
  'equipment-failure': equipmentFailure,
  lockdown,
};

export function experienceIconSrc(name) {
  return icons[name] || null;
}
