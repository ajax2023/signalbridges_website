import { ACCENT_CLASSES, SensorIcon } from './icons';

function EventsPanel({ events, selectedEventId, running, onSelect }) {
  return (
    <section className="sb-experience__panel flex h-full flex-col rounded-2xl p-4 sm:p-5" aria-label="Events">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sky-400/90">
            Events
          </p>
          <h2 className="mt-1 text-base font-semibold text-white">Sensors</h2>
        </div>
        <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-amber-200">
          Simulated
        </span>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 content-start">
        {events.map((event) => {
          const accent = ACCENT_CLASSES[event.accent] || ACCENT_CLASSES.cyan;
          const selected = selectedEventId === event.id;
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event.id)}
              disabled={running}
              aria-pressed={selected}
              className={[
                'group relative flex min-h-[7.5rem] flex-col items-center justify-center gap-2.5 rounded-xl border px-3 py-4 text-center transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                selected
                  ? `border-transparent bg-slate-950 ring-2 ${accent.ring}`
                  : 'border-slate-700/70 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-950',
                running && !selected ? 'opacity-50' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-14 w-14 items-center justify-center rounded-full border',
                  accent.chip,
                  accent.text,
                  selected ? 'sb-experience__pulse' : '',
                ].join(' ')}
              >
                <SensorIcon name={event.icon} className="h-8 w-8" />
              </span>
              <span className="text-sm font-medium text-slate-100">{event.label}</span>
              {selected && (
                <span className={`absolute inset-x-3 bottom-2 h-0.5 rounded-full ${accent.bar}`} />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default EventsPanel;
