import { ExperienceIcon } from './icons';
import { eventIconSrcs } from './experienceIcons';

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

function TileGlyph({ event }) {
  const sources = eventIconSrcs(event);
  if (sources.length > 0) {
    return (
      <span className="flex h-16 items-center justify-center -space-x-3">
        {sources.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            className={sources.length > 1 ? 'h-14 w-14 object-contain' : 'h-16 w-16 object-contain'}
          />
        ))}
      </span>
    );
  }
  const tone = event.tone;
  const bubble =
    tone === 'green'
      ? 'from-emerald-300 to-emerald-500'
      : tone === 'amber'
        ? 'from-sky-300 to-blue-500'
        : tone === 'sky'
          ? 'from-sky-300 to-blue-500'
          : 'from-sky-300 to-blue-600';
  return (
    <span className={['flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b text-white shadow-md sm:h-20 sm:w-20', bubble].join(' ')} aria-hidden="true">
      <ExperienceIcon name={event.icon === 'notification' ? 'announcement' : event.icon} className="h-9 w-9 sm:h-11 sm:w-11" />
    </span>
  );
}

function EventButton({ event, selected, running, completed, onSelect, variant = 'row' }) {
  const physical = Boolean(event.tone) && variant !== 'tile';
  const stateLabel = running && selected ? 'Running' : completed ? 'Completed' : selected ? 'Selected' : '';
  const artwork = eventIconSrcs(event);

  if (variant === 'tile') {
    return (
      <button
        type="button"
        onClick={() => onSelect(event.id)}
        disabled={running}
        aria-pressed={selected}
        className={[
          'relative flex flex-col items-center justify-start gap-2 rounded-2xl bg-[#f4f7fb] px-2 py-3 text-center transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          selected ? 'ring-2 ring-blue-500' : 'hover:bg-[#e8eef5]',
          running && !selected ? 'opacity-50' : '',
        ].join(' ')}
      >
        <span className={running && selected ? 'sb-experience__pulse rounded-2xl' : ''}>
          <TileGlyph event={event} />
        </span>
        <span className="text-sm font-medium text-slate-700">{event.label}</span>
        {completed && (
          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[0.65rem] font-bold text-white">
            ✓
          </span>
        )}
        {stateLabel && <span className="sr-only">{stateLabel}</span>}
      </button>
    );
  }

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
      {artwork.length > 0 ? (
        <span className={['flex h-12 w-12 shrink-0 items-center justify-center -space-x-2', running && selected ? 'sb-experience__pulse rounded-xl' : ''].join(' ')}>
          {artwork.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className={artwork.length > 1 ? 'h-9 w-9 object-contain' : 'h-11 w-11 object-contain'}
            />
          ))}
        </span>
      ) : physical ? (
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
