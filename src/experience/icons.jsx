const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function SensorIcon({ name, className = 'h-8 w-8' }) {
  switch (name) {
    case 'water':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path {...stroke} d="M16 4c0 0-8 10-8 15a8 8 0 0 0 16 0c0-5-8-15-8-15z" />
          <path {...stroke} d="M12.5 20.5c.8 1.6 2.2 2.5 3.5 2.5" />
        </svg>
      );
    case 'door':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <rect {...stroke} x="7" y="4" width="14" height="24" rx="1.5" />
          <path {...stroke} d="M21 8h4l2 8-2 8h-4" />
          <circle cx="17.5" cy="16" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'temperature':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path {...stroke} d="M14 18.5V8.5a2.5 2.5 0 0 1 5 0v10" />
          <circle {...stroke} cx="16.5" cy="22.5" r="4.5" />
          <path {...stroke} d="M16.5 20.5v4" />
          <path {...stroke} d="M22 8h4M23 12h3M23 16h3" />
        </svg>
      );
    case 'offline':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <rect {...stroke} x="6" y="8" width="20" height="14" rx="2" />
          <path {...stroke} d="M12 26h8M16 22v4" />
          <path {...stroke} d="M11 13l10 6M21 13L11 19" />
        </svg>
      );
    default:
      return null;
  }
}

export function ActionIcon({ type, className = 'h-7 w-7' }) {
  switch (type) {
    case 'email':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <rect {...stroke} x="5" y="8" width="22" height="16" rx="2" />
          <path {...stroke} d="M5 10l11 8 11-8" />
        </svg>
      );
    case 'phone':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path
            {...stroke}
            d="M10 7.5c.6-1 1.5-1.5 2.6-1.3l3 .6c.9.2 1.5 1 1.4 1.9l-.4 2.6c-.1.7-.5 1.3-1.1 1.6l-1.4.8a12.5 12.5 0 0 0 5.7 5.7l.8-1.4c.3-.6.9-1 1.6-1.1l2.6-.4c.9-.1 1.7.5 1.9 1.4l.6 3c.2 1.1-.3 2-1.3 2.6-2 .9-6.1.7-10.6-3.8S9.1 9.5 10 7.5z"
          />
        </svg>
      );
    case 'paging':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path {...stroke} d="M6 12v8h4l6 5V7l-6 5H6z" />
          <path {...stroke} d="M20 12.5a5 5 0 0 1 0 7" />
          <path {...stroke} d="M23 10a8.5 8.5 0 0 1 0 12" />
        </svg>
      );
    case 'device':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <rect {...stroke} x="8" y="6" width="16" height="20" rx="2" />
          <circle cx="16" cy="21" r="1.4" fill="currentColor" />
          <path {...stroke} d="M12 11h8M12 14.5h5" />
        </svg>
      );
    default:
      return null;
  }
}

export const ACCENT_CLASSES = {
  cyan: {
    text: 'text-cyan-300',
    ring: 'ring-cyan-400/70',
    chip: 'bg-cyan-400/15 border-cyan-400/30',
    bar: 'bg-cyan-400',
    soft: 'bg-cyan-400/10',
  },
  amber: {
    text: 'text-amber-300',
    ring: 'ring-amber-400/70',
    chip: 'bg-amber-400/15 border-amber-400/30',
    bar: 'bg-amber-400',
    soft: 'bg-amber-400/10',
  },
  orange: {
    text: 'text-orange-300',
    ring: 'ring-orange-400/70',
    chip: 'bg-orange-400/15 border-orange-400/30',
    bar: 'bg-orange-400',
    soft: 'bg-orange-400/10',
  },
  rose: {
    text: 'text-rose-300',
    ring: 'ring-rose-400/70',
    chip: 'bg-rose-400/15 border-rose-400/30',
    bar: 'bg-rose-400',
    soft: 'bg-rose-400/10',
  },
};
