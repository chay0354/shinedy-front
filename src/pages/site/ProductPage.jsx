import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import { hasActivePlan } from '../../lib/roles';
import { PLAN_NAME } from '../../lib/site';
import { isTopPlan } from '../../lib/accountHelpers';
import Art from '../../components/Art';
import QuotaDialog from '../../components/QuotaDialog';
import PurchaseDialog from '../../components/PurchaseDialog';
import {
  IconDiamond,
  IconList,
  IconRefresh,
  IconShield,
  IconSparkle,
  IconTruck,
} from '../../components/icons';

const BENEFITS = [
  { icon: IconTruck, t: 'משלוח כלול' },
  { icon: IconShield, t: 'בלאי סביר עלינו' },
  { icon: IconRefresh, t: 'החלפות ללא הגבלה' },
  { icon: IconSparkle, t: 'ניקוי מקצועי' },
];

export default function ProductPage() {
  const { id } = useParams();
  const { state, run } = useApp();
  const [thumb, setThumb] = useState(0);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyMsg, setBuyMsg] = useState('');
  const p = (state?.products || []).find((x) => x.id === id);
  const loggedIn = Boolean(getToken() && state?.auth);
  const subscribed = hasActivePlan(state);
  const inBox = (state?.cart || []).some((x) => x.id === p?.id);
  const remaining = state?.remaining ?? 0;
  const orderable = p?.inStock !== false;
  const user = loggedIn
    ? { name: state?.registration?.name, phone: state?.registration?.phone, email: state?.registration?.email }
    : null;

  if (!p) {
    return (
      <div className="page-head container">
        <h1>הפריט לא נמצא</h1>
        <p>
          <Link to="/catalog" className="back-link">
            → חזרה לקטלוג
          </Link>
        </p>
      </div>
    );
  }

  async function tryAdd() {
    try {
      await run(() => api.addToCart(p.id));
    } catch {
      setQuotaOpen(true);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <Link to="/catalog" className="back-link">
          → חזרה לקטלוג
        </Link>
        <div className="product-layout">
          <div className="product-gallery">
            <div className="thumbs">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`thumb${i === thumb ? ' on' : ''}`}
                  onClick={() => setThumb(i)}
                  aria-label={`תמונה ${i + 1}`}
                >
                  <Art product={p} />
                </button>
              ))}
            </div>
            <div className="main-art">
              <Art product={p} />
            </div>
          </div>

          <div>
            <h1>{p.name}</h1>
            <div className="points-line">
              <span className="big">{p.points} נקודות</span>
              <span className="rest"> · במסגרת המנוי שלך</span>
            </div>
            {p.desc ? (
              <p style={{ color: 'var(--muted)', fontWeight: 300, margin: '10px 0 4px' }}>{p.desc}</p>
            ) : null}

            <div className="spec-rows">
              <div className="spec-row">
                <IconList size={20} />
                <span className="lab">קטגוריה</span>
                <span>{p.category}</span>
              </div>
              <div className="spec-row">
                <IconSparkle size={20} />
                <span className="lab">מתכת</span>
                <span>{p.metal}</span>
              </div>
              <div className="spec-row">
                <IconDiamond size={20} />
                <span className="lab">אבן</span>
                <span>{p.stone}</span>
              </div>
              {p.sizes ? (
                <div className="spec-row">
                  <IconRefresh size={20} />
                  <span className="lab">מידות</span>
                  <span>{p.sizes}</span>
                </div>
              ) : null}
              <div className="spec-row">
                <IconShield size={20} />
                <span className="lab">זמינות</span>
                <span>
                  {orderable
                    ? PLAN_NAME[p.minPlan]
                      ? `זמין — החל מ${PLAN_NAME[p.minPlan]}`
                      : 'זמין להזמנה'
                    : 'אזל מהמלאי'}
                </span>
              </div>
              {p.price ? (
                <div className="spec-row">
                  <IconSparkle size={20} />
                  <span className="lab">מחיר לרכישה</span>
                  <span>₪{Number(p.price).toLocaleString()}</span>
                </div>
              ) : null}
            </div>

            <div className="product-ctas">
              {!loggedIn && (
                <Link to="/login" className="btn">
                  התחברי כדי להזמין
                </Link>
              )}
              {loggedIn && !subscribed && (
                <Link to="/account/plans" className="btn">
                  בחרי מסלול להזמנה
                </Link>
              )}
              {loggedIn && subscribed && inBox && (
                <Link to="/box" className="btn btn-tan">
                  בקופסה שלך ✓ — לצפייה
                </Link>
              )}
              {loggedIn && subscribed && !inBox && orderable && (
                <button type="button" className="btn" onClick={tryAdd}>
                  הוספה לקופסה
                </button>
              )}
              {loggedIn && subscribed && !inBox && !orderable && (
                <button type="button" className="btn" disabled>
                  אזל מהמלאי
                </button>
              )}
              {orderable && p.price ? (
                <button
                  type="button"
                  className={loggedIn ? 'btn btn-outline' : 'btn btn-tan'}
                  onClick={() => {
                    setBuyMsg('');
                    setBuyOpen(true);
                  }}
                >
                  רכישה ₪{Number(p.price).toLocaleString()}
                </button>
              ) : null}
              <Link to="/catalog" className="btn btn-outline">
                להמשך בחירה בקטלוג
              </Link>
              {buyMsg && <p className="msg-ok" style={{ margin: 0 }}>{buyMsg}</p>}
              <div style={{ color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 300 }}>
                {loggedIn
                  ? 'המחיר כולל מע״מ · הקרדיטים שצברת מוזילים אותו'
                  : 'המחיר כולל מע״מ · אפשר לרכוש גם בלי מנוי'}
              </div>
            </div>
          </div>
        </div>

        <QuotaDialog
          open={quotaOpen}
          onClose={() => setQuotaOpen(false)}
          product={p}
          missing={Math.max(0, p.points - remaining)}
          remaining={remaining}
          hideUpgrade={isTopPlan(state)}
        />

        <PurchaseDialog
          open={buyOpen}
          onClose={() => setBuyOpen(false)}
          item={{ product: p, serial: null }}
          price={Number(p.price) || 0}
          credit={state?.credits || 0}
          user={user}
          onConfirm={() => {
            setBuyMsg('בקשת הרכישה נרשמה — ניצור קשר להשלמת התשלום');
            setBuyOpen(false);
          }}
        />

        <div className="benefits">
          {BENEFITS.map((b) => (
            <div className="benefit" key={b.t}>
              <b.icon size={26} />
              <span>{b.t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
