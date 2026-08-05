import { useApp } from '../../state/AppContext';

export default function OrdersAdminPage() {
  const { state } = useApp();

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
            {state.orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.type}</td>
                <td>{o.customerName}</td>
                <td>{o.itemsLabel}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
