import { ExperienceIcon } from './icons';
import ActionVisual from './ActionVisual';
import { actionIconSrc } from './experienceIcons';

const STATUS = {
  phone: { active: 'Calling', done: 'Called' },
  sms: { active: 'Sending', done: 'Sent' },
  email: { active: 'Sending', done: 'Sent' },
  strobe: { active: 'Active', done: 'Complete' },
  display: { active: 'Updating', done: 'Updated' },
  paging: { active: 'Paging', done: 'Played' },
  device: { active: 'Sending', done: 'Acknowledged' },
  notification: { active: 'Showing', done: 'Showing' },
  wait: { active: 'Waiting', done: 'Done' },
};

function ActionCard({ action, active, done }) {
  const live = active || done;
  const status = STATUS[action.type] || { active: 'Running', done: 'Done' };
  const pill = done ? status.done : active ? status.active : null;
  const src = actionIconSrc(action.type);

  return (
    <li
      className={[
        'sb-reveal rounded-2xl border bg-white px-3 py-3 shadow-sm',
        live ? 'sb-experience__action-pop border-slate-200' : 'border-slate-200 opacity-60',
        done ? 'border-emerald-200' : '',
        active ? 'border-sky-300' : '',
      ].join(' ')}
      data-action={action.type}
      data-state={done ? 'done' : active ? 'active' : 'waiting'}
    >
      <div className="flex items-center gap-3">
        {src ? (
          <img src={src} alt="" className={['h-11 w-11 shrink-0 object-contain', live ? '' : 'opacity-40'].join(' ')} />
        ) : (
          <span
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              live ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-400',
            ].join(' ')}
          >
            <ExperienceIcon name={action.type === 'wait' ? 'shift' : action.type} className="h-6 w-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">{action.label}</p>
            {pill && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-700">
                <span aria-hidden="true">✓</span>
                {pill}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            {live ? action.result : 'Waiting for this action to run.'}
          </p>
        </div>
        {src ? null : <ActionVisual action={action} live={live} />}
      </div>
    </li>
  );
}

export default ActionCard;
