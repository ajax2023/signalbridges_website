function ScenarioIcon({ name }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'channels') {
    return (
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
        <circle {...common} cx="8" cy="16" r="3" />
        <circle {...common} cx="16" cy="8" r="3" />
        <circle {...common} cx="24" cy="16" r="3" />
        <circle {...common} cx="16" cy="24" r="3" />
        <path {...common} d="M11 14l3-4M19 10l3 4M13 22l-3-4M21 20l3-2" />
      </svg>
    );
  }
  if (name === 'paging') {
    return (
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
        <path {...common} d="M6 12h5l7-5v18l-7-5H6z" />
        <path {...common} d="M21 12a5 5 0 0 1 0 8" />
      </svg>
    );
  }
  if (name === 'flow') {
    return (
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
        <circle {...common} cx="16" cy="16" r="3" />
        <path {...common} d="M16 6v4M16 22v4M6 16h4M22 16h4" />
        <circle {...common} cx="16" cy="6" r="2" />
        <circle {...common} cx="16" cy="26" r="2" />
        <circle {...common} cx="6" cy="16" r="2" />
        <circle {...common} cx="26" cy="16" r="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
      <circle {...common} cx="10" cy="16" r="3" />
      <circle {...common} cx="22" cy="10" r="3" />
      <circle {...common} cx="22" cy="22" r="3" />
      <path {...common} d="M13 15l6-4M13 17l6 4" />
    </svg>
  );
}

function ScenarioPicker({
  title,
  description,
  scenarios,
  activeId,
  onChange,
  onReplay,
  onReset,
  canReplay,
  canReset,
  soundOn,
  onToggleSound,
}) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5" aria-label="Demonstration controls">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReplay}
            disabled={!canReplay}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Replay
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={!canReset}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundOn}
            className={[
              'rounded-lg border px-3 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              soundOn ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700',
            ].join(' ')}
          >
            {soundOn ? 'Sound on' : 'Sound off'}
          </button>
        </div>
      </div>

      {scenarios?.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="tablist" aria-label="Scenarios">
          {scenarios.map((scenario) => {
            const active = scenario.id === activeId;
            return (
              <button
                key={scenario.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(scenario.id)}
                className={[
                  'flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  active ? 'border-blue-500 bg-white ring-2 ring-blue-500/15' : 'border-slate-200 bg-white hover:border-slate-300',
                ].join(' ')}
              >
                <span className={['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', active ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'].join(' ')}>
                  <ScenarioIcon name={scenario.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900">{scenario.label}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-slate-500">{scenario.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ScenarioPicker;
