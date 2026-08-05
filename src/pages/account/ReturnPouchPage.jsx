import { useNavigate } from 'react-router-dom';
import QrCard from '../../components/QrCard';
import ImageSlot from '../../components/ImageSlot';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { customerStatusLabel } from '../../utils/customerStatus';

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
          נרתיק החזרה
        </div>
        <div className="empty">
          אין נרתיק פעיל. בצעי החזרה כדי לקבל קוד QR לנרתיק.
        </div>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 20 }}
          onClick={() => navigate('/account/exchange')}
        >
          להחזרת תכשיטים
        </button>
      </>
    );
  }

  const list = pouches.length ? pouches : last ? [last] : [];

  async function handleCancel(pouch) {
    if (!pouch.canCancel) return;
    const ok = window.confirm(
      'לבטל את ההחזרה? התכשיטים יישארו אצלך והנרתיק יבוטל.',
    );
    if (!ok) return;
    await run(() => api.cancelReturn(pouch.id));
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
        נרתיק החזרה
      </div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 28, maxWidth: 560, lineHeight: 1.6 }}>
        הדביקי את קוד ה־QR על הנרתיק. הסטטוס אצלך: <b>בתהליך החזרה</b>. הנקודות יחזרו
        ליתרה רק אחרי סריקה ואישור תכולה במחסן.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {list.map((pouch) => (
          <div key={pouch.id} className="panel" style={{ padding: 28 }}>
            <div
              style={{
                display: 'flex',
                gap: 40,
                flexWrap: 'wrap',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <QrCard code={pouch.qr} size={200} />
                <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                  הדביקי על הנרתיק
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                  {pouch.qr}
                </div>
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
                  <button
                    type="button"
                    className="btn"
                    style={{ marginTop: 24, borderColor: 'var(--danger, #c44)' }}
                    onClick={() => handleCancel(pouch)}
                  >
                    ביטול החזרה
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
