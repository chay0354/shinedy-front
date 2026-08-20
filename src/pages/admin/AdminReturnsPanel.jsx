import { useEffect, useState } from 'react'
import { daysSince, heDate, shipmentOf, useAdminDb } from '../../lib/useAdminDb.js'
import Art from '../../components/Art.jsx'

const FILTERS = [
  { id: 'attention', label: 'דורשות טיפול' },
  { id: 'overdue', label: 'מעל 5 ימים' },
  { id: 'customer', label: 'אצל הלקוחה' },
  { id: 'courier', label: 'בירור שליחויות' },
  { id: 'partial', label: 'חלקיות' },
  { id: 'done', label: 'הושלמו' },
  { id: 'all', label: 'הכול' },
]

function statusPill(s) {
  if (s === 'הושלמה') return 'ok'
  if (s === 'התקבלה חלקית' || s === 'בירור מול חברת המשלוחים') return 'info'
  return 'warn'
}

export default function Returns({ embedded }) {
  const { db, api } = useAdminDb()
  // ברירת המחדל: מה שדורש טיפול — לא ההיסטוריה
  const [filter, setFilter] = useState('attention')
  const [scan, setScan] = useState('')
  const [scanMsg, setScanMsg] = useState(null)

  // "הבדיקה האוטומטית" רצה גם בכל כניסה לדף (בנוסף לטעינת המערכת)
  useEffect(() => { api.runReturnCheck() }, [])

  function doScan(e) {
    e.preventDefault()
    const r = api.scanReturnSerial(scan)
    setScanMsg(r)
    setScan('')
  }

  const rows = db.returns.filter((r) => {
    const overdue = Date.now() > new Date(r.deadline).getTime() && r.status !== 'הושלמה'
    switch (filter) {
      // "דורשות טיפול" = כל החזרה שטרם הושלמה (כולל ממתינות — גם הן עבודה פתוחה)
      case 'attention': return r.status !== 'הושלמה'
      case 'overdue': return overdue
      case 'customer': return r.status === 'התכשיטים אצל הלקוחה'
      case 'courier': return r.status === 'בירור מול חברת המשלוחים'
      case 'partial': return r.status === 'התקבלה חלקית'
      case 'done': return r.status === 'הושלמה'
      default: return true
    }
  })

  const openCount = db.returns.filter((r) => r.status !== 'הושלמה').length
  const overdueCount = db.returns.filter((r) => r.status !== 'הושלמה' && Date.now() > new Date(r.deadline).getTime()).length
  const partialCount = db.returns.filter((r) => r.status === 'התקבלה חלקית').length
  const doneCount = db.returns.filter((r) => r.status === 'הושלמה').length

  return (
    <>
      {!embedded && <h1>החזרות ומעקב</h1>}
      <p className="admin-sub">
        קליטת החזרה נעשית <b>אך ורק בסריקת מספר הפריט במחסן</b> — סטטוס חברת המשלוחים לעולם
        אינו סוגר החזרה ואינו משחרר חסימת לקוחה. חסימת החלפות משתחררת אוטומטית רק כשכל
        הפריטים של ההחזרה נסרקו.
      </p>

      <div className="account-grid">
        <div className="stat-card"><div className="label">החזרות פתוחות</div><div className="value">{openCount}</div></div>
        <div className="stat-card"><div className="label">חרגו ממועד היעד</div><div className="value">{overdueCount}</div><div className="hint">יעד: 5 ימים מאישור השליח</div></div>
        <div className="stat-card"><div className="label">התקבלו חלקית</div><div className="value">{partialCount}</div></div>
        <div className="stat-card"><div className="label">הושלמו</div><div className="value">{doneCount}</div></div>
      </div>

      <div className="admin-section">
        <h2>עמדת סריקה — קליטת פריט חוזר</h2>
        <form onSubmit={doScan} className="scan-row">
          <input
            className="scan-input" dir="ltr" placeholder="B-VIBE-1 :סרקי / הקלידי מספר פריט"
            value={scan} onChange={(e) => setScan(e.target.value)} autoFocus
          />
          <button className="btn btn-sm">קליטה ✓</button>
        </form>
        {scanMsg && <p className={scanMsg.ok ? 'msg-ok' : 'form-err'} style={{ marginTop: 10 }}>{scanMsg.msg}</p>}
      </div>

      <div className="admin-section">
        <div className="admin-head-row">
          <h2>החזרות</h2>
          <div className="filters" style={{ margin: 0 }}>
            {FILTERS.map((f) => (
              <button key={f.id} className={`chip${filter === f.id ? ' on' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>החזרה</th><th>לקוחה</th><th>החלפה</th><th>מועד יעד</th><th>ימים</th><th>משלוח</th><th>פריטים</th><th>סטטוס</th><th>חסומה?</th><th>בירור / הדמיה</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan="10" style={{ color: 'var(--muted)' }}>אין החזרות בסינון הזה</td></tr>}
              {rows.map((r) => {
                const u = db.users.find((x) => x.id === r.userId)
                const ship = shipmentOf(db, r.orderId)
                const got = r.items.filter((i) => i.received).length
                const overdue = Date.now() > new Date(r.deadline).getTime() && r.status !== 'הושלמה'
                return (
                  <tr key={r.id}>
                    <td dir="ltr">{r.id}</td>
                    <td>
                      {u ? u.name : '—'}<br />
                      <span className="cell-sub" dir="ltr">{u ? u.phone : ''}</span><br />
                      <span className="cell-sub" dir="ltr">{u ? u.email : ''}</span>
                    </td>
                    <td dir="ltr">{r.orderId}<br /><span className="cell-sub">{heDate(r.createdAt)}</span></td>
                    <td className={overdue ? 'overdue-cell' : ''}>{heDate(r.deadline)}</td>
                    <td>{daysSince(r.createdAt)}</td>
                    <td>
                      {ship ? <><span dir="ltr">{ship.tracking}</span><br /><span className="cell-sub">{ship.courier} · {ship.status}</span></> : '—'}
                    </td>
                    <td>
                      <div className="cell-sub" style={{ marginBottom: 4 }}><b style={{ color: 'var(--ink)' }}>{got}/{r.items.length}</b> התקבלו</div>
                      {r.items.map((i) => {
                        const p = db.products.find((x) => x.id === i.pid)
                        return (
                          <div key={i.serial} className={i.received ? 'ret-item ok' : 'ret-item missing'}>
                            <span className="mini-art tiny">{p && <Art product={p} />}</span>
                            <span dir="ltr">{i.serial}</span> · {p ? p.name : i.pid} —{' '}
                            {i.received ? `נסרק ${heDate(i.receivedAt)} ✓` : 'חסר!'}
                          </div>
                        )
                      })}
                    </td>
                    <td><span className={`pill ${statusPill(r.status)}`}>{r.status}</span></td>
                    <td>{u && u.exchangeBlocked ? <span className="pill warn">חסומה</span> : <span className="pill ok">פעילה</span>}</td>
                    <td>
                      {r.status !== 'הושלמה' && (
                        <>
                          <select
                            className="select" style={{ maxWidth: 190, marginBottom: 6 }} defaultValue=""
                            onChange={(e) => { if (e.target.value) { api.investigateReturn(r.id, e.target.value); e.target.value = '' } }}
                          >
                            <option value="" disabled>תוצאת בירור מול השליח…</option>
                            <option value="courier">החבילה אצל השליח / בדרך</option>
                            <option value="customer">התכשיטים עדיין אצל הלקוחה</option>
                            <option value="warehouse">הגיעה למחסן וטרם נסרקה</option>
                            <option value="lost">חשש לאובדן / בעיית שליח</option>
                            <option value="other">אחר</option>
                          </select>
                          {db.debugMode && r.status === 'ממתינה להחזרה' && !r.issueOpenedAt && (
                            <button className="btn-mini" onClick={() => api.simulateOverdue(r.id)} title="לבדיקת התהליך בדמו — ניתן לכיבוי בהגדרות">הדמיית חלוף 5 ימים</button>
                          )}
                        </>
                      )}
                      {r.status === 'הושלמה' && <span className="cell-sub">הושלמה {heDate(r.completedAt)}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="cell-sub" style={{ marginTop: 18 }}>
        לוג ההודעות שנשלחו ללקוחות ויומן הביקורת המלא נמצאים בטאב "דוחות".
      </p>
    </>
  )
}
