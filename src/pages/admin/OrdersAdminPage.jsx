import { useApp } from '../../state/AppContext';
import { buildDbFromState } from '../../lib/dbFromState';
import AdminUserCell from '../../components/AdminUserCell.jsx';

export default function OrdersAdminPage() {
  const { state } = useApp();
  const db = buildDbFromState(state);

  return (
    <>
      <div className="display" style={{ fontSize: 22, marginBottom: 20 }}>
        הזמנות והחלפות
      </div>
      {state.orders.length === 0 ? (
        <div className="empty">אין הזמנות עדיין</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>מזהה</th>
              <th>סוג</th>
              <th>לקוחה</th>
              <th>פריטים</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {state.orders.map((o) => {
              const u = db.users.find((x) => x.id === o.userId) || db.users.find((x) => x.name === o.customerName)
              return (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.type}</td>
                  <td><AdminUserCell db={db} user={u} name={o.customerName} /></td>
                  <td>{o.itemsLabel}</td>
                  <td>{o.status}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
