import { ACCENT_CLASSES, ExperienceIcon } from './icons';

function EventButton({ event, selected, running, onSelect }) {
  const accent = ACCENT_CLASSES[event.accent] || ACCENT_CLASSES.sky;

  return (
    <button
      type="button"
      onClick={() => onSelect(event.id)}
      disabled={running}
      aria-pressed={selected}
      className={[
        'group relative flex min-h-[6.75rem] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        selected
          ? `border-transparent bg-slate-950 ring-2 ${accent.ring}`
          : 'border-slate-700/80 bg-slate-950/50 hover:border-slate-500 hover:bg-slate-950',
        running && !selected ? 'opacity-40' : '',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-14 w-14 items-center justify-center rounded-2xl border',
          accent.chip,
          accent.text,
          selected ? 'sb-experience__pulse' : '',
        ].join(' ')}
      >
        <ExperienceIcon name={event.icon} className="h-8 w-8" />
      </span>
      <span className="text-sm font-semibold text-slate-100 leading-snug">
        {event.label}
      </span>
      {selected && (
        <span className={`absolute inset-x-4 bottom-2 h-0.5 rounded-full ${accent.bar}`} />
      )}
    </button>
  );
}

export default EventButton;
