import { useNavigate, useParams } from 'react-router-dom';
import ImageSlot from '../../components/ImageSlot';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';

export default function ProductPage() {
  const { id } = useParams();
  const { state, run } = useApp();
  const navigate = useNavigate();
  const subscribed = Boolean(state?.subscribed);
  const p = (state?.products || []).find((x) => x.id === id);

  if (!p) {
    return (
      <div className="page">
        <div className="empty">המוצר לא נמצא</div>
      </div>
    );
  }

  async function handleBuy() {
    if (!subscribed) {
      navigate('/plans');
      return;
    }
    await run(() => api.addToCart(p.id));
    navigate('/account/cart');
  }

  return (
    <div className="page" style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 280, height: 480 }}>
        <ImageSlot label={p.name} category={p.category} productId={p.id} />
      </div>
      <div style={{ flex: 1, maxWidth: 420 }}>
        <button
          type="button"
          className="accent"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12 }}
          onClick={() => navigate('/catalog')}
        >
          ← חזרה לקטלוג
        </button>
        <div className="display" style={{ fontSize: 30, marginTop: 12 }}>
          {p.name}
        </div>
        <div className="muted" style={{ marginTop: 8 }}>
          {p.category} · {p.metal} · {p.stone}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 24,
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            padding: '16px 0',
          }}
        >
          <div>
            <div className="muted" style={{ fontSize: 12 }}>
              בנקודות
            </div>
            <div className="accent" style={{ fontSize: 20, fontWeight: 600 }}>
              {p.points}
            </div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>
              מחיר רכישה
            </div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>₪{p.price}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>
              זמינות
            </div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{p.availCount} יחידות</div>
          </div>
        </div>

        {!subscribed && (
          <div
            className="callout"
            style={{ marginTop: 20, marginBottom: 0, padding: 16, fontSize: 13 }}
          >
            כדי להזמין את הפריט יש לבחור מסלול מנוי ולקבל נקודות.
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 24, padding: '16px 32px' }}
          onClick={handleBuy}
        >
          {subscribed ? 'הוסיפי להזמנה' : 'הצטרפי למסלול כדי להזמין'}
        </button>
      </div>
    </div>
  );
}
