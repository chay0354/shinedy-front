import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { getToken } from '../../lib/auth';
import { useApp } from '../../state/AppContext';
import { SHARED_TERMS } from '../../lib/site';
import { enrichPlan } from '../../lib/plans';

export default function PlansPage() {
  const { state, run, error } = useApp();
  const navigate = useNavigate();
  const plans = (state?.plans || []).map(enrichPlan);
  const inAccount = window.location.pathname.startsWith('/account');
  const loggedIn = Boolean(getToken() && state?.auth);
  const current = loggedIn && state?.planId
    ? plans.find((p) => p.id === state.planId) || enrichPlan(state.plan || {})
    : null;
  const [confirm, setConfirm] = useState(null);
  const [done, setDone] = useState('');
  const [err, setErr] = useState('');

  async function pickPlan(planId) {
    if (!getToken()) {
      navigate(`/signup?plan=${planId}`);
      return;
    }
    const data = await run(() => api.subscribe(planId));
    if (!data) return;
    navigate(inAccount ? '/account/me' : '/catalog');
  }

  async function approve() {
    setErr('');
    const data = await run(() => api.changePlan(confirm.id));
    if (!data) return;
    setDone(`המסלול שלך עודכן ל-${confirm.latin} ✓`);
    setConfirm(null);
  }

  return (
    <>
      <div className="page-head container">
        <h1>מסלולי מנוי</h1>
        <p>
          {current
            ? 'המעבר בין מסלולים הוא באישור אחד — בלי הרשמה מחדש'
            : 'בחרי את המסלול שהכי מתאים לך'}
        </p>
      </div>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          {done && (
            <p className="msg-ok" style={{ marginBottom: 20 }}>
              {done}
            </p>
          )}
          {(err || error) && (
            <p className="form-err" style={{ marginBottom: 20 }}>
              {err || error}
            </p>
          )}

          <div className="plans-grid">
            {plans.map((plan) => {
              const isCurrent = current && current.id === plan.id;
              const isUpgrade = current && plan.points > current.points;
              return (
                <div
                  key={plan.id}
                  className={`plan-card${plan.featured ? ' featured' : ''}${isCurrent ? ' mine' : ''}`}
                >
                  {isCurrent ? (
                    <div className="flag">המסלול שלך</div>
                  ) : (
                    plan.featured && <div className="flag">הכי פופולרי</div>
                  )}
                  <div className="plan-name">{plan.latin}</div>
                  <div className="price">
                    ₪{plan.price}
                    <small> לחודש</small>
                  </div>
                  <div className="materials">{plan.materials}</div>
                  <ul>
                    {plan.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                  {!loggedIn && (
                    <Link to={`/signup?plan=${plan.id}`} className={`btn${plan.featured ? ' btn-tan' : ''}`}>
                      אני בוחרת
                    </Link>
                  )}
                  {loggedIn && isCurrent && (
                    <button type="button" className="btn btn-outline" disabled>
                      המסלול הנוכחי שלך
                    </button>
                  )}
                  {loggedIn && !isCurrent && current && (
                    <button
                      type="button"
                      className={`btn${plan.featured ? ' btn-tan' : ''}`}
                      onClick={() => {
                        setDone('');
                        setErr('');
                        setConfirm(plan);
                      }}
                    >
                      {isUpgrade ? 'שדרוג למסלול הזה' : 'מעבר למסלול הזה'}
                    </button>
                  )}
                  {loggedIn && !current && (
                    <button
                      type="button"
                      className={`btn${plan.featured ? ' btn-tan' : ''}`}
                      onClick={() => pickPlan(plan.id)}
                    >
                      אני בוחרת
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="plans-note-line">
            ללא התחייבות<span className="dot">•</span>ניתן לבטל בכל עת
          </div>

          <div className="plans-terms">
            <strong>טוב לדעת:</strong>
            <ul style={{ margin: '10px 0 0 0', paddingInlineStart: 22 }}>
              {SHARED_TERMS.map((t) => (
                <li key={t} style={{ marginBottom: 6 }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {confirm && current && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-x" onClick={() => setConfirm(null)} aria-label="סגירה">
              ×
            </button>
            <h2>{confirm.points > current.points ? 'אישור שדרוג מנוי' : 'אישור מעבר מסלול'}</h2>
            <p className="modal-sub">
              ממסלול {current.latin} למסלול {confirm.latin}
            </p>
            <div className="plan-diff">
              <div>
                <span className="pd-lab">מכסת נקודות</span>
                <span>
                  מ-{current.points} ל-<b>{confirm.points}</b>
                </span>
              </div>
              <div>
                <span className="pd-lab">דמי מנוי לחודש</span>
                <span>
                  מ-₪{current.price} ל-<b>₪{confirm.price}</b>
                </span>
              </div>
              <div>
                <span className="pd-lab">חומרים</span>
                <span>{confirm.materials}</span>
              </div>
            </div>
            <p className="modal-legal">
              התקנון והחוזה שאישרת בהרשמה חלים גם על המסלול החדש — אין צורך בהרשמה מחדש.
              החיוב החדש ייכנס לתוקף במחזור החיוב הבא, וכל התכשיטים שאצלך נשארים אצלך.
            </p>
            <button type="button" className="btn btn-wide" onClick={approve}>
              {confirm.points > current.points ? 'אישור השדרוג' : 'אישור המעבר'}
            </button>
            <button type="button" className="modal-cancel" onClick={() => setConfirm(null)}>
              ביטול
            </button>
          </div>
        </div>
      )}
    </>
  );
}
