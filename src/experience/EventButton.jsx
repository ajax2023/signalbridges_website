import { ExperienceIcon } from './icons';

function PhysicalFace({ tone }) {
  const toneClass =
    tone === 'red'
      ? 'sb-phys--red'
      : tone === 'green'
        ? 'sb-phys--green'
        : tone === 'amber'
          ? 'sb-phys--amber'
          : 'sb-phys--blue';
  return (
    <span className={['sb-phys', toneClass].join(' ')} aria-hidden="true">
      {tone === 'blue' && (
        <svg viewBox="0 0 32 32" className="h-5 w-5 text-white">
          <path d="M10 8h8l-4 6h6L12 26l3-8H9l1-10z" fill="currentColor" />
        </svg>
      )}
      {tone === 'green' && (
        <svg viewBox="0 0 32 32" className="h-5 w-5 text-white">
          <rect x="9" y="6" width="12" height="20" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="16" r="1.3" fill="currentColor" />
        </svg>
      )}
      {tone === 'amber' && <span className="text-lg font-black leading-none text-white">!</span>}
    </span>
  );
}

function EventButton({ event, selected, running, completed, onSelect }) {
  const physical = Boolean(event.tone);
  const stateLabel = running && selected ? 'Running' : completed ? 'Completed' : selected ? 'Selected' : '';

  return (
    <button
      type="button"
      onClick={() => onSelect(event.id)}
      disabled={running}
      aria-pressed={selected}
      className={[
        'group flex w-full items-center gap-3 rounded-2xl border bg-white px-3 py-3 text-left shadow-sm transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        selected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300',
        completed && !selected ? 'border-emerald-300' : '',
        running && !selected ? 'opacity-50' : '',
      ].join(' ')}
    >
      {physical ? (
        <span className={running && selected ? 'sb-experience__pulse rounded-full' : ''}>
          <PhysicalFace tone={event.tone} />
        </span>
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
          <ExperienceIcon name={event.icon} className="h-7 w-7" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{event.label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-slate-500">
          {event.blurb || event.ingressLabel}
        </span>
      </span>
      {completed && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[0.65rem] font-bold text-white">
          ✓
        </span>
      )}
      {stateLabel && <span className="sr-only">{stateLabel}</span>}
    </button>
  );
}

export default EventButton;
