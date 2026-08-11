import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import Art from '../../components/Art';

export default function InventoryPage() {
  const { state, run } = useApp();
  const inventory = state.inventory || [];

  return (
    <>
      <div className="admin-head-row">
        <h1>מלאי וקטלוג</h1>
      </div>
      <p className="admin-sub">
        ניהול יחידות במלאי וסטטוס כל פריט. לחצי + להוספת יחידה, או שנהי סטטוס ישירות.
      </p>

      <div className="admin-section">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>תמונה</th>
                <th>דגם</th>
                <th>קטגוריה</th>
                <th>נק׳</th>
                <th>יח׳</th>
                <th>זמין</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((g) => {
                const p = (state.products || []).find((x) => x.id === g.id) || g;
                const avail = g.units.filter((u) => u.status === 'זמין').length;
                return (
                  <tr key={g.id}>
                    <td>
                      <div className="mini-art">
                        <Art product={p} />
                      </div>
                    </td>
                    <td>{g.name}</td>
                    <td>{g.category}</td>
                    <td>{p.points}</td>
                    <td>{g.units.length}</td>
                    <td>{avail}</td>
                    <td>
                      <button type="button" className="btn-mini" onClick={() => run(() => api.receiveUnit(g.id))}>
                        + יחידה
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {inventory.map((g) => (
        <div key={`units-${g.id}`} className="admin-section">
          <h2>
            {g.id} — {g.name}
          </h2>
          <div className="units-cell">
            {g.units.length === 0 ? (
              <span style={{ color: 'var(--muted)' }}>אין יחידות</span>
            ) : (
              g.units.map((u) => (
                <span key={u.id} className={`unit-chip ${u.status === 'זמין' ? 'ok' : 'out'}`}>
                  <span dir="ltr">{u.id}</span>
                  <select
                    value={u.status}
                    onChange={(e) => run(() => api.setUnitStatus(u.id, e.target.value))}
                    style={{ fontSize: '0.75rem', marginTop: 4 }}
                  >
                    {(state.statuses || []).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </>
  );
}
