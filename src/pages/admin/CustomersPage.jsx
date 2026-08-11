import { useApp } from '../../state/AppContext';

export default function CustomersPage() {
  const { state } = useApp();

  return (
    <>
      <h1>לקוחות</h1>
      <p className="admin-sub">רשימת לקוחות (נתוני דמו + מערכת)</p>

      <div className="admin-section">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>שם</th>
                <th>מסלול</th>
                <th>נקודות</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {(state.customers || []).map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td>{c.plan}</td>
                  <td>{c.points}</td>
                  <td>
                    <span className={`pill ${c.status === 'פעיל' ? 'ok' : 'warn'}`}>{c.status}</span>
                  </td>
                </tr>
              ))}
              {(state.customers || []).length === 0 && (
                <tr>
                  <td colSpan="4" style={{ color: 'var(--muted)' }}>
                    אין נתוני לקוחות
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
