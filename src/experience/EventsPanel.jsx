import EventButton from './EventButton';

function EventsPanel({ events, selectedEventId, running, onSelect }) {
  return (
    <section
      className="sb-experience__panel flex h-full flex-col rounded-2xl p-4 sm:p-5"
      aria-label="Events"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sky-400">
            Events
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">Trigger</h2>
        </div>
        <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-amber-200">
          Simulated
        </span>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 content-start sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {events.map((event) => (
          <EventButton
            key={event.id}
            event={event}
            selected={selectedEventId === event.id}
            running={running}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default EventsPanel;
