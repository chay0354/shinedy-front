import { useApp } from '../state/AppContext';
import { hasActivePlan } from '../lib/roles';

export default function PointsBar() {
  const { state } = useApp();
  if (!state?.auth || !hasActivePlan(state)) return null;

  const plan = state.plan || {};
  const inBox = state.cartTotal || 0;
  const remaining = Math.max(0, state.remaining ?? 0);
  const used = Math.max(0, (state.pointsTotal || 0) - remaining - inBox);
  const raw = (state.pointsTotal || plan.points || 0) - used - inBox;
  const over = raw < 0;

  return (
    <div className="points-bar">
      <span className="pb-plan">{plan.latin || plan.name}</span>
      <span>
        המכסה שלך: <b>{state.pointsTotal ?? plan.points ?? 0}</b> נק׳
      </span>
      <span>·</span>
      <span>
        אצלך: <b>{used}</b>
      </span>
      <span>·</span>
      <span>
        בקופסה: <b>{inBox}</b>
      </span>
      <span>·</span>
      <span className={remaining === 0 ? 'pb-neg' : 'pb-left'}>
        נשארו לבחירה: <b>{remaining}</b>
      </span>
      {(over || remaining === 0) && (
        <span className="pb-note">המכסה מנוצלת — האפשרויות באזור האישי</span>
      )}
    </div>
  );
}
