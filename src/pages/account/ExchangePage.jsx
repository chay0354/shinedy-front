import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import { activeUnits, exchangeBlocked, openReturns, planLatin, pointsUsed } from '../../lib/accountHelpers';
import Art from '../../components/Art';
import PageHead from '../../components/PageHead';

export default function ExchangePage() {
  const { state, run } = useApp();
  const navigate = useNavigate();

  if (!getToken()) return <Navigate to="/login" replace />;

  const units = activeUnits(state);
  const marked = state?.exchangeReturns || [];
  const blocked = exchangeBlocked(state);
  const used = pointsUsed(state);
  const available = Math.max(0, (state?.pointsTotal || 0) - used);
  const freed = units
    .filter((u) => marked.includes(u.serial))
    .reduce((s, u) => s + (u.product.points || 0), 0);

  if (blocked) {
    return (
      <PageHead eyebrow="EXCHANGE" title="החלפת תכשיטים" mark={false}>
        <div className="blocked-panel">
          <p>
            <b>לא ניתן לבצע כרגע החלפה חדשה</b> מכיוון שההחזרה מההחלפה הקודמת עדיין לא הושלמה.
          </p>
          <p>לאחר שהתכשיטים יתקבלו וייסרקו במחסן, אפשרות ההחלפה תיפתח אוטומטית.</p>
          <p style={{ marginTop: 14 }}>
            <Link to="/contact" className="link-gold">
              צרי קשר עם שירות הלקוחות
            </Link>
          </p>
        </div>
      </PageHead>
    );
  }

  if (units.length === 0) {
    return (
      <PageHead eyebrow="EXCHANGE" title="החלפת תכשיטים">
        <p>עדיין אין אצלך תכשיטים להחזרה — פשוט בוחרים מהקטלוג.</p>
        <Link to="/catalog" className="btn">
          לקטלוג התכשיטים
        </Link>
      </PageHead>
    );
  }

  return (
    <>
      <PageHead eyebrow="EXCHANGE" title="החלפת תכשיטים">
        <p>
          שלב 1: סמני אילו תכשיטים תרצי להחזיר — הנקודות שלהם משתחררות מיד.
          שלב 2: בוחרים חדשים בקטלוג. את המוחזרים מכניסים לנרתיק שמגיע עם המשלוח.
        </p>
      </PageHead>

      <section className="section" style={{ paddingTop: 30 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          {openReturns(state).map((r) => (
            <div className="return-progress" key={r.id} style={{ marginBottom: 12 }}>
              החזרה פתוחה ({r.id}) · סטטוס: {r.statusLabel || r.status}
            </div>
          ))}

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
                    {isMarked && <div className="marked-note">מוחזר בהחלפה ✓</div>}
                  </div>
                  <button
                    type="button"
                    className={`btn-mini${isMarked ? ' strong' : ''}`}
                    onClick={() => run(() => api.toggleReturn(u.serial))}
                  >
                    {isMarked ? 'ביטול' : 'החזירי בהחלפה'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="box-summary" style={{ marginTop: 24 }}>
            <div>
              סימנת להחזרה: <b>{marked.length}</b> תכשיטים
            </div>
            <div>
              נקודות שישתחררו: <b>{freed}</b> · סה״כ לבחירה בקטלוג: <b>{available}</b> נק׳
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-tan" onClick={() => navigate('/catalog')}>
              המשיכי לבחירת תכשיטים בקטלוג ←
            </button>
            <Link to="/account/me" className="btn btn-outline">
              חזרה לאזור האישי
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
