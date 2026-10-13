import { bridgeView } from './learning/bridgeView';
import { useStaggeredCount } from './useStaggeredCount';

const REVEAL_MS = 150;

function lessonState(action, timeline) {
  if (!action) return 'idle';
  if (timeline.status === 'complete' || timeline.completedActionIds?.includes(action.id)) return 'done';
  if (timeline.activeActionIds?.includes(action.id)) return 'active';
  return 'idle';
}

function FlowPanel({ event, timeline, omitFlow = false, lesson = false }) {
  const lessonSteps = lesson && event?.lessonSteps?.length ? event.lessonSteps : null;
  const steps = lessonSteps
    ? lessonSteps.map((label, index) => ({
        id: `lesson-${index}`,
        label,
        detail: '',
        state: lessonState(event.actions?.[index], timeline),
      }))
    : lesson
      ? []
      : bridgeView(event, timeline, { omitFlow });
  const revealKey = lessonSteps ? `${event.id}:${timeline.runId}` : '';
  const shownCount = useStaggeredCount(revealKey, steps.length, {
    intervalMs: REVEAL_MS,
    immediate: timeline.status === 'complete',
  });
  const visibleSteps = lessonSteps ? steps.slice(0, shownCount) : steps;

  return (
    <section
      className="relative flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5"
      aria-label="Signal Bridge"
    >
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[0.65rem] font-bold text-white" aria-hidden="true">2</span>
          <h2 className="text-base font-semibold text-slate-900">Signal Bridge</h2>
        </div>
        <p className="text-sm text-slate-500">{lesson ? 'Follows the Flow.' : 'Processes the Event.'}</p>
      </div>

      {lesson && !lessonSteps && (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#f4f7fb] px-4 py-10 text-center">
          <p className="max-w-xs text-sm text-slate-500">Choose a Flow to see its steps.</p>
        </div>
      )}

      {visibleSteps.length > 0 && (
        <ol className="flex flex-1 flex-col gap-3" aria-live="polite">
          {visibleSteps.map((step, index) => (
            <li
              key={step.id}
              data-step={step.id}
              data-state={step.state}
              className={[
                'sb-reveal flex items-center gap-3 rounded-2xl bg-[#f4f7fb] px-3 py-3',
                step.state === 'active' ? 'ring-2 ring-blue-500' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold',
                  step.state === 'done' ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-white text-slate-500',
                  step.state === 'active' ? 'sb-experience__step-active' : '',
                ].join(' ')}
                aria-hidden="true"
              >
                {step.state === 'done' ? '✓' : lessonSteps ? index + 1 : ''}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-700">{step.label}</span>
                {step.detail ? (
                  <span className="mt-0.5 block text-xs text-slate-500">{step.detail}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default FlowPanel;
