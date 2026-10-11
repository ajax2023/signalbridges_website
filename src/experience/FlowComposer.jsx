import { FLOW_ACTION_OPTIONS, FLOW_TRIGGERS } from './learning/modules';

function FlowComposer({ triggerId, actionTypes, running, onTrigger, onToggleAction, onRun }) {
  return (
    <section className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5" aria-label="Event">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Event</h2>
        <p className="text-sm text-slate-500">Build a simulated flow.</p>
      </div>

      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="flow-trigger">
        Trigger
      </label>
      <select
        id="flow-trigger"
        value={triggerId}
        onChange={(event) => onTrigger(event.target.value)}
        disabled={running}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {FLOW_TRIGGERS.map((trigger) => (
          <option key={trigger.id} value={trigger.id}>
            {trigger.label}
          </option>
        ))}
      </select>

      <fieldset className="mt-4" disabled={running}>
        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {FLOW_ACTION_OPTIONS.map((option) => {
            const checked = actionTypes.includes(option.type);
            return (
              <label key={option.type} className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleAction(option.type)}
                  className="h-4 w-4 accent-blue-600"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={onRun}
        disabled={running || actionTypes.length === 0}
        className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Run flow
      </button>
    </section>
  );
}

export default FlowComposer;
