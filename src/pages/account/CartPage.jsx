import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import { hasActivePlan } from '../../lib/roles';
import NoPointsOptions from '../../components/NoPointsOptions';
import { exchangeBlocked, planLatin, pointsUsed } from '../../lib/accountHelpers';
import Art from '../../components/Art';
import PageHead from '../../components/PageHead';

export default function CartPage() {
  const { state, run } = useApp();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);
  const [notes, setNotes] = useState('');
  const loggedIn = Boolean(getToken() && state?.auth);
  const savedNotes = state?.registration?.address?.notes || '';

  useEffect(() => {
    setNotes(savedNotes);
  }, [savedNotes]);

  if (!loggedIn) {
    return (
      <PageHead eyebrow="THE BOX" title="הקופסה שלי">
        <p>כדי למלא את הקופסה בתכשיטים, קודם מתחברות.</p>
        <div className="page-head-actions">
          <Link to="/login" className="btn">
            התחברות
          </Link>
          <Link to="/signup" className="btn btn-outline">
            הרשמה
          </Link>
        </div>
      </PageHead>
    );
  }

  if (!hasActivePlan(state)) {
    return (
      <PageHead eyebrow="THE BOX" title="הקופסה שלי">
        <p>כדי להזמין תכשיטים, קודם בוחרות מסלול.</p>
        <Link to="/account/plans" className="btn">
          לבחירת מסלול
        </Link>
      </PageHead>
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
      <PageHead eyebrow="THE BOX" title="ההזמנה התקבלה! ✦">
        <p>המחסן שלנו כבר מתחיל לארוז. אפשר לעקוב אחרי המשלוח באזור האישי.</p>
        <Link to="/account/me" className="btn">
          לאזור האישי
        </Link>
      </PageHead>
    );
  }

  return (
    <>
      <PageHead eyebrow="THE BOX" title="הקופסה שלי">
        <p>
          {planLatin(state.plan)} · נוצלו {used} נק׳ · נותרו {state.pointsTotal - used} נק׳ לבחירה
        </p>
      </PageHead>

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
                <>
                <div className="field" style={{ marginTop: 24 }}>
                  <label htmlFor="ship-notes">הערות למשלוח</label>
                  <input
                    id="ship-notes"
                    placeholder="קוד לבניין, שעות, השארה אצל שכן…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn"
                  disabled={over}
                  onClick={async () => {
                    const data = await run(() => api.confirmOrder({ notes: notes.trim() }));
                    if (data) setPlaced(true);
                  }}
                >
                  אישור הזמנה
                </button>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/catalog')}>
                  להוסיף עוד
                </button>
                </div>
                </>
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
