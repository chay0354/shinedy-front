import { useMemo } from 'react';
import { useApp } from '../../state/AppContext';
import Art from '../../components/Art';

export default function AdminRentalsPage() {
  const { state } = useApp();

  const rows = useMemo(() => {
    const products = state.products || [];
    const result = [];
    for (const g of state.inventory || []) {
      for (const u of g.units) {
        if (u.status === 'אצל לקוחה' || u.status === 'בדרך ללקוחה' || u.status === 'בדרך חזרה') {
          const p = products.find((x) => x.id === g.id) || g;
          result.push({ product: p, unit: u });
        }
      }
    }
    return result;
  }, [state.inventory, state.products]);

  return (
    <>
      <h1>השכרות</h1>
      <p className="admin-sub">כל תכשיט שנמצא כרגע אצל לקוחה (או בדרך), לפי יחידות במלאי.</p>

      <div className="admin-section">
        <h2>השכרות פעילות ({rows.length})</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>תכשיט</th>
                <th>שם</th>
                <th>מס׳ פריט</th>
                <th>נק׳</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ color: 'var(--muted)' }}>
                    אין השכרות פעילות
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.unit.id}>
                  <td>
                    <div className="mini-art">
                      <Art product={r.product} />
                    </div>
                  </td>
                  <td>{r.product.name}</td>
                  <td dir="ltr">{r.unit.id}</td>
                  <td>{r.product.points}</td>
                  <td>
                    <span className={`pill ${r.unit.status === 'אצל לקוחה' ? 'ok' : 'info'}`}>{r.unit.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
