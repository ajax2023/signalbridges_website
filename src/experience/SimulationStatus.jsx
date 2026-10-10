function SimulationStatus({ status, eventLabel }) {
  const label =
    status === 'running'
      ? `Running${eventLabel ? `: ${eventLabel}` : ''}`
      : status === 'complete'
        ? `Complete${eventLabel ? `: ${eventLabel}` : ''}`
        : 'Ready — select an event';

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300"
      aria-live="polite"
    >
      <span
        className={[
          'h-2 w-2 rounded-full',
          status === 'running'
            ? 'bg-sky-400 sb-experience__pulse'
            : status === 'complete'
              ? 'bg-emerald-400'
              : 'bg-slate-500',
        ].join(' ')}
      />
      <span>{label}</span>
    </div>
  );
}

export default SimulationStatus;
