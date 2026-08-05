import { useApp } from '../../state/AppContext';

export default function CustomersPage() {
  const { state } = useApp();

  return (
    <>
      <div className="display" style={{ fontSize: 22, marginBottom: 20 }}>
        לקוחות
      </div>
      <table className="table">
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
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
