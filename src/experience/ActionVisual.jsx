function PhoneArt({ live }) {
  return (
    <span className="flex items-center gap-1 text-sky-500" aria-hidden="true">
      <svg viewBox="0 0 48 20" className={['h-5 w-12', live ? 'sb-learn__wave' : 'opacity-40'].join(' ')}>
        {[4, 10, 16, 22, 28, 34, 40].map((x, i) => (
          <rect key={x} x={x} y={4 + (i % 3) * 2} width="3" height={12 - (i % 3) * 3} rx="1.5" fill="currentColor" />
        ))}
      </svg>
      <svg viewBox="0 0 24 24" className="h-7 w-7">
        <rect x="7" y="2" width="10" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="18" r="1" fill="currentColor" />
      </svg>
    </span>
  );
}

function SmsArt({ live, message }) {
  return (
    <span
      className={['relative flex h-14 w-11 items-end justify-center', live ? '' : 'opacity-40'].join(' ')}
      aria-hidden="true"
    >
      <span className="absolute inset-x-1 top-0 h-12 rounded-lg border-2 border-slate-700 bg-slate-900" />
      <span className="relative mb-3 w-8 rounded bg-sky-500 px-1 py-1 text-[0.45rem] font-semibold leading-tight text-white">
        {live ? message || 'Alert' : '···'}
      </span>
    </span>
  );
}

function StrobeArt({ live }) {
  return (
    <span className={['relative flex h-12 w-12 items-center justify-center', live ? 'sb-learn__strobe' : 'opacity-40'].join(' ')} aria-hidden="true">
      <span className="absolute h-10 w-10 rounded-full bg-red-500/20" />
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-red-400 to-red-700 shadow-md">
        <span className="h-3 w-3 rounded-full bg-red-100" />
      </span>
    </span>
  );
}

function DisplayArt({ live, text }) {
  return (
    <span className={['flex h-12 w-16 items-center justify-center rounded-md bg-black px-1', live ? '' : 'opacity-40'].join(' ')} aria-hidden="true">
      <span className="whitespace-pre-line text-center text-[0.45rem] font-bold leading-tight text-red-500">
        {live ? text || 'ALERT' : 'STANDBY'}
      </span>
    </span>
  );
}

function PagingArt({ live }) {
  return (
    <svg viewBox="0 0 48 32" className={['h-10 w-12 text-sky-600', live ? 'sb-learn__wave' : 'opacity-40'].join(' ')} aria-hidden="true">
      <path d="M6 12h6l8-6v20l-8-6H6z" fill="currentColor" />
      <path d="M26 10a8 8 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M30 6a13 13 0 0 1 0 20" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function MailArt({ live }) {
  return (
    <svg viewBox="0 0 40 32" className={['h-8 w-10 text-sky-600', live ? '' : 'opacity-40'].join(' ')} aria-hidden="true">
      <rect x="2" y="6" width="36" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 8l17 12L37 8" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function DeviceArt({ live }) {
  return (
    <svg viewBox="0 0 32 32" className={['h-8 w-8 text-slate-600', live ? '' : 'opacity-40'].join(' ')} aria-hidden="true">
      <rect x="8" y="4" width="16" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10h8M12 14h6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="23" r="1.3" fill="currentColor" />
    </svg>
  );
}

function ActionVisual({ action, live }) {
  if (action.type === 'phone') return <PhoneArt live={live} />;
  if (action.type === 'sms') return <SmsArt live={live} message="Alert" />;
  if (action.type === 'strobe') return <StrobeArt live={live} />;
  if (action.type === 'display') return <DisplayArt live={live} text={action.displayText} />;
  if (action.type === 'paging') return <PagingArt live={live} />;
  if (action.type === 'email') return <MailArt live={live} />;
  return <DeviceArt live={live} />;
}

export default ActionVisual;
