import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { isTopPlan } from '../lib/accountHelpers';

export default function NoPointsOptions({ missing }) {
  const { state } = useApp();
  const top = isTopPlan(state);

  const options = [
    !top && {
      to: '/plans',
      title: 'שדרוג המנוי',
      desc: 'עוברים למסלול עם יותר נקודות',
    },
    { to: '/exchange', title: 'החלפת תכשיט שאצלך', desc: 'סמני מה להחזיר — הנקודות משתחררות מיד' },
    { to: '/catalog', title: 'תכשיט אחר מהקטלוג', desc: 'בחרי משהו יפה שמתאים לנקודות שנשארו' },
  ].filter(Boolean);

  return (
    <div className="opts-panel">
      <div className="opts-head">
        אין מספיק נקודות פנויות{missing > 0 ? ` — חסרות ${missing} נק׳` : ''}. מה עושים?
      </div>
      <div className="opts-grid">
        {options.map((o, i) => (
          <Link to={o.to} className="opt-card" key={o.to}>
            <span className="opt-num">{i + 1}</span>
            <span>
              <span className="opt-title">{o.title}</span>
              <span className="opt-desc">{o.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
