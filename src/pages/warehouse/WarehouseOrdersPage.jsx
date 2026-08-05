import ImageSlot from '../../components/ImageSlot';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import Button from '../../components/Button';

export default function WarehouseOrdersPage() {
  const { state, run } = useApp();

  return (
    <div className="kanban">
      {(state.warehouseColumns || []).map((col) => (
        <div key={col.key}>
          <h3>{col.label}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {col.orders.map((o) => (
              <div key={o.id} className="panel">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div className="thumb" style={{ width: 40, height: 40 }}>
                    <ImageSlot label={o.itemsLabel || o.id} className="compact" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {o.id} · {o.type}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {o.itemsLabel}
                    </div>
                  </div>
                </div>
                {col.key !== 'נשלח' && (
                  <Button
                    type="button"
                    className="btn btn-sm"
                    style={{ marginTop: 10, width: '100%' }}
                    loadingText="מעדכן…"
                    onClick={() => run(() => api.advanceOrder(o.id))}
                  >
                    {o.nextLabel}
                  </Button>
                )}
                {col.key === 'נשלח' && (
                  <div className="muted" style={{ marginTop: 10, fontSize: 11, textAlign: 'center' }}>
                    נשלח ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
