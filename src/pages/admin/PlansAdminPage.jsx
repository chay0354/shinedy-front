import { useState } from 'react'
import { useAdminDb } from '../../lib/useAdminDb.js'

export default function Subscriptions() {
  const { db, api } = useAdminDb()
  const [msg, setMsg] = useState('')

  function save(planId, e) {
    e.preventDefault()
    const f = e.target
    api.updatePlan(planId, {
      price: Number(f.elements['price'].value),
      points: Number(f.elements['points'].value),
    })
    setMsg('המסלול עודכן ✓ — המחיר והנקודות מתעדכנים מיד גם באתר')
  }

  return (
    <>
      <h1>ניהול מסלולים</h1>
      <p className="admin-sub">
        עריכת המחיר והנקודות של כל מסלול. שינוי כאן מתעדכן מיד בכל האתר — בעמוד המסלולים,
        בהרשמה ובחישובי הנקודות של הלקוחות.
      </p>

      {msg && <p className="msg-ok">{msg}</p>}

      <div className="admin-section">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>מסלול</th><th>הרכב</th><th>מחיר לחודש (₪)</th><th>נקודות</th><th>מנויות</th><th></th></tr>
            </thead>
            <tbody>
              {db.plans.map((p) => {
                const count = db.users.filter((u) => u.plan === p.id).length
                return (
                  <tr key={p.id}>
                    <td><b>{p.latin}</b><br /><span className="cell-sub">{p.name}</span></td>
                    <td>{p.materials}</td>
                    <td colSpan="2" style={{ padding: 0 }}>
                      <form onSubmit={(e) => save(p.id, e)} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 16px' }}>
                        <input className="num-input" name="price" type="number" min="0" defaultValue={p.price} />
                        <input className="num-input" name="points" type="number" min="10" defaultValue={p.points} />
                        <button className="btn-mini">שמירה</button>
                      </form>
                    </td>
                    <td>{count}</td>
                    <td></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <h2>תנאי המנוי (קבועים לכל המסלולים)</h2>
        <ul className="admin-terms">
          <li>החלפות ללא הגבלה</li>
          <li>משלוח דו-חודשי כלול · משלוח החלפה נוסף ₪65</li>
          <li>ביטול אחרי ניצול המשלוח — החזרה ₪65</li>
          <li>אין תקרת תכשיטים — הבחירה לפי נקודות בלבד</li>
        </ul>
      </div>
    </>
  )
}
