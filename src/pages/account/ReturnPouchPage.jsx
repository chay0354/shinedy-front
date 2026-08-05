import { useNavigate } from 'react-router-dom';
import ImageSlot from '../../components/ImageSlot';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { customerStatusLabel } from '../../utils/customerStatus';
import { RETURN_STARTED_MESSAGE } from '../../utils/returnMessages';
import Button from '../../components/Button';

export default function ReturnPouchPage() {
  const { state, run } = useApp();
  const navigate = useNavigate();
  const pouches = state.myReturnPouches || [];
  const last = state.lastPouch;

  if (!pouches.length && !last) {
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
        <div className="display" style={{ fontSize: 24, marginBottom: 12 }}>
          החזרה
        </div>
        <div className="empty">אין החזרה פעילה. בצעי החזרה מתוך מסך החלפת תכשיטים.</div>
        <Button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 20 }}
          onClick={() => navigate('/account/exchange')}
        >
          להחזרת תכשיטים
        </Button>
      </>
    );
  }

  const list = pouches.length ? pouches : last ? [last] : [];

  async function handleCancel(pouch) {
    if (!pouch.canCancel) return;
    const ok = window.confirm('לבטל את ההחזרה? התכשיטים יישארו אצלך.');
    if (!ok) return;
    const data = await run(() => api.cancelReturn(pouch.id));
    if (!data) return;
    navigate('/account/me');
  }

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
      <div className="display" style={{ fontSize: 24, marginBottom: 8 }}>
        החזרה
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {list.map((pouch) => (
          <div key={pouch.id} className="panel" style={{ padding: 28 }}>
            <div
              className="panel"
              style={{
                padding: 20,
                marginBottom: 24,
                background: 'var(--accent-soft)',
                lineHeight: 1.7,
                fontSize: 15,
              }}
            >
              {RETURN_STARTED_MESSAGE}
            </div>

            <div style={{ minWidth: 240 }}>
              <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                הזמנה {pouch.orderId} · {pouch.createdAt}
              </div>
              <div
                className="badge"
                style={{
                  background: 'var(--accent-soft)',
                  color: '#8A6A2A',
                  marginBottom: 20,
                }}
              >
                {pouch.statusLabel}
              </div>

              {!pouch.pointsCredited && pouch.pendingPoints > 0 && (
                <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
                  ממתין לאישור מחסן · {pouch.pendingPoints} נקודות יוחזרו
                </div>
              )}
              {pouch.pointsCredited && (
                <div className="muted" style={{ fontSize: 13, marginBottom: 14, color: '#3E5C3F' }}>
                  הנקודות הוחזרו ליתרה ✓
                </div>
              )}

              <div style={{ fontWeight: 600, marginBottom: 10 }}>
                תכולה להחזרה ({pouch.itemCount})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pouch.items.map((it) => (
                  <div
                    key={it.unitId}
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: 10,
                    }}
                  >
                    <div className="thumb" style={{ width: 44, height: 44 }}>
                      <ImageSlot
                        label={it.name}
                        category={it.category}
                        productId={it.unitId}
                        className="compact"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {it.unitId} · {it.points} נק׳
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{ background: it.badgeBg, color: it.badgeFg }}
                    >
                      {customerStatusLabel(it.status)}
                    </span>
                  </div>
                ))}
              </div>

              {pouch.newItems?.length > 0 && (
                <div className="muted" style={{ fontSize: 13, marginTop: 16 }}>
                  תכשיטים חדשים בדרך אליך עם ההחלפה
                </div>
              )}

              {pouch.canCancel && (
                <Button
                  type="button"
                  className="btn"
                  style={{ marginTop: 24, borderColor: 'var(--danger, #c44)' }}
                  loadingText="מבטלת…"
                  onClick={() => handleCancel(pouch)}
                >
                  ביטול החזרה
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
