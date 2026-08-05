import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageSlot from '../../components/ImageSlot';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { customerStatusLabel } from '../../utils/customerStatus';
import Button from '../../components/Button';

export default function ExchangePage() {
  const { state, run, refresh } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    refresh();
  }, [refresh]);
  const selectedReturns = (state.returnCandidates || []).filter((r) => r.checked);
  const pointsBack = selectedReturns.reduce((sum, r) => sum + r.points, 0);

  async function confirm() {
    const data = await run(() => api.confirmExchange());
    if (!data) return;
    navigate('/account/returns');
  }

  return (
    <>
      <button
        type="button"
        className="accent"
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 12,
          padding: 0,
          marginBottom: 12,
        }}
        onClick={() => navigate('/account/me')}
      >
        ← חזרה לאזור אישי
      </button>
      <div className="display" style={{ fontSize: 24, marginBottom: 8 }}>
        החזרת תכשיטים
      </div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 24, maxWidth: 560, lineHeight: 1.6 }}>
        סמני מה להחזיר ואשרי את ההחזרה. הסטטוס יהיה <b>בתהליך החזרה</b>.
      </div>

      <div style={{ fontWeight: 600, marginBottom: 12 }}>סמני אילו תכשיטים להחזיר</div>

      {state.returnCandidates.length === 0 ? (
        <div className="empty" style={{ marginBottom: 24 }}>
          אין תכשיטים זמינים להחזרה כרגע
        </div>
      ) : (
        <div
          className="product-grid"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}
        >
          {state.returnCandidates.map((it) => (
            <div
              key={it.unitId}
              className="panel"
              onClick={() => {
                if (!it.unitId) return;
                void run(() => api.toggleReturn(it.unitId));
              }}
              style={{
                cursor: 'pointer',
                borderColor: it.checked ? 'var(--accent)' : undefined,
                background: it.checked ? 'var(--accent-soft)' : undefined,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="thumb" style={{ width: 48, height: 48 }}>
                  <ImageSlot
                    label={it.name}
                    category={it.category}
                    productId={it.unitId}
                    className="compact"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                    {it.points} נק׳ ·{' '}
                    {it.checked ? 'מסומן להחזרה' : customerStatusLabel('אצל לקוחה')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReturns.length > 0 && (
        <div className="panel" style={{ maxWidth: 520, padding: 20 }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
            סיכום — לפני אישור ההחזרה
          </div>
          {selectedReturns.map((r) => (
            <div
              key={r.unitId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: 13,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span>{r.name}</span>
              <span className="accent">{r.points} נק׳</span>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 14,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span>יוחזרו ליתרה</span>
            <span className="accent">{pointsBack} נקודות</span>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
            לאחר האישור הסטטוס יהיה «בתהליך החזרה». הנקודות ייזקפו רק כשהמחסן יאשר קבלה.
          </div>
          <Button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 18, width: '100%', padding: 16 }}
            loadingText="מאשרת…"
            onClick={confirm}
          >
            אישור החזרה
          </Button>
        </div>
      )}
    </>
  );
}
