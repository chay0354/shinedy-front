import { Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { getToken, clearSession } from '../../lib/auth';
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
import PurchaseDialog from '../../components/PurchaseDialog';

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
  const [buying, setBuying] = useState(null);

  if (!getToken()) return <Navigate to="/login" replace />;

  const name = state?.registration?.name || state?.registration?.fullName || 'לקוחה';
  const plan = enrichPlan(state?.plan || {});
  const units = activeUnits(state);
  const marked = state?.exchangeReturns || [];
  const used = pointsUsed(state);
  const myOrders = state?.myOrders || [];
  const lastShip = state?.myActiveOrders?.[0] || myOrders.find((o) => o.isActive);
  const credits = state?.credits || 0;
  const creditMonths = state?.creditMonths || 0;
  const creditPct = state?.creditPct || 10;
  const blocked = exchangeBlocked(state);
  const returns = openReturns(state);
  const remaining = Math.max(0, state?.remaining ?? 0);
  const purchases = state?.myPurchases || [];
  const pastRentals = state?.pastRentals || [];
  const user = {
    name,
    phone: state?.registration?.phone,
    email: state?.registration?.email,
    address: state?.registration?.address,
    payment: state?.registration?.payment,
  };

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
      {state?.registration?.suspended && (
        <div className="container" style={{ paddingTop: 20 }}>
          <div className="blocked-panel">
            <b>המנוי שלך מושהה.</b> בתקופת ההשהיה לא ניתן לבצע הזמנות והחלפות, ואינך מחויבת.
            להפעלה מחדש — צרי איתנו קשר.
          </div>
        </div>
      )}
      {blocked && (
        <div className="container" style={{ paddingTop: 20 }}>
          <div className="blocked-panel">
            <b>ההחלפות מושהות זמנית:</b> התכשיטים מההחלפה האחרונה עדיין לא התקבלו אצלנו.
            לאחר שהם ייסרקו במחסן, אפשרות ההחלפה תיפתח מחדש אוטומטית.
          </div>
        </div>
      )}

      {returns.map((r) => (
        <div className="container" style={{ paddingTop: 12 }} key={r.id}>
          <div className="return-progress">
            החזרה פתוחה ({r.id}): {r.statusLabel || r.status}
            {r.items?.length ? ` · ${r.items.length} פריטים` : ''}
            {r.items?.some((i) => i.unitId) && (
              <span className="cell-sub">
                {' '}
                · {r.items.map((i) => i.unitId).filter(Boolean).join(', ')}
              </span>
            )}
          </div>
        </div>
      ))}

      <div className="page-head container" style={{ textAlign: 'right', paddingBottom: 32 }}>
        <h1>שלום, {name} ✦</h1>
        <p style={{ margin: '8px 0 0' }}>
          {planLatin(plan)} · {plan.name} · ₪{plan.price} לחודש
          <Link to="/plans" className="btn-mini" style={{ marginInlineStart: 14 }}>
            שינוי / ביטול מנוי
          </Link>
          <button type="button" className="btn-mini" style={{ marginInlineStart: 8 }} onClick={logout}>
            התנתקות
          </button>
        </p>
      </div>

      <section className="container" style={{ paddingBottom: 72 }}>
        <div className="account-actions">
          {!state?.registration?.suspended && (
            <>
              <Link to="/exchange" className="btn btn-tan">
                בצעי החלפה
              </Link>
              <Link to="/box" className="btn btn-outline">
                לקופסה שלי
              </Link>
            </>
          )}
          {state?.subscribed && !state?.registration?.suspended && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={async () => {
                if (
                  !window.confirm(
                    'להקפיא את המנוי? לא תחויבי ולא תוכלי להזמין עד ההפעלה מחדש. יש להחזיר קודם את התכשיטים שאצלך.',
                  )
                ) {
                  return;
                }
                await run(() => api.suspendSubscription());
              }}
            >
              הקפאת מנוי
            </button>
          )}
          {state?.registration?.suspended && (
            <button
              type="button"
              className="btn btn-tan"
              onClick={async () => {
                await run(() => api.resumeSubscription());
              }}
            >
              הפעלת מנוי מחדש
            </button>
          )}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 300, margin: '12px 0 28px' }}>
          מחליפות פשוט: מסמנות מה מחזירות, בוחרות חדשים בקטלוג — ונרתיק ההחזרה מגיע עם המשלוח.
        </p>
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
            <div className="hint">
              {creditPct}% מדמי המנוי נצברים לך כל חודש · {creditMonths} חודשי מנוי
            </div>
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
            <b>ניצלת את כל מכסת הנקודות של מסלול {planLatin(plan)}.</b>
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
              {lastShip.tracking && (
                <div style={{ marginTop: 14, fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 300 }}>
                  מספר מעקב אצל חברת המשלוחים: <b dir="ltr">{lastShip.tracking}</b>
                  {lastShip.trackingStatus ? ` · ${lastShip.trackingStatus}` : ''}
                </div>
              )}
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
              רוצה לפנות נקודות? סמני תכשיט להחלפה — הנקודות שלו משתחררות מיד, ותחזירי אותו בנרתיק עם
              המשלוח הבא.
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
                        <div className="marked-note">
                          מסומן להחלפה ✓ — {u.product.points} נק׳ שוחררו לבחירה
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" className="btn-mini" onClick={() => run(() => api.toggleReturn(u.serial))}>
                        {isMarked ? 'ביטול סימון' : 'סמני להחלפה'}
                      </button>
                      {u.product.price ? (
                        <button
                          type="button"
                          className="btn-mini strong"
                          title={`מחיר ₪${Number(u.product.price).toLocaleString()} · קרדיט זמין ₪${Math.round(credits)}`}
                          onClick={() => {
                            setBuyMsg('');
                            setBuying(u);
                          }}
                        >
                          רכישה ₪{Number(u.product.price).toLocaleString()}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            {buyMsg && (
              <p className="msg-ok" style={{ marginTop: 12 }}>
                {buyMsg}
              </p>
            )}
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 300, marginTop: 10 }}>
              אפשר לרכוש כל תכשיט שאצלך — הקרדיטים שצברת ({`₪${Math.round(credits)}`}) משמשים כשקלים
              ומופחתים מהמחיר.
            </p>
          </>
        )}

        <h2 style={{ margin: '38px 0 14px' }}>השכרות קודמות</h2>
        {pastRentals.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontWeight: 300 }}>עדיין אין תכשיטים שהוחזרו.</p>
        ) : (
          <div className="items-list">
            {pastRentals.map((r, i) => (
              <div className="item-row" key={(r.serial || r.orderId) + i}>
                <div className="thumb">
                  <Art product={r.product} />
                </div>
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>{r.product.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 300 }}>
                    {r.product.metal} · {r.product.stone} · הזמנה {r.orderId}
                  </div>
                </div>
                <div className="status" style={{ color: 'var(--muted)' }}>
                  {heDate(r.date)}
                  {r.returnedAt ? ` — ${heDate(r.returnedAt)}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ margin: '38px 0 14px' }}>רכישות קודמות</h2>
        {purchases.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontWeight: 300 }}>
            עדיין לא רכשת תכשיטים. כל תכשיט שאצלך ניתן לרכישה, והקרדיטים שצברת מופחתים מהמחיר.
          </p>
        ) : (
          <div className="items-list">
            {purchases.map((p) => {
              const prod = (state.products || []).find((x) => x.id === p.pid);
              return (
                <div className="item-row" key={p.id}>
                  {prod && (
                    <div className="thumb">
                      <Art product={prod} />
                    </div>
                  )}
                  <div className="grow">
                    <div style={{ fontWeight: 600 }}>
                      {p.name} <span className="pill ok">נרכש ✓</span>
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 300 }}>
                      {heDate(p.date)} · מק״ט <span dir="ltr">{p.sku}</span> · פריט{' '}
                      <span dir="ltr">{p.serial}</span>
                    </div>
                  </div>
                  <div className="status" style={{ textAlign: 'start' }}>
                    ₪{Number(p.price || 0).toLocaleString()}
                    <div style={{ color: 'var(--muted)', fontWeight: 300, fontSize: '0.82rem' }}>
                      קרדיט ₪{Math.round(p.creditUsed || 0)} · שולם ₪{Math.round(p.paid || 0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      <PurchaseDialog
        open={!!buying}
        onClose={() => setBuying(null)}
        item={buying}
        price={buying ? Number(buying.product.price) || 0 : 0}
        credit={credits}
        user={user}
        onConfirm={async (opts) => {
          const data = await run(() =>
            api.purchase({
              productId: buying.pid || buying.product.id,
              serial: buying.serial,
              ...opts,
            }),
          );
          setBuyMsg(data?.purchase?.msg || data?.flash || '');
          setBuying(null);
        }}
      />
    </>
  );
}
