import { ActionIcon } from './icons';

function ActionsPanel({ event, timeline }) {
  const { activeActionIds, completedActionIds, status } = timeline;

  return (
    <section className="sb-experience__panel flex h-full flex-col rounded-2xl p-4 sm:p-5" aria-label="Actions">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sky-400/90">
            Actions
          </p>
          <h2 className="mt-1 text-base font-semibold text-white">Outcomes</h2>
        </div>
        <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-amber-200">
          Simulated
        </span>
      </div>

      {!event && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 px-6 py-10 text-center">
          <p className="text-sm text-slate-400">Action results appear here after dispatch.</p>
        </div>
      )}

      {event && (
        <ul className="flex flex-1 flex-col gap-3" aria-live="polite">
          {event.actions.map((action) => {
            const active = activeActionIds.includes(action.id);
            const done = completedActionIds.includes(action.id);
            const idle = !active && !done;

            return (
              <li
                key={action.id}
                className={[
                  done || active ? 'sb-experience__action-pop' : '',
                  'rounded-xl border px-3 py-3 transition-colors',
                  done
                    ? 'border-emerald-400/35 bg-emerald-400/10'
                    : active
                      ? 'border-sky-400/40 bg-sky-400/10'
                      : 'border-slate-800 bg-slate-950/35 opacity-45',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={[
                      'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border',
                      done
                        ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                        : active
                          ? 'border-sky-400/40 bg-sky-400/10 text-sky-300'
                          : 'border-slate-700 text-slate-500',
                    ].join(' ')}
                  >
                    <ActionIcon type={action.type} className="h-7 w-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium ${idle ? 'text-slate-400' : 'text-white'}`}>
                        {action.label}
                      </p>
                      <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-amber-200/90">
                        Simulated
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {done || active ? action.result : 'Waiting for dispatch…'}
                    </p>
                    {(done || status === 'complete') && (
                      <p className="mt-1.5 text-[0.65rem] font-medium uppercase tracking-wider text-emerald-300/90">
                        Complete
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default ActionsPanel;
