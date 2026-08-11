import { useMemo } from 'react';
import { useApp } from '../../state/AppContext';
import { SHARED_TERMS } from '../../lib/site';
import { enrichPlan } from '../../lib/plans';

const fmt = (n) => Number(n).toLocaleString('he-IL');

export default function AdminReportsPage() {
  const { state } = useApp();

  const R = useMemo(() => {
    const inventory = state.inventory || [];
    const orders = state.orders || [];
    const plans = (state.plans || []).map(enrichPlan);

    const inv = inventory.reduce(
      (a, g) => {
        a.total += g.units.length;
        a.out += g.units.filter((u) => u.status === 'אצל לקוחה' || u.status === 'בדרך ללקוחה').length;
        a.avail += g.units.filter((u) => u.status === 'זמין').length;
        a.clean += g.units.filter((u) => u.status === 'בניקוי').length;
        return a;
      },
      { total: 0, out: 0, avail: 0, clean: 0 },
    );

    const byStatus = {};
    for (const o of orders) byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    const openWh = orders.filter((o) => ['ליקוט', 'בקרה', 'אריזה'].includes(o.status)).length;

    return { inv, byStatus, openWh, plans, orders: orders.length };
  }, [state]);

  return (
    <div className="report-area">
      <div className="admin-head-row">
        <h1>דוחות ומדדים</h1>
        <button type="button" className="btn btn-sm no-print" onClick={() => window.print()}>
          הפקת דוח (הדפסה / PDF)
        </button>
      </div>
      <p className="admin-sub">
        דוח תפעולי · Shinedy · {new Date().toLocaleDateString('he-IL')}
      </p>

      <div className="account-grid">
        <div className="stat-card">
          <div className="label">יחידות במלאי</div>
          <div className="value">{R.inv.total}</div>
        </div>
        <div className="stat-card">
          <div className="label">בהשכרה / בדרך</div>
          <div className="value">{R.inv.out}</div>
        </div>
        <div className="stat-card">
          <div className="label">זמין</div>
          <div className="value">{R.inv.avail}</div>
        </div>
        <div className="stat-card">
          <div className="label">הזמנות פתוחות</div>
          <div className="value">{R.openWh}</div>
        </div>
        <div className="stat-card">
          <div className="label">סה״כ הזמנות</div>
          <div className="value">{R.orders}</div>
        </div>
      </div>

      <div className="admin-section">
        <h2>מסלולים</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>מסלול</th>
                <th>מחיר</th>
                <th>נקודות</th>
              </tr>
            </thead>
            <tbody>
              {R.plans.map((p) => (
                <tr key={p.id}>
                  <td>{p.latin}</td>
                  <td>₪{fmt(p.price)}</td>
                  <td>{p.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section admin-terms">
        <strong>תנאי שירות (סיכום):</strong>
        <ul style={{ margin: '10px 0 0 0', paddingInlineStart: 22 }}>
          {SHARED_TERMS.map((t) => (
            <li key={t} style={{ marginBottom: 6 }}>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
