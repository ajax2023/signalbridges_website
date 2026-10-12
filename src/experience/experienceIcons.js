import phone from '../assets/experience-icons/phone.png';
import sms from '../assets/experience-icons/sms.png';
import envelope from '../assets/experience-icons/envelope.webp';
import message from '../assets/experience-icons/message.png';
import waterSensor from '../assets/experience-icons/WATER SENSOR.png';
import doorSensor from '../assets/experience-icons/DOOR SENSOR.png';
import motionSensor from '../assets/experience-icons/MOTION SENSOR.png';
import temperatureSensor from '../assets/experience-icons/TEMPERATURE SENSOR.png';

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
};

export function experienceIconSrc(name) {
  return icons[name] || null;
}
