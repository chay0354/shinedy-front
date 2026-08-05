import { useApp } from '../../state/AppContext';

export default function MoreAdminPage() {
  const { state } = useApp();

  return (
    <>
      <div className="display" style={{ fontSize: 22, marginBottom: 20 }}>
        משלוחים · חיובים · משתמשים
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div className="panel" style={{ flex: 1, minWidth: 220, padding: 18 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>משלוחים</div>
          {state.orders.map((o) => (
            <div
              key={o.id}
              style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F0EBE1' }}
            >
              {o.id} — {o.status}
            </div>
          ))}
        </div>
        <div className="panel" style={{ flex: 1, minWidth: 220, padding: 18 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>חיובים</div>
          <div style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F0EBE1' }}>
            חיוב חודשי — {state.plan.name} · ₪{state.plan.price}
          </div>
        </div>
        <div className="panel" style={{ flex: 1, minWidth: 220, padding: 18 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>משתמשים והרשאות</div>
          <div style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F0EBE1' }}>
            מנהלת מערכת — הרשאה מלאה
          </div>
          <div style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F0EBE1' }}>
            עובד מחסן — מלאי והזמנות
          </div>
        </div>
      </div>
    </>
  );
}
