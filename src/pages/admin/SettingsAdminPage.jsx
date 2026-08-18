import { useState } from 'react'
import { ADMIN_TABS, ROLE_PRESETS, STAFF_ROLES, staffAccessList, currentStaff } from '../../lib/staff.js'
import { heDate, useAdminDb } from '../../lib/useAdminDb.js'

// רשת תיבות סימון של מסכי המערכת — לבחירת ההרשאות של משתמשת
function AccessPicker({ value, onChange, disabled }) {
  return (
    <div className="access-grid">
      {ADMIN_TABS.map((t) => (
        <label className="check-row" key={t.path}>
          <input
            type="checkbox" disabled={disabled}
            checked={disabled || value.includes(t.path)}
            onChange={(e) => onChange(e.target.checked ? [...value, t.path] : value.filter((p) => p !== t.path))}
          />
          <span>{t.label}</span>
        </label>
      ))}
    </div>
  )
}

// הגדרות מערכת — הועברו לכאן מדף ההוצאות, שם הן היו קבורות בלי קשר לתוכן
export default function Settings() {
  const { db, api, state } = useAdminDb()
  const [msg, setMsg] = useState('')
  const [newRole, setNewRole] = useState('מחסן')
  const [newAccess, setNewAccess] = useState(ROLE_PRESETS['מחסן'] || [])
  const [editId, setEditId] = useState(null)
  const [editAccess, setEditAccess] = useState([])

  const me = currentStaff(state, db.staff)

  function pickRole(role) {
    setNewRole(role)
    // התפקיד קובע נקודת מוצא — ואפשר להתאים ידנית עם התיבות
    setNewAccess(role === 'מנהלת' ? [] : (ROLE_PRESETS[role] || []).slice())
  }

  function addStaff(ev) {
    ev.preventDefault()
    const f = ev.target
    const err = api.addStaff({
      name: f.elements['sname'].value,
      role: newRole,
      pass: f.elements['spass'].value,
      access: newAccess,
    })
    if (err) { setMsg(err); return }
    f.reset()
    pickRole('מחסן')
    setMsg('משתמשת המערכת נוספה ✓ — היא יכולה להיכנס עם הסיסמה שקבעת לה')
  }

  return (
    <>
      <h1>הגדרות מערכת</h1>
      <p className="admin-sub">משתמשי מערכת והרשאות, סיסמה אישית, מצב בדיקות ואיפוס נתונים.</p>

      {msg && <p className="msg-ok">{msg}</p>}

      <div className="admin-section">
        <h2>משתמשי מערכת והרשאות</h2>
        <p className="admin-sub" style={{ marginTop: -6 }}>
          כל משתמשת נכנסת עם סיסמה אישית, וכל פעולה שלה נרשמת על שמה ביומן הפעולות (טאב דוחות, סעיף 10).
          <b> לכל משתמשת מגדירים בדיוק אילו מסכים פתוחים לה</b> — התפקיד הוא רק נקודת מוצא.
        </p>
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>שם</th><th>תפקיד</th><th>הרשאות</th><th>נוספה</th><th>מצב</th><th></th></tr></thead>
            <tbody>
              {(db.staff || []).map((s) => {
                const acc = staffAccessList(s)
                const labels = acc === null ? 'כל המסכים + הגדרות' : ADMIN_TABS.filter((t) => acc.includes(t.path)).map((t) => t.label).join(' · ') || '—'
                return (
                  <tr key={s.id}>
                    <td><b>{s.name}</b>{me && s.id === me.id && <span className="cell-sub"> (את)</span>}</td>
                    <td>{s.role}</td>
                    <td style={{ maxWidth: 260 }}>
                      {editId === s.id ? (
                        <>
                          <AccessPicker value={editAccess} onChange={setEditAccess} disabled={false} />
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button className="btn-mini strong" onClick={() => {
                              if (editAccess.length === 0) { setMsg('צריך לסמן לפחות מסך אחד'); return }
                              api.setStaffAccess(s.id, editAccess); setEditId(null); setMsg('ההרשאות עודכנו ✓')
                            }}>שמירה</button>
                            <button className="btn-mini" onClick={() => setEditId(null)}>ביטול</button>
                          </div>
                        </>
                      ) : (
                        <span className="cell-sub">{labels}</span>
                      )}
                    </td>
                    <td>{heDate(s.createdAt)}</td>
                    <td>{s.active ? <span className="pill ok">פעילה</span> : <span className="pill warn">מושבתת</span>}</td>
                    <td>
                      {(!me || s.id !== me.id) && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {s.role !== 'מנהלת' && editId !== s.id && (
                            <button className="btn-mini" onClick={() => { setEditId(s.id); setEditAccess((staffAccessList(s) || []).slice()) }}>
                              עריכת הרשאות
                            </button>
                          )}
                          <button className="btn-mini" onClick={() => api.toggleStaff(s.id)}>
                            {s.active ? 'השבתה' : 'הפעלה'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <h3 style={{ margin: '18px 0 10px', fontSize: '1.02rem', fontWeight: 600 }}>הוספת משתמשת</h3>
        <form onSubmit={addStaff}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap', marginBottom: 12 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>שם מלא</label>
              <input name="sname" required placeholder="שם העובדת" />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>תפקיד (קובע ברירת מחדל להרשאות)</label>
              <select name="srole" className="select" value={newRole} onChange={(e) => pickRole(e.target.value)}>
                {STAFF_ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>סיסמה אישית (6+ תווים)</label>
              <input name="spass" type="password" dir="ltr" required minLength="6" placeholder="••••••••" />
            </div>
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>אילו מסכים פתוחים לה</label>
            {newRole === 'מנהלת'
              ? <p className="cell-sub" style={{ marginTop: 4 }}>מנהלת מקבלת אוטומטית את כל המסכים, כולל הגדרות וניהול משתמשים.</p>
              : <AccessPicker value={newAccess} onChange={setNewAccess} disabled={false} />}
          </div>
          <button className="btn btn-sm">הוספה</button>
        </form>
      </div>

      <div className="admin-section">
        <h2>הסיסמה שלי{me ? ` (${me.name})` : ''}</h2>
        <p className="admin-sub" style={{ marginTop: -6 }}>
          הכניסה למערכת היא עם חשבון האתר (אימייל וסיסמה). שינוי הסיסמה נעשה ממסך ההתחברות של האתר.
        </p>
      </div>

      <div className="admin-section">
        <h2>מצב בדיקות (דמו)</h2>
        <label className="check-row">
          <input
            type="checkbox" checked={!!db.debugMode}
            onChange={(e) => { api.setDebugMode(e.target.checked); setMsg(e.target.checked ? 'כפתורי ההדמיה מוצגים' : 'כפתורי ההדמיה הוסתרו ✓') }}
          />
          <span>הצגת כפתורי הדמיה לבדיקות (כמו "הדמיית חלוף 5 ימים" במסך ההחזרות)</span>
        </label>
        <p className="cell-sub" style={{ marginTop: 6 }}>לפני השקה אמיתית מומלץ לכבות — כפתורי ההדמיה משנים נתונים.</p>
      </div>

      <div className="admin-section">
        <h2>איפוס נתונים</h2>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => { if (confirm('לאפס את כל הנתונים לנתוני הדמו ההתחלתיים?')) { api.resetDemo(); setMsg('הנתונים אופסו ✓') } }}
        >
          איפוס לנתוני דמו
        </button>
        <p className="cell-sub" style={{ marginTop: 8 }}>מוחק את כל הלקוחות, ההזמנות וההוצאות שהוזנו ומחזיר את נתוני ההדגמה.</p>
      </div>
    </>
  )
}
