function ScenarioPicker({ scenarios, activeId, disabled, onChange }) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Demonstration scenarios"
    >
      {scenarios.map((scenario) => {
        const active = scenario.id === activeId;
        return (
          <button
            key={scenario.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled && !active}
            onClick={() => onChange(scenario.id)}
            className={[
              'rounded-lg border px-3 py-2 text-left transition-colors min-w-[8.5rem]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
              active
                ? 'border-sky-400/50 bg-sky-500/15 text-white'
                : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500 hover:text-white',
              disabled && !active ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          >
            <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-sky-400/90">
              Demo
            </span>
            <span className="mt-0.5 block text-sm font-semibold leading-tight">
              {scenario.shortTitle || scenario.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ScenarioPicker;
