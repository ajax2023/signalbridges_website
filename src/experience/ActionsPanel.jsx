import ActionCard from './ActionCard';

function ActionsPanel({ event, timeline }) {
  const { activeActionIds, completedActionIds } = timeline;

  return (
    <section
      className="sb-experience__panel flex h-full flex-col rounded-2xl p-4 sm:p-5"
      aria-label="Actions"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sky-400">
            Actions
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">Outcomes</h2>
        </div>
        <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-amber-200">
          Simulated
        </span>
      </div>

      {!event && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-950/50 px-6 py-12 text-center">
          <p className="text-sm text-slate-400">
            Coordinated actions appear here as the flow dispatches.
          </p>
        </div>
      )}

      {event && (
        <ul className="flex flex-1 flex-col gap-3" aria-live="polite">
          {event.actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              active={activeActionIds.includes(action.id)}
              done={completedActionIds.includes(action.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default ActionsPanel;
