import { ExperienceIcon } from './icons';

function ActionCard({ action, active, done }) {
  const idle = !active && !done;

  return (
    <li
      className={[
        done || active ? 'sb-experience__action-pop' : '',
        'rounded-xl border px-3 py-3 transition-colors',
        done
          ? 'border-emerald-400/35 bg-emerald-400/10'
          : active
            ? 'border-sky-400/40 bg-sky-400/10'
            : 'border-slate-800 bg-slate-950/40 opacity-40',
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
          <ExperienceIcon name={action.type} className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-semibold ${idle ? 'text-slate-400' : 'text-white'}`}>
              {action.label}
            </p>
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-amber-200/90">
              Simulated
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {done || active ? action.result : 'Waiting for dispatch…'}
          </p>
          {done && (
            <p className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-300/90">
              Complete
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export default ActionCard;
