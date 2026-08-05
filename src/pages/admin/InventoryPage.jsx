import ImageSlot from '../../components/ImageSlot';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import Button from '../../components/Button';

export default function InventoryPage() {
  const { state, run } = useApp();

  return (
    <>
      <div className="display" style={{ fontSize: 22, marginBottom: 8 }}>
        ניהול מלאי
      </div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 20, maxWidth: 640, lineHeight: 1.6 }}>
        כל היחידות במערכת וסטטוס כל פריט. לחצי + ליד דגם כדי להוסיף יחידה חדשה למלאי.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {(state.inventory || []).map((g) => (
          <div key={g.id} className="panel" style={{ padding: 18 }}>
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                marginBottom: 10,
                justifyContent: 'space-between',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="thumb" style={{ width: 36, height: 36 }}>
                  <ImageSlot label={g.name} category={g.category} productId={g.id} className="compact" />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {g.id} — {g.name}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {g.units.length} יחידות
                  </div>
                </div>
              </div>
              <Button
                type="button"
                className="btn btn-sm inventory-add-btn"
                loadingText="מוסיף…"
                aria-label={`הוספת יחידה — ${g.name}`}
                title="הוספת יחידה למלאי"
                onClick={() => run(() => api.receiveUnit(g.id))}
              >
                +
              </Button>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {g.units.length === 0 ? (
                <div className="muted" style={{ fontSize: 13 }}>
                  אין יחידות — לחצי + להוספה
                </div>
              ) : (
                g.units.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      border: '1px solid var(--border)',
                      padding: '10px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      minWidth: 150,
                    }}
                  >
                    <span className="muted" style={{ fontSize: 12 }}>
                      {u.id}
                    </span>
                    <select
                      value={u.status}
                      onChange={(e) => run(() => api.setUnitStatus(u.id, e.target.value))}
                      style={{
                        background: u.badgeBg,
                        color: u.badgeFg,
                        border: 'none',
                        padding: '6px 8px',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {(state.statuses || []).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
