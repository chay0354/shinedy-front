import { useNavigate } from 'react-router-dom';
import ImageSlot from '../../components/ImageSlot';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import Button from '../../components/Button';

export default function CartPage() {
  const { state, run } = useApp();
  const navigate = useNavigate();

  async function confirm() {
    const data = await run(() => api.confirmOrder());
    if (!data) return;
    navigate('/account/shop');
  }

  return (
    <>
      <button
        type="button"
        className="accent"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, padding: 0, marginBottom: 12 }}
        onClick={() => navigate('/account/shop')}
      >
        ← חזרה לחנות
      </button>
      <div className="display" style={{ fontSize: 24, marginBottom: 20 }}>
        הזמנה נוכחית
      </div>
      {state.cart.length === 0 ? (
        <div className="empty">הסל ריק — עברי לחנות לבחירת תכשיטים</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
          {state.cart.map((p) => (
            <div
              key={p.id}
              className="panel"
              style={{ display: 'flex', gap: 12, alignItems: 'center' }}
            >
              <div className="thumb" style={{ width: 48, height: 48 }}>
                <ImageSlot label={p.name} category={p.category} productId={p.id} className="compact" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {p.points} נק׳
                </div>
              </div>
              <Button
                type="button"
                className="accent"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13 }}
                loadingText="מסירה…"
                onClick={() => run(() => api.removeFromCart(p.id))}
              >
                הסרה
              </Button>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px 0',
              borderTop: '1px solid var(--border)',
              marginTop: 8,
            }}
          >
            <span>סה״כ נקודות</span>
            <b className="accent">
              {state.cartTotal} / {state.pointsTotal}
            </b>
          </div>
          <Button
            type="button"
            className="btn btn-primary"
            style={{ padding: 16 }}
            loadingText="שולחת הזמנה…"
            onClick={confirm}
          >
            אשרי הזמנה
          </Button>
        </div>
      )}
    </>
  );
}
