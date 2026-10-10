const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ children, className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function ExperienceIcon({ name, className = 'h-8 w-8' }) {
  switch (name) {
    case 'water':
      return (
        <Svg className={className}>
          <path {...stroke} d="M16 4c0 0-8 10-8 15a8 8 0 0 0 16 0c0-5-8-15-8-15z" />
          <path {...stroke} d="M12.5 20.5c.8 1.6 2.2 2.5 3.5 2.5" />
        </Svg>
      );
    case 'door':
      return (
        <Svg className={className}>
          <rect {...stroke} x="7" y="4" width="14" height="24" rx="1.5" />
          <path {...stroke} d="M21 8h4l2 8-2 8h-4" />
          <circle cx="17.5" cy="16" r="1.2" fill="currentColor" />
        </Svg>
      );
    case 'temperature':
      return (
        <Svg className={className}>
          <path {...stroke} d="M14 18.5V8.5a2.5 2.5 0 0 1 5 0v10" />
          <circle {...stroke} cx="16.5" cy="22.5" r="4.5" />
          <path {...stroke} d="M16.5 20.5v4M22 8h4M23 12h3M23 16h3" />
        </Svg>
      );
    case 'offline':
      return (
        <Svg className={className}>
          <rect {...stroke} x="6" y="8" width="20" height="14" rx="2" />
          <path {...stroke} d="M12 26h8M16 22v4M11 13l10 6M21 13L11 19" />
        </Svg>
      );
    case 'motion':
      return (
        <Svg className={className}>
          <circle {...stroke} cx="16" cy="8" r="2.5" />
          <path {...stroke} d="M10 28l3-10 3 4 3-8 3 14" />
          <path {...stroke} d="M8 14h4M20 12h4" />
        </Svg>
      );
    case 'email':
      return (
        <Svg className={className}>
          <rect {...stroke} x="5" y="8" width="22" height="16" rx="2" />
          <path {...stroke} d="M5 10l11 8 11-8" />
        </Svg>
      );
    case 'phone':
      return (
        <Svg className={className}>
          <path
            {...stroke}
            d="M10 7.5c.6-1 1.5-1.5 2.6-1.3l3 .6c.9.2 1.5 1 1.4 1.9l-.4 2.6c-.1.7-.5 1.3-1.1 1.6l-1.4.8a12.5 12.5 0 0 0 5.7 5.7l.8-1.4c.3-.6.9-1 1.6-1.1l2.6-.4c.9-.1 1.7.5 1.9 1.4l.6 3c.2 1.1-.3 2-1.3 2.6-2 .9-6.1.7-10.6-3.8S9.1 9.5 10 7.5z"
          />
        </Svg>
      );
    case 'paging':
      return (
        <Svg className={className}>
          <path {...stroke} d="M6 12v8h4l6 5V7l-6 5H6z" />
          <path {...stroke} d="M20 12.5a5 5 0 0 1 0 7M23 10a8.5 8.5 0 0 1 0 12" />
        </Svg>
      );
    case 'strobe':
      return (
        <Svg className={className}>
          <circle {...stroke} cx="16" cy="16" r="5" />
          <path {...stroke} d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M24.5 7.5l-2.8 2.8M10.3 21.7l-2.8 2.8" />
        </Svg>
      );
    case 'multi':
      return (
        <Svg className={className}>
          <circle {...stroke} cx="16" cy="16" r="3" />
          <path {...stroke} d="M16 6v5M16 21v5M6 16h5M21 16h5" />
          <circle {...stroke} cx="16" cy="6" r="2" />
          <circle {...stroke} cx="16" cy="26" r="2" />
          <circle {...stroke} cx="6" cy="16" r="2" />
          <circle {...stroke} cx="26" cy="16" r="2" />
        </Svg>
      );
    case 'bell':
      return (
        <Svg className={className}>
          <path {...stroke} d="M10 14a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H8S10 19 10 14z" />
          <path {...stroke} d="M14 22.5a2 2 0 0 0 4 0M16 5v2" />
        </Svg>
      );
    case 'announcement':
      return (
        <Svg className={className}>
          <path {...stroke} d="M6 14h5l9-5v14l-9-5H6z" />
          <path {...stroke} d="M11 19v4a2 2 0 0 0 2 2h1" />
          <path {...stroke} d="M23 12a4 4 0 0 1 0 8" />
        </Svg>
      );
    case 'snow':
      return (
        <Svg className={className}>
          <path {...stroke} d="M16 5v22M7 9.5l18 13M25 9.5L7 22.5" />
          <path {...stroke} d="M16 9l2-2M16 9l-2-2M16 23l2 2M16 23l-2 2" />
        </Svg>
      );
    case 'emergency':
      return (
        <Svg className={className}>
          <path {...stroke} d="M16 5l11 20H5L16 5z" />
          <path {...stroke} d="M16 13v5M16 21.5v.5" />
        </Svg>
      );
    case 'staff':
      return (
        <Svg className={className}>
          <circle {...stroke} cx="12" cy="11" r="3" />
          <circle {...stroke} cx="21" cy="12" r="2.5" />
          <path {...stroke} d="M5.5 23c.8-3.2 3-5 6.5-5s5.7 1.8 6.5 5M18 18.2c2.2.3 3.8 1.6 4.5 3.8" />
        </Svg>
      );
    case 'shift':
      return (
        <Svg className={className}>
          <circle {...stroke} cx="16" cy="16" r="10" />
          <path {...stroke} d="M16 8v8l5 3" />
        </Svg>
      );
    case 'maintenance':
      return (
        <Svg className={className}>
          <path {...stroke} d="M20 7a5 5 0 0 0-7.5 6.5L6 20l3 3 6.5-6.5A5 5 0 0 0 20 7z" />
          <path {...stroke} d="M18.5 8.5l5 5" />
        </Svg>
      );
    case 'equipment':
      return (
        <Svg className={className}>
          <rect {...stroke} x="6" y="10" width="20" height="14" rx="2" />
          <path {...stroke} d="M10 10V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M11 16h4M11 20h10" />
        </Svg>
      );
    case 'device':
      return (
        <Svg className={className}>
          <rect {...stroke} x="8" y="6" width="16" height="20" rx="2" />
          <circle cx="16" cy="21" r="1.4" fill="currentColor" />
          <path {...stroke} d="M12 11h8M12 14.5h5" />
        </Svg>
      );
    case 'sms':
      return (
        <Svg className={className}>
          <path {...stroke} d="M7 8h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H13l-5 4v-4H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
          <path {...stroke} d="M11 14h10M11 17h6" />
        </Svg>
      );
    default:
      return (
        <Svg className={className}>
          <circle {...stroke} cx="16" cy="16" r="10" />
        </Svg>
      );
  }
}

/** @deprecated use ExperienceIcon */
export const SensorIcon = ExperienceIcon;
export const ActionIcon = ({ type, className }) => (
  <ExperienceIcon name={type} className={className} />
);

export const ACCENT_CLASSES = {
  sky: {
    text: 'text-sky-300',
    ring: 'ring-sky-400/70',
    chip: 'bg-sky-400/15 border-sky-400/30',
    bar: 'bg-sky-400',
    soft: 'bg-sky-400/10',
  },
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
  violet: {
    text: 'text-violet-300',
    ring: 'ring-violet-400/70',
    chip: 'bg-violet-400/15 border-violet-400/30',
    bar: 'bg-violet-400',
    soft: 'bg-violet-400/10',
  },
  emerald: {
    text: 'text-emerald-300',
    ring: 'ring-emerald-400/70',
    chip: 'bg-emerald-400/15 border-emerald-400/30',
    bar: 'bg-emerald-400',
    soft: 'bg-emerald-400/10',
  },
};
