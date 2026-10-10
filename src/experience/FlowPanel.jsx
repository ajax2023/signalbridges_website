import { ACCENT_CLASSES, SensorIcon } from './icons';

function FlowPanel({ event, timeline }) {
  const accent = event ? ACCENT_CLASSES[event.accent] || ACCENT_CLASSES.cyan : null;
  const { status, activeStepIndex, completedStepIds } = timeline;

  return (
    <section className="sb-experience__panel flex h-full flex-col rounded-2xl p-4 sm:p-5" aria-label="Flows">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sky-400/90">
            Flows
          </p>
          <h2 className="mt-1 text-base font-semibold text-white">Workflow execution</h2>
        </div>
        <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-amber-200">
          Simulated
        </span>
      </div>

      {!event && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 px-6 py-10 text-center">
          <p className="text-sm text-slate-400">Select a sensor event to run a flow.</p>
        </div>
      )}

      {event && (
        <div className="flex flex-1 flex-col">
          <div
            key={`${event.id}-${timeline.runId}-ingress`}
            className={`sb-experience__ingress mb-5 flex items-center gap-3 rounded-xl border px-3 py-3 ${accent.chip}`}
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-full ${accent.soft} ${accent.text}`}>
              <SensorIcon name={event.icon} className="h-6 w-6" />
            </span>
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold text-white">{event.label}</p>
              <p className="truncate text-xs text-slate-400">{event.ingressLabel}</p>
            </div>
            <span className="ml-auto text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
              {status === 'complete' ? 'Complete' : status === 'running' ? 'Running' : 'Ready'}
            </span>
          </div>

          <ol className="relative flex flex-1 flex-col gap-0" aria-live="polite">
            {event.flowSteps.map((step, index) => {
              const done = completedStepIds.includes(step.id) || (status === 'complete' && index <= activeStepIndex);
              const active = status === 'running' && activeStepIndex === index;
              const pending = !done && !active;

              return (
                <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < event.flowSteps.length - 1 && (
                    <span
                      className={[
                        'sb-experience__flow-line absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px',
                        done || active ? 'bg-sky-400/70' : 'bg-slate-700',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={[
                      'relative z-[1] mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                      active
                        ? `border-sky-300 bg-sky-500 text-slate-950 sb-experience__step-active`
                        : done
                          ? 'border-sky-400/50 bg-sky-400/20 text-sky-200'
                          : 'border-slate-600 bg-slate-900 text-slate-500',
                    ].join(' ')}
                  >
                    {done && !active ? '✓' : index + 1}
                  </span>
                  <div
                    className={[
                      'min-w-0 flex-1 rounded-xl border px-3 py-2.5 transition-colors',
                      active
                        ? 'border-sky-400/40 bg-sky-400/10'
                        : done
                          ? 'border-slate-600/80 bg-slate-900/50'
                          : 'border-slate-800 bg-slate-950/30',
                      pending ? 'opacity-45' : '',
                    ].join(' ')}
                  >
                    <p className={`text-sm font-medium ${active || done ? 'text-white' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{step.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}

export default FlowPanel;
