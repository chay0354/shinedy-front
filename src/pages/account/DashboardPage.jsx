import { Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import { clearSession } from '../../lib/auth';
import {
  activeUnits,
  exchangeBlocked,
  heDate,
  isTopPlan,
  openReturns,
  planLatin,
  pointsUsed,
} from '../../lib/accountHelpers';
import { enrichPlan } from '../../lib/plans';
import Art from '../../components/Art';

const STEPS = ['התקבלה', 'נארזה', 'נשלחה', 'נמסרה'];

function stepIndex(status) {
  if (status === 'ליקוט' || status === 'חדשה' || status === 'בליקוט') return 0;
  if (status === 'בקרה' || status === 'נארזה') return 1;
  if (status === 'אריזה') return 1;
  if (status === 'נשלח' || status === 'נשלחה') return 2;
  if (status === 'נמסרה') return 3;
  return -1;
}

export default function DashboardPage() {
  const { state, run, refresh } = useApp();
  const [buyMsg, setBuyMsg] = useState('');

  if (!getToken()) return <Navigate to="/login" replace />;

  const name = state?.registration?.name || 'לקוחה';
  const plan = enrichPlan(state?.plan || {});
  const units = activeUnits(state);
  const marked = state?.exchangeReturns || [];
  const used = pointsUsed(state);
  const myOrders = state?.myOrders || [];
  const lastShip = state?.myActiveOrders?.[0] || myOrders.find((o) => o.isActive);
  const history = myOrders.filter((o) => !o.isActive);
  const credits = state?.credits || 0;
  const blocked = exchangeBlocked(state);
  const returns = openReturns(state);
  const remaining = Math.max(0, state?.remaining ?? 0);

  async function logout() {
    try {
      await run(() => api.logout());
    } catch {
      /* ignore */
    } finally {
      clearSession();
      await refresh();
    }
  }

  return (
    <>
      {blocked && (
        <div className="container" style={{ paddingTop: 20 }}>
          <div className="blocked-panel">
            <b>ההחלפות מושהות זמנית:</b> התכשיטים מההחלפה האחרונה עדיין לא התקבלו אצלנו.
          </div>
        </div>
      )}

      {returns.map((r) => (
        <div className="container" style={{ paddingTop: 12 }} key={r.id}>
          <div className="return-progress">
            החזרה פתוחה ({r.id}) · {r.statusLabel || r.status}
          </div>
        </div>
      ))}

      <div className="page-head container" style={{ textAlign: 'right', paddingBottom: 32 }}>
        <h1>שלום, {name} ✦</h1>
        <p style={{ margin: '8px 0 0' }}>
          {planLatin(plan)} · {plan.name} · ₪{plan.price} לחודש
          <button type="button" className="btn-mini" style={{ marginInlineStart: 14 }} onClick={logout}>
            התנתקות
          </button>
        </p>
      </div>

      <section className="container" style={{ paddingBottom: 72 }}>
        <div className="account-grid">
          <div className="stat-card">
            <div className="label">נקודות זמינות</div>
            <div className="value">
              {remaining} / {state.pointsTotal ?? 0}
            </div>
            <div className="hint">נוצלו {used} נקודות</div>
          </div>
          <div className="stat-card">
            <div className="label">תכשיטים אצלך</div>
            <div className="value">{units.length}</div>
            <div className="hint">ללא הגבלת פריטים — רק נקודות</div>
          </div>
          <div className="stat-card credit-card">
            <div className="label">קרדיטים לרכישה</div>
            <div className="value">₪{Math.round(credits).toLocaleString()}</div>
            <div className="hint">נצברים לאורך המנוי · לרכישת תכשיטים שאהבת</div>
          </div>
          <div className="stat-card">
            <div className="label">החלפות</div>
            <div className="value" style={{ fontSize: '1.5rem' }}>
              ללא הגבלה
            </div>
            <div className="hint">משלוח דו-חודשי כלול · נוסף ₪65</div>
          </div>
        </div>

        {remaining <= 0 && state.pointsTotal > 0 && (
          <div className="quota-panel">
            <b>
              ניצלת את כל מכסת הנקודות של מסלול {planLatin(plan)}.
            </b>
            <p>{isTopPlan(state) ? 'כדי לבחור תכשיט נוסף:' : 'כדי לבחור תכשיט נוסף יש שתי אפשרויות:'}</p>
            <div className="quota-actions">
              <Link className="btn btn-sm" to="/exchange">
                להחליף תכשיט שאצלך
              </Link>
              {!isTopPlan(state) && (
                <Link className="btn btn-outline btn-sm" to="/plans">
                  לשדרג מסלול
                </Link>
              )}
            </div>
          </div>
        )}

        {lastShip && (
          <>
            <h2 style={{ marginBottom: 14 }}>המשלוח האחרון</h2>
            <div className="ship-card">
              <div className="ship-head">
                <span>
                  הזמנה {lastShip.id} · {lastShip.type}
                </span>
                <span className="ship-date">{lastShip.date}</span>
              </div>
              <div className="ship-steps">
                {STEPS.map((s, i) => {
                  const cur = stepIndex(lastShip.status);
                  return (
                    <div key={s} className={`ship-step${i <= cur ? ' done' : ''}`}>
                      <span className="ship-dot">{i <= cur ? '✓' : i + 1}</span>
                      <span>{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <h2 style={{ margin: '38px 0 14px' }}>התכשיטים שאצלך</h2>
        {units.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontWeight: 300 }}>
            עדיין אין תכשיטים אצלך —{' '}
            <Link to="/catalog" className="link-gold">
              בואי לבחור מהקטלוג
            </Link>
          </p>
        ) : (
          <>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 300, marginBottom: 10 }}>
              רוצה לפנות נקודות? סמני תכשיט להחלפה — הנקודות שלו משתחררות מיד.
            </p>
            <div className="items-list">
              {units.map((u) => {
                const isMarked = marked.includes(u.serial);
                return (
                  <div className={`item-row${isMarked ? ' marked' : ''}`} key={u.serial}>
                    <div className="thumb">
                      <Art product={u.product} />
                    </div>
                    <div className="grow">
                      <div style={{ fontWeight: 600 }}>{u.product.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 300 }}>
                        {u.product.metal} · {u.product.stone} · {u.product.points} נק׳
                      </div>
                      {isMarked && (
                        <div className="marked-note">מסומן להחלפה ✓ — {u.product.points} נק׳ שוחררו</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-mini"
                      onClick={() => run(() => api.toggleReturn(u.serial))}
                    >
                      {isMarked ? 'ביטול סימון' : 'סמני להחלפה'}
                    </button>
                  </div>
                );
              })}
            </div>
            {buyMsg && (
              <p className="msg-ok" style={{ marginTop: 12 }}>
                {buyMsg}
              </p>
            )}
          </>
        )}

        {history.length > 0 && (
          <>
            <h2 style={{ margin: '38px 0 14px' }}>השכרות קודמות</h2>
            <div className="items-list">
              {history.map((o) => (
                <div className="item-row" key={o.id}>
                  <div className="grow">
                    <div style={{ fontWeight: 600 }}>
                      {o.id} · {o.type}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 300 }}>
                      {o.itemsLabel || o.customerStatus}
                    </div>
                  </div>
                  <div className="status" style={{ color: 'var(--muted)' }}>
                    {heDate(o.date)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: 34, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/exchange" className="btn btn-tan">
            בצעי החלפה
          </Link>
          <Link to="/box" className="btn btn-outline">
            לקופסה שלי
          </Link>
          <Link to="/account/history" className="btn btn-outline">
            היסטוריה
          </Link>
        </div>
      </section>
    </>
  );
}
