import { useMemo } from 'react';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import Art from '../../components/Art';

function orderPill(status) {
  if (status === 'נשלח' || status === 'נמסרה') return 'ok';
  if (status === 'אריזה' || status === 'נארזה') return 'info';
  return 'warn';
}

export default function AdminWarehousePage() {
  const { state, run } = useApp();
  const open = (state.orders || []).filter((o) => o.status !== 'הוחזרה' && o.status !== 'נשלח');

  const productsById = useMemo(() => {
    const map = {};
    for (const p of state.products || []) map[p.id] = p;
    for (const g of state.inventory || []) map[g.id] = { ...map[g.id], ...g };
    return map;
  }, [state.products, state.inventory]);

  return (
    <>
      <h1>הזמנות למחסן</h1>
      <p className="admin-sub">
        הזרימה: ליקוט → בקרת איכות → אריזה → סימון כנשלח. השתמשי בלוח העמודות לקידום הזמנות.
      </p>

      <div className="admin-section">
        <h2>הזמנות בטיפול</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>מס׳ הזמנה</th>
                <th>לקוחה</th>
                <th>פריטים</th>
                <th>סוג</th>
                <th>תאריך</th>
                <th>סטטוס</th>
                <th>פעולה</th>
              </tr>
            </thead>
            <tbody>
              {open.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ color: 'var(--muted)' }}>
                    אין הזמנות פתוחות
                  </td>
                </tr>
              )}
              {open.map((o) => (
                <tr key={o.id}>
                  <td dir="ltr">{o.id}</td>
                  <td>{o.customerName || '—'}</td>
                  <td>{o.itemsLabel || (o.items || []).join(', ')}</td>
                  <td>{o.type}</td>
                  <td>{o.date}</td>
                  <td>
                    <span className={`pill ${orderPill(o.status)}`}>{o.status}</span>
                  </td>
                  <td>
                    <button type="button" className="btn-mini" onClick={() => run(() => api.advanceOrder(o.id))}>
                      קדם שלב
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(state.warehouseColumns || []).length > 0 && (
        <div className="admin-section">
          <h2>לוח מחסן</h2>
          <div className="report-cols">
            {state.warehouseColumns.map((col) => (
              <div key={col.key}>
                <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>{col.label}</h3>
                {col.orders.map((o) => (
                  <div key={o.id} className="ship-card" style={{ marginBottom: 12 }}>
                    <div className="ship-head">
                      <span dir="ltr">{o.id}</span>
                      <span>{o.type}</span>
                    </div>
                    <div className="cell-sub">{o.itemsLabel}</div>
                    {col.key !== 'נשלח' && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ marginTop: 10 }}
                        onClick={() => run(() => api.advanceOrder(o.id))}
                      >
                        {o.nextLabel}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-section">
        <h2>מלאי — תצוגה מהירה</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>דגם</th>
                <th>יחידות</th>
              </tr>
            </thead>
            <tbody>
              {(state.inventory || []).slice(0, 8).map((g) => (
                <tr key={g.id}>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div className="mini-art">
                        <Art product={productsById[g.id] || g} />
                      </div>
                      {g.name}
                    </div>
                  </td>
                  <td>{g.units.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
