import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';

export default function HistoryPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  return (
    <>
      <button
        type="button"
        className="accent"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, padding: 0, marginBottom: 12 }}
        onClick={() => navigate('/account/me')}
      >
        ← חזרה לאזור אישי
      </button>
      <div className="display" style={{ fontSize: 24, marginBottom: 20 }}>
        היסטוריה וחשבוניות
      </div>
      {state.myOrders.length === 0 ? (
        <div className="empty">אין עדיין הזמנות</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.myOrders.map((o) => (
            <div
              key={o.id}
              className="panel"
              style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {o.type} · {o.id}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {o.itemsLabel}
                </div>
                {o.pouchId && (
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    <Link to="/account/returns" className="accent">
                      לצפייה בהחזרה
                    </Link>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13 }}>
                  {o.customerStatus || o.status}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  חשבונית ₪{state.plan.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
