import { api } from '../../api';
import { useApp } from '../../state/AppContext';

export default function PlansAdminPage() {
  const { state, run } = useApp();

  return (
    <>
      <div className="display" style={{ fontSize: 22, marginBottom: 20 }}>
        מסלולים וקרדיטים
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>מסלול</th>
            <th>מחיר</th>
            <th>נקודות</th>
            <th>מקס׳ תכשיטים</th>
            <th>החלפות</th>
            <th>משלוח</th>
          </tr>
        </thead>
        <tbody>
          {(state.plans || []).map((pl) => (
            <tr key={pl.id}>
              <td>{pl.name}</td>
              <td>
                <input
                  value={pl.price}
                  onChange={(e) => run(() => api.updatePlan(pl.id, 'price', e.target.value))}
                />
              </td>
              <td>
                <input
                  value={pl.points}
                  onChange={(e) => run(() => api.updatePlan(pl.id, 'points', e.target.value))}
                />
              </td>
              <td>
                <input
                  style={{ width: 50 }}
                  value={pl.maxItems}
                  onChange={(e) => run(() => api.updatePlan(pl.id, 'maxItems', e.target.value))}
                />
              </td>
              <td>
                <input
                  style={{ width: 50 }}
                  value={pl.exchanges}
                  onChange={(e) => run(() => api.updatePlan(pl.id, 'exchanges', e.target.value))}
                />
              </td>
              <td>{pl.shippingLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
