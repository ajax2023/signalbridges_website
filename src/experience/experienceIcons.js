import phone from '../assets/experience-icons/phone.png';
import sms from '../assets/experience-icons/sms.png';
import envelope from '../assets/experience-icons/envelope.webp';
import message from '../assets/experience-icons/message.png';

/** Artwork in src/assets/experience-icons/, keyed by file name without the extension. */
const icons = {
  phone,
  sms,
  envelope,
  message,
};

export function experienceIconSrc(name) {
  return icons[name] || null;
}
