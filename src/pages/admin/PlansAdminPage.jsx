import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { SHARED_TERMS } from '../../lib/site';
import { enrichPlan } from '../../lib/plans';

export default function PlansAdminPage() {
  const { state, run } = useApp();
  const plans = (state.plans || []).map(enrichPlan);

  return (
    <>
      <h1>מנויים</h1>
      <p className="admin-sub">עריכת מחיר ונקודות לכל מסלול — השינוי נשמר במערכת.</p>

      <div className="admin-section">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>מסלול</th>
                <th>מחיר (₪)</th>
                <th>נקודות</th>
                <th>משלוח</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((pl) => (
                <tr key={pl.id}>
                  <td>
                    <strong>{pl.latin}</strong>
                    <br />
                    <span className="cell-sub">{pl.name}</span>
                  </td>
                  <td>
                    <input
                      className="num-input"
                      value={pl.price}
                      onChange={(e) => run(() => api.updatePlan(pl.id, 'price', e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      className="num-input"
                      value={pl.points}
                      onChange={(e) => run(() => api.updatePlan(pl.id, 'points', e.target.value))}
                    />
                  </td>
                  <td>{pl.shippingLabel || (pl.shipping ? 'כלול' : 'בתשלום')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section admin-terms">
        <strong>תנאים:</strong>
        <ul style={{ margin: '10px 0 0 0', paddingInlineStart: 22 }}>
          {SHARED_TERMS.map((t) => (
            <li key={t} style={{ marginBottom: 6 }}>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
