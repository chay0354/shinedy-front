import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SHIP_FLOW, heDate, useAdminDb } from '../../lib/useAdminDb.js'
import Art from '../../components/Art.jsx'

const DAY = 86400000
const daysBetween = (a, b) => Math.max(0, Math.round(((b ? new Date(b) : new Date()) - new Date(a)) / DAY))
const iso = (d) => new Date(d).toISOString().slice(0, 10)

export default function Rentals() {
  const { db, api } = useAdminDb()
  // ברירת מחדל: 3 חודשים אחורה עד היום
  const [from, setFrom] = useState(iso(Date.now() - 90 * DAY))
  const [to, setTo] = useState(iso(Date.now()))
  const [q, setQ] = useState('')
  const [onlyActive, setOnlyActive] = useState(false)

  const fromT = new Date(from).getTime()
  const toT = new Date(to).setHours(23, 59, 59, 999)

  // כל השכרה = יחידה פיזית אצל לקוחה, עם תאריך התחלה וסיום
  const rows = useMemo(() => {
    const out = []
    for (const o of db.orders) {
      const u = db.users.find((x) => x.id === o.userId)
      for (const it of o.items) {
        const p = db.products.find((x) => x.id === it.pid)
        if (!p) continue
        const start = new Date(it.since || o.createdAt).getTime()
        const end = it.returnedAt ? new Date(it.returnedAt).getTime() : null
        // חפיפה לטווח שנבחר: ההשכרה התחילה לפני סוף הטווח והסתיימה אחרי תחילתו
        if (start > toT) continue
        if (end !== null && end < fromT) continue
        out.push({
          key: o.id + it.serial, order: o, user: u, product: p, serial: it.serial,
          from: it.since || o.createdAt, to: it.returnedAt || null,
          purchased: !!it.purchased,
          days: daysBetween(it.since || o.createdAt, it.returnedAt),
        })
      }
    }
    const term = q.trim().toLowerCase()
    return out
      .filter((r) => (!onlyActive || !r.to))
      .filter((r) => !term || [r.user && r.user.name, r.product.name, r.serial, r.product.sku, r.order.id]
        .some((v) => (v || '').toString().toLowerCase().includes(term)))
      .sort((a, b) => new Date(b.from) - new Date(a.from))
  }, [db, fromT, toT, q, onlyActive])

  const activeNow = rows.filter((r) => !r.to).length
  const shipsInTransit = db.shipments.filter((s) => s.status !== 'נמסר ללקוחה').length

  return (
    <>
      <h1>ניהול השכרות</h1>
      <p className="admin-sub">
        כל תכשיט שהושכר — מתאריך עד תאריך, אצל מי, וכמה זמן.
        הטיפול במחסן (ליקוט וקליטת החזרות) נמצא בטאב "מחסן".
      </p>

      <div className="kpi-filters">
        <div className="filter-group">
          <label>מתאריך</label>
          <input className="select" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>עד תאריך</label>
          <input className="select" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>חיפוש</label>
          <input className="select" style={{ minWidth: 240 }} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="לקוחה, תכשיט, מק״ט או מס׳ פריט…" />
        </div>
        <div className="filter-group">
          <label>&nbsp;</label>
          <button className={`chip${onlyActive ? ' on' : ''}`} onClick={() => setOnlyActive((v) => !v)}>
            רק מה שאצל לקוחות עכשיו
          </button>
        </div>
      </div>

      <div className="account-grid">
        <div className="stat-card">
          <div className="label">השכרות בטווח</div>
          <div className="value">{rows.length}</div>
          <div className="hint">{heDate(from)} – {heDate(to)}</div>
        </div>
        <div className="stat-card">
          <div className="label">אצל לקוחות כעת</div>
          <div className="value">{activeNow}</div>
        </div>
        <div className="stat-card">
          <div className="label">משלוחים בדרך</div>
          <div className="value">{shipsInTransit}</div>
        </div>
        <div className="stat-card">
          <div className="label">ממוצע ימי השכרה</div>
          <div className="value">{rows.length ? Math.round(rows.reduce((s, r) => s + r.days, 0) / rows.length) : 0}</div>
          <div className="hint">ימים לתכשיט</div>
        </div>
      </div>

      <div className="admin-section">
        <h2>השכרות ({rows.length})</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>תכשיט</th><th></th><th>מק״ט</th><th>מס׳ פריט</th><th>לקוחה</th><th>הזמנה</th>
                <th>מתאריך</th><th>עד תאריך</th><th>ימים</th><th>מצב</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan="10" style={{ color: 'var(--muted)' }}>אין השכרות בטווח שנבחר</td></tr>}
              {rows.map((r) => (
                <tr key={r.key}>
                  <td><div className="mini-art"><Art product={r.product} /></div></td>
                  <td>{r.product.name}</td>
                  <td dir="ltr">{r.product.sku}</td>
                  <td dir="ltr">{r.serial}</td>
                  <td>{r.user ? <Link className="cust-link" to={`/admin/customers/${r.user.id}`}>{r.user.name}</Link> : '—'}</td>
                  <td dir="ltr">{r.order.id}</td>
                  <td>{heDate(r.from)}</td>
                  <td>{r.to ? heDate(r.to) : <span className="cell-sub">—</span>}</td>
                  <td>{r.days}</td>
                  <td>
                    {r.purchased
                      ? <span className="pill ok">נרכש</span>
                      : r.to
                        ? <span className="pill ok">הוחזר</span>
                        : <span className="pill info">אצל הלקוחה</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <h2>משלוחים אצל חברת המשלוחים ({shipsInTransit} בדרך)</h2>
        <p className="admin-sub" style={{ marginTop: -6 }}>
          הממשק כאן מדמה את חברת המשלוחים; בגרסת הענן הכפתורים האלה יתחלפו בחיבור API
          אמיתי (צ'יטה / HFD / דואר שליחים). חשוב: סטטוס השליח לעולם אינו סוגר החזרה — רק סריקה במחסן.
        </p>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>מס׳ משלוח</th><th>מעקב</th><th>הזמנה</th><th>לקוחה</th><th>תאריך</th><th>סטטוס שליח</th><th>עדכון</th></tr>
            </thead>
            <tbody>
              {db.shipments.length === 0 && <tr><td colSpan="7" style={{ color: 'var(--muted)' }}>אין משלוחים עדיין</td></tr>}
              {db.shipments.map((s) => {
                const o = db.orders.find((x) => x.id === s.orderId)
                const u = o && db.users.find((x) => x.id === o.userId)
                return (
                  <tr key={s.id}>
                    <td dir="ltr">{s.id}</td>
                    <td dir="ltr">{s.tracking}</td>
                    <td dir="ltr">{s.orderId}</td>
                    <td>{u ? <Link className="cust-link" to={`/admin/customers/${u.id}`}>{u.name}</Link> : '—'}</td>
                    <td>{s.date}</td>
                    <td><span className={`pill ${s.status === 'נמסר ללקוחה' ? 'ok' : 'info'}`}>{s.status}</span></td>
                    <td>
                      {s.status !== 'נמסר ללקוחה' && (
                        <button className="btn-mini" onClick={() => api.advanceShipment(s.id)}>
                          {s.status === SHIP_FLOW[0] ? 'השליח אסף' : 'נמסר ללקוחה'}
                        </button>
                      )}
                    </td>
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
