import EventButton from './EventButton';

function StepBadge({ n }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
      {n}
    </span>
  );
}

function EventsPanel({ events, selectedEventId, running, completedEventIds, onSelect }) {
  return (
    <section className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5" aria-label="Event">
      <div className="mb-4 flex items-center gap-3">
        <StepBadge n={1} />
        <div>
          <h2 className="text-base font-semibold text-slate-900">Event</h2>
          <p className="text-sm text-slate-500">Start something.</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {events.map((event) => (
          <EventButton
            key={event.id}
            event={event}
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

export { StepBadge };
export default EventsPanel;
