import ActionCard from './ActionCard';
import { useStaggeredCount } from './useStaggeredCount';

const REVEAL_MS = 150;

function ActionsPanel({ event, timeline, emptyMessage, stagger = false }) {
  const { activeActionIds, completedActionIds, status, runId } = timeline;
  const shownCount = useStaggeredCount(stagger && event ? `${event.id}:${runId}` : '', event?.actions?.length || 0, {
    intervalMs: REVEAL_MS,
    delayMs: 120,
    immediate: status === 'complete',
  });
  const actions = stagger ? (event?.actions || []).slice(0, shownCount) : event?.actions || [];

  return (
    <section className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5" aria-label="Actions">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Actions</h2>
        <p className="text-sm text-slate-500">See the results.</p>
      </div>

      {!event && (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
          <p className="max-w-xs text-sm text-slate-500">
            {emptyMessage ||
              'Outcomes appear here while the flow runs. Nothing is sent until you start an event, and even then it stays in this browser.'}
          </p>
        </div>
      )}

      {event && actions.length > 0 && (
        <ul className="flex flex-1 flex-col gap-3 overflow-y-auto" aria-live="polite">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              active={activeActionIds.includes(action.id) && !completedActionIds.includes(action.id)}
              done={completedActionIds.includes(action.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default ActionsPanel;
