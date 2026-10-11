import EventButton from './EventButton';

function EventsPanel({ events, selectedEventId, running, completedEventIds, onSelect, variant = 'list' }) {
  const tiles = variant === 'tiles';
  return (
    <section
      className={
        tiles
          ? 'flex h-full flex-col rounded-3xl bg-[#eef3f8] p-4 sm:p-6'
          : 'flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5'
      }
      aria-label="Event"
    >
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Event</h2>
        <p className="text-sm text-slate-500">{tiles ? 'Choose a button.' : 'Start something.'}</p>
      </div>
      <div className={tiles ? 'grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4' : 'flex flex-1 flex-col gap-3 overflow-y-auto'}>
        {events.map((event) => (
          <EventButton
            key={event.id}
            event={event}
            variant={tiles ? 'tile' : 'row'}
            selected={selectedEventId === event.id}
            running={running}
            completed={completedEventIds.includes(event.id)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default EventsPanel;
