import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import { hasActivePlan } from '../../lib/roles';
import NoPointsOptions from '../../components/NoPointsOptions';
import { exchangeBlocked, planLatin, pointsUsed } from '../../lib/accountHelpers';
import Art from '../../components/Art';

export default function CartPage() {
  const { state, run } = useApp();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);
  const loggedIn = Boolean(getToken() && state?.auth);

  if (!loggedIn) {
    return (
      <div className="page-head container" style={{ paddingBottom: 64 }}>
        <h1>הקופסה שלי</h1>
        <p>כדי למלא את הקופסה בתכשיטים, קודם מתחברות.</p>
        <div style={{ marginTop: 24 }}>
          <Link to="/login" className="btn">
            התחברות
          </Link>{' '}
          <Link to="/signup" className="btn btn-outline" style={{ marginInlineStart: 10 }}>
            הרשמה
          </Link>
        </div>
      </div>
    );
  }

  if (!hasActivePlan(state)) {
    return (
      <div className="page-head container" style={{ paddingBottom: 64 }}>
        <h1>הקופסה שלי</h1>
        <p>כדי להזמין תכשיטים, קודם בוחרות מסלול.</p>
        <Link to="/account/plans" className="btn" style={{ marginTop: 24 }}>
          לבחירת מסלול
        </Link>
      </div>
    );
  }

  const items = state.cart || [];
  const used = Math.max(0, (state.pointsTotal || 0) - (state.remaining ?? 0) - (state.cartTotal || 0));
  const boxSum = state.cartTotal || 0;
  const remaining = state.remaining ?? 0;
  const over = remaining < 0;
  const blocked = exchangeBlocked(state);

  if (placed) {
    return (
      <div className="page-head container" style={{ paddingBottom: 64 }}>
        <h1>ההזמנה התקבלה! ✦</h1>
        <p>המחסן שלנו כבר מתחיל לארוז. אפשר לעקוב אחרי המשלוח באזור האישי.</p>
        <div style={{ marginTop: 24 }}>
          <Link to="/account/me" className="btn">
            לאזור האישי
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-head container">
        <h1>הקופסה שלי</h1>
        <p>
          {planLatin(state.plan)} · נוצלו {used} נק׳ · נותרו {state.pointsTotal - used} נק׳ לבחירה
        </p>
      </div>

      <section className="section" style={{ paddingTop: 36 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
              <p>הקופסה ריקה עדיין.</p>
              <Link to="/catalog" className="btn" style={{ marginTop: 18 }}>
                לקטלוג התכשיטים
              </Link>
            </div>
          ) : (
            <>
              <div className="items-list">
                {items.map((p) => (
                  <div className="item-row" key={p.id}>
                    <div className="thumb">
                      <Art product={p} />
                    </div>
                    <div className="grow">
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 300 }}>
                        {p.metal} · {p.stone} · {p.points} נק׳
                      </div>
                    </div>
                    <button type="button" className="btn-mini" onClick={() => run(() => api.removeFromCart(p.id))}>
                      הסרה
                    </button>
                  </div>
                ))}
              </div>

              <div className="box-summary">
                <div>
                  סה״כ בקופסה: <b>{boxSum} נק׳</b>
                </div>
                <div className={over ? 'over' : ''}>
                  {over
                    ? `חריגה של ${-remaining} נק׳ מהמכסה — הסירי פריט או שדרגי מסלול`
                    : `יישארו לך ${remaining} נק׳ פנויות`}
                </div>
              </div>

              {over && <NoPointsOptions missing={-remaining} />}

              {blocked ? (
                <div className="blocked-panel" style={{ marginTop: 24 }}>
                  <p>
                    <b>לא ניתן לבצע כרגע החלפה חדשה</b> — ההחזרה מההחלפה הקודמת עדיין לא הושלמה.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn"
                  disabled={over}
                  onClick={async () => {
                    const data = await run(() => api.confirmOrder());
                    if (data) setPlaced(true);
                  }}
                >
                  אישור הזמנה
                </button>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/catalog')}>
                  להוסיף עוד
                </button>
                </div>
              )}
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 300, marginTop: 14 }}>
                משלוח דו-חודשי כלול במנוי · החלפות ללא הגבלה · משלוח החלפה נוסף ₪65.
                את המוחזרים מכניסים לנרתיק שמגיע עם המשלוח.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
