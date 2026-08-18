import { useState } from 'react'
import { Link } from 'react-router-dom'
import { activeItems, heDate, isActiveSubscriber, openReturnsFor, planOf, pointsUsed, useAdminDb } from '../../lib/useAdminDb.js'

export default function Customers() {
  const { db } = useAdminDb()
  const [q, setQ] = useState('')
  const active = db.users.filter((u) => isActiveSubscriber(u)).length
  const term = q.trim().toLowerCase()
  const list = term
    ? db.users.filter((u) => [u.name, u.phone, u.email].some((v) => (v || '').toLowerCase().includes(term)))
    : db.users

  return (
    <>
      <h1>ניהול לקוחות</h1>
      <p className="admin-sub">
        {db.users.length} חשבונות · {active} מנויות פעילות · <b>לחיצה על שם הלקוחה פותחת את התיק המלא שלה</b>
        (היסטוריית השכרות, כתובת, החזרות ומשלוחים).
      </p>

      <div className="admin-section">
        <div className="admin-head-row">
          <input
            className="select" style={{ minWidth: 280 }} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="חיפוש לפי שם, טלפון או אימייל…"
          />
          <span className="cell-sub">{list.length} מתוך {db.users.length}</span>
        </div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>שם</th><th>טלפון</th><th>אימייל</th><th>מסלול</th><th>נקודות בשימוש</th><th>תכשיטים אצלה</th><th>החזרה פתוחה</th><th>הצטרפה</th><th>מצב</th><th>החלפות</th><th></th></tr>
            </thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan="11" style={{ color: 'var(--muted)' }}>לא נמצאו לקוחות</td></tr>}
              {list.map((u) => {
                const plan = planOf(db, u)
                const openRet = openReturnsFor(db, u.id).length
                return (
                  <tr key={u.id}>
                    <td><Link className="cust-link" to={`/admin/customers/${u.id}`}>{u.name}</Link></td>
                    <td dir="ltr">{u.phone}</td>
                    <td dir="ltr">{u.email}</td>
                    <td>{plan.latin} · ₪{plan.price}</td>
                    <td dir="ltr">{pointsUsed(db, u.id)}/{plan.points}</td>
                    <td>{activeItems(db, u.id).length}</td>
                    <td>{openRet > 0 ? <span className="pill warn">{openRet}</span> : <span className="cell-sub">—</span>}</td>
                    <td>{u.joined}</td>
                    <td>
                      {u.canceledAt
                        ? <span className="pill warn">עזבה {heDate(u.canceledAt)}</span>
                        : u.suspendedAt
                          ? <span className="pill info">מושהה</span>
                          : <span className="pill ok">פעילה</span>}
                    </td>
                    <td>{u.exchangeBlocked ? <span className="pill warn">חסומה</span> : <span className="pill ok">זמינות</span>}</td>
                    <td><Link className="btn-mini" to={`/admin/customers/${u.id}`}>תיק לקוחה ←</Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
