import { useState } from 'react';
import ImageSlot from '../../components/ImageSlot';
import QrCard from '../../components/QrCard';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import Button from '../../components/Button';

export default function ReturnsPage() {
  const { state, run } = useApp();
  const [qrInput, setQrInput] = useState('');
  const [scanError, setScanError] = useState('');
  const pouches = state.activeReturnPouches || [];

  async function handleScan(code) {
    setScanError('');
    try {
      await run(() => api.scanPouch(code));
      setQrInput('');
    } catch (e) {
      setScanError(e.message);
    }
  }

  return (
    <>
      <div className="display" style={{ fontSize: 22, marginBottom: 8 }}>
        קליטת החזרות
      </div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 24, maxWidth: 640, lineHeight: 1.6 }}>
        סרקו את ה־QR → אשרו תכולה (אז הפריטים יוסרו מהלקוחה והנקודות יוחזרו) → בקרת איכות
      </div>

      {/* QR scan panel */}
      <div className="panel" style={{ padding: 20, marginBottom: 28, maxWidth: 560 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>סריקת QR</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="field"
            style={{ marginBottom: 0, flex: 1, minWidth: 180 }}
            placeholder="הזיני קוד QR (למשל QR-9001)"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && qrInput.trim()) handleScan(qrInput);
            }}
          />
          <Button
            type="button"
            className="btn btn-primary"
            disabled={!qrInput.trim()}
            loadingText="סורק…"
            onClick={() => handleScan(qrInput)}
          >
            סריקה
          </Button>
        </div>
        {scanError && (
          <div style={{ color: '#8C4A34', fontSize: 13, marginTop: 10 }}>{scanError}</div>
        )}
        <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
          לדמו: נסי <b>QR-9001</b> או קוד מנרתיק של החלפה
        </div>
      </div>

      {pouches.length === 0 ? (
        <div className="empty">אין נרתיקים בדרך חזרה כרגע</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
          {pouches.map((pouch) => (
            <div key={pouch.id} className="panel" style={{ padding: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <QrCard code={pouch.qr} size={88} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{pouch.qr}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {pouch.customerName} · {pouch.orderId} · {pouch.itemCount} פריטים
                    </div>
                    <div
                      className="badge"
                      style={{
                        marginTop: 8,
                        background: 'var(--accent-soft)',
                        color: '#8A6A2A',
                      }}
                    >
                      {pouch.statusLabel}
                    </div>
                  </div>
                </div>

                {pouch.status === 'in_transit' && (
                  <Button
                    type="button"
                    className="btn btn-primary btn-sm"
                    loadingText="סורק…"
                    onClick={() => handleScan(pouch.qr)}
                  >
                    סריקת QR
                  </Button>
                )}
              </div>

              {/* Step: confirm contents after scan */}
              {pouch.status === 'scanned' && (
                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: 16,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 10 }}>
                    תכולה צפויה בנרתיק
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {pouch.items.map((it) => (
                      <div
                        key={it.unitId}
                        style={{ display: 'flex', gap: 12, alignItems: 'center' }}
                      >
                        <div className="thumb" style={{ width: 40, height: 40 }}>
                          <ImageSlot
                            label={it.name}
                            category={it.category}
                            productId={it.unitId}
                            className="compact"
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{it.name}</div>
                          <div className="muted" style={{ fontSize: 12 }}>
                            {it.category} · {it.unitId}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    className="btn btn-primary"
                    loadingText="מאשר…"
                    onClick={() => run(() => api.confirmPouchContents(pouch.id))}
                  >
                    אישור קבלת הפריטים
                    {pouch.pendingPoints ? ` (+${pouch.pendingPoints} נק׳ ללקוחה)` : ''}
                  </Button>
                </div>
              )}

              {/* Step: QC each item */}
              {pouch.status === 'contents_ok' && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>בקרת איכות לפריטים</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pouch.items.map((it) => {
                      const pending = it.status === 'בדרך חזרה';
                      return (
                        <div
                          key={it.unitId}
                          className="panel"
                          style={{
                            padding: 12,
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div className="thumb" style={{ width: 40, height: 40 }}>
                            <ImageSlot
                              label={it.name}
                              category={it.category}
                              productId={it.unitId}
                              className="compact"
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 120 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{it.name}</div>
                            <div className="muted" style={{ fontSize: 12 }}>
                              {it.unitId}
                            </div>
                          </div>
                          <span
                            className="badge"
                            style={{ background: it.badgeBg, color: it.badgeFg }}
                          >
                            {it.status}
                          </span>
                          {pending && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Button
                                type="button"
                                className="btn btn-primary btn-sm"
                                loadingText="שומר…"
                                onClick={() =>
                                  run(() => api.pouchItemQC(pouch.id, it.unitId, 'ok'))
                                }
                              >
                                תקין → לניקוי
                              </Button>
                              <Button
                                type="button"
                                className="btn btn-sm"
                                loadingText="שומר…"
                                onClick={() =>
                                  run(() => api.pouchItemQC(pouch.id, it.unitId, 'repair'))
                                }
                              >
                                דורש תיקון
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {pouch.status === 'in_transit' && (
                <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                  ממתין לסריקת QR במחסן
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="display" style={{ fontSize: 20, margin: '36px 0 16px' }}>
        בניקוי — לסימון כזמין
      </div>
      {(state.cleaningUnits || []).length === 0 ? (
        <div className="muted" style={{ fontSize: 13 }}>
          אין פריטים בניקוי
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {state.cleaningUnits.map((c) => (
            <div
              key={c.unitId}
              className="panel"
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <span style={{ fontSize: 13 }}>
                {c.name} · {c.unitId}
              </span>
              <Button
                type="button"
                className="btn btn-sm"
                loadingText="שומר…"
                onClick={() => run(() => api.markClean(c.unitId))}
              >
                זמין במלאי
              </Button>
            </div>
          ))}
        </div>
      )}

      {(state.repairUnits || []).length > 0 && (
        <>
          <div className="display" style={{ fontSize: 20, margin: '32px 0 16px' }}>
            בתיקון
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {state.repairUnits.map((c) => (
              <div key={c.unitId} className="panel" style={{ fontSize: 13 }}>
                {c.name} · {c.unitId}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
