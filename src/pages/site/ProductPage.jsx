import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageSlot from '../../components/ImageSlot';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import Button from '../../components/Button';
import { IconCheck, IconRefresh, IconShield, IconSparkle, IconTruck } from '../../components/icons';

const PERKS = [
  { icon: <IconTruck />, label: 'משלוח חינם' },
  { icon: <IconRefresh />, label: 'החלפה ללא הגבלה' },
  { icon: <IconShield />, label: 'ביטוח מלא' },
  { icon: <IconSparkle />, label: 'ניקוי מקצועי' },
];

export default function ProductPage() {
  const { id } = useParams();
  const { state, run } = useApp();
  const navigate = useNavigate();
  const [activeThumb, setActiveThumb] = useState(0);
  const subscribed = Boolean(state?.subscribed);
  const p = (state?.products || []).find((x) => x.id === id);

  if (!p) {
    return (
      <section className="site-section">
        <div className="shell">
          <div className="empty">המוצר לא נמצא</div>
        </div>
      </section>
    );
  }

  async function handleBuy() {
    if (!subscribed) {
      navigate('/plans');
      return;
    }
    const data = await run(() => api.addToCart(p.id));
    if (!data) return;
    navigate('/account/cart');
  }

  return (
    <section className="site-section">
      <div className="shell">
        <div className="pdp">
          <div className="pdp-thumbs">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                type="button"
                className={`pdp-thumb${activeThumb === i ? ' active' : ''}`}
                aria-label={`תצוגה ${i + 1}`}
                onClick={() => setActiveThumb(i)}
              >
                <ImageSlot label={p.name} category={p.category} />
              </button>
            ))}
          </div>

          <div className="pdp-main">
            <ImageSlot label={p.name} category={p.category} productId={p.id} />
          </div>

          <div className="pdp-info">
            <button type="button" className="btn-link" onClick={() => navigate('/catalog')}>
              ← חזרה לקטלוג
            </button>

            <h1 className="pdp-title">{p.name}</h1>
            <div className="pdp-points">
              {p.points} נקודות לחודש
              <small>או ₪{p.price} לרכישה מלאה</small>
            </div>

            <ul className="pdp-specs">
              <li>
                <IconCheck />
                חומר: {p.metal}
              </li>
              <li>
                <IconCheck />
                אבן: {p.stone}
              </li>
              <li>
                <IconCheck />
                קטגוריה: {p.category}
              </li>
            </ul>

            <div className="pdp-actions">
              <Button
                type="button"
                className="btn-ink btn-block"
                loadingText="מוסיפה…"
                onClick={handleBuy}
              >
                {subscribed ? 'הוספה לסל' : 'הצטרפי כדי להזמין'}
              </Button>
              <Button
                type="button"
                className="btn-outline btn-block"
                onClick={() => navigate('/info')}
              >
                פרטים נוספים
              </Button>
            </div>

            <div className="pdp-perks">
              {PERKS.map((perk) => (
                <div key={perk.label}>
                  {perk.icon}
                  <span>{perk.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
