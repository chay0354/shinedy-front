import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { getToken } from '../../lib/auth';
import { useApp } from '../../state/AppContext';
import { SHARED_TERMS } from '../../lib/site';
import {
  matchesPlanId,
  publicCatalogPlans,
  signupHref,
  subscribePlanId,
} from '../../lib/plans';

export default function PlansPage() {
  const { state, run, error } = useApp();
  const navigate = useNavigate();
  const plans = publicCatalogPlans(state?.plans);
  const inAccount = window.location.pathname.startsWith('/account');
  const loggedIn = Boolean(getToken() && state?.auth);
  const current = loggedIn && state?.planId
    ? plans.find((p) => matchesPlanId(p.id, state.planId)) || null
    : null;
  const [confirm, setConfirm] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [done, setDone] = useState('');
  const [err, setErr] = useState('');

  function guestSignup(planId) {
    navigate(signupHref(planId));
  }

  async function pickPlan(planId) {
    if (!loggedIn) {
      guestSignup(planId);
      return;
    }
    const data = await run(() => api.subscribe(subscribePlanId(planId, state?.plans)));
    if (!data) return;
    navigate(inAccount ? '/account/me' : '/catalog');
  }

  async function approve() {
    setErr('');
    const data = await run(() => api.changePlan(subscribePlanId(confirm.id, state?.plans)));
    if (!data) return;
    setDone(`המסלול שלך עודכן ל-${confirm.latin} ✓`);
    setConfirm(null);
  }

  async function cancelSub() {
    setErr('');
    const data = await run(() => api.cancelSubscription());
    if (!data) return;
    setDone('המנוי בוטל. אפשר לבחור מסלול ולהצטרף מחדש בכל עת.');
    setCancelOpen(false);
  }

  return (
    <>
      <div className="page-head container">
        <h1>מסלולי מנוי</h1>
        <p>
          {current
            ? 'אפשר לשנות מסלול או לבטל — בלי הרשמה מחדש'
            : loggedIn
              ? 'בחרי מסלול כדי להפעיל את המנוי'
              : 'בחרי מסלול — כל בחירה מתחילה את אותה הרשמה'}
        </p>
      </div>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          {current && (
            <div className="sub-manage">
              <div className="sub-now">
                המנוי הפעיל: {current.latin}
                <span>₪{current.price} לחודש · {current.points} נקודות · {current.materials}</span>
              </div>
              <div className="sub-manage-actions">
                <a href="#plan-cards" className="btn btn-sm">
                  שינוי מסלול
                </a>
                <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => setCancelOpen(true)}>
                  ביטול מנוי
                </button>
              </div>
            </div>
          )}

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

          <div className="plans-grid" id="plan-cards">
            {plans.map((plan) => {
              const isCurrent = Boolean(current && matchesPlanId(current.id, plan.id));
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
                  <div className="plan-actions">
                    {!loggedIn && (
                      <Link to={signupHref(plan.id)} className={`btn${plan.featured ? ' btn-tan' : ''}`}>
                        אני בוחרת
                      </Link>
                    )}
                    {loggedIn && isCurrent && (
                      <>
                        <button type="button" className="btn btn-outline" disabled>
                          מנוי פעיל
                        </button>
                        <button type="button" className="link-quiet" onClick={() => setCancelOpen(true)}>
                          ביטול המנוי הזה
                        </button>
                      </>
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
            <h2>{confirm.points > current.points ? 'שינוי מסלול — שדרוג' : 'שינוי מסלול'}</h2>
            <p className="modal-sub">
              מ-{current.latin} ל-{confirm.latin}
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
              התקנון שאישרת בהרשמה חל גם על המסלול החדש. החיוב החדש ייכנס במחזור הבא, והתכשיטים שאצלך נשארים אצלך.
            </p>
            <button type="button" className="btn btn-wide" onClick={approve}>
              אישור השינוי
            </button>
            <button type="button" className="modal-cancel" onClick={() => setConfirm(null)}>
              להישאר במסלול הנוכחי
            </button>
          </div>
        </div>
      )}

      {cancelOpen && current && (
        <div className="modal-overlay" onClick={() => setCancelOpen(false)}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-x" onClick={() => setCancelOpen(false)} aria-label="סגירה">
              ×
            </button>
            <h2>ביטול מנוי</h2>
            <p className="modal-sub">מסלול {current.latin} · ₪{current.price} לחודש</p>
            <p className="modal-legal">
              לא יבוצע חיוב נוסף אחרי הביטול. אם יש תכשיטים אצלך או החזרה פתוחה — צריך להשלים אותם קודם, לפי התקנון.
            </p>
            <button type="button" className="btn btn-wide btn-danger-ghost" onClick={cancelSub}>
              כן, לבטל את המנוי
            </button>
            <button type="button" className="modal-cancel" onClick={() => setCancelOpen(false)}>
              להישאר במנוי
            </button>
          </div>
        </div>
      )}
    </>
  );
}
