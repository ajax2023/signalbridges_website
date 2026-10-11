/**
 * Drop replacement artwork in src/assets/experience-icons/.
 * File name, without the extension, must match iconFile on the button:
 * call-for-help, message-someone, email-someone, notify-someone.
 * png, svg, webp, or jpg.
 */
const iconModules = import.meta.glob('../assets/experience-icons/*.{png,svg,webp,jpg,jpeg}', {
  eager: true,
  import: 'default',
});

export function experienceIconSrc(name) {
  if (!name) return null;
  const match = Object.entries(iconModules).find(([path]) => {
    const file = path.split('/').pop().replace(/\.[^.]+$/, '');
    return file === name;
  });
  return match ? match[1] : null;
}
