import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  activeUnits, creditBalance, creditMonths, heDate,
  openReturnsFor, planOf, pointsUsed, purchasesOf, useAdminDb,
} from '../../lib/useAdminDb.js'
import Art from '../../components/Art.jsx'

const DAY = 86400000
const daysBetween = (a, b) => Math.max(0, Math.round(((b ? new Date(b) : new Date()) - new Date(a)) / DAY))

const TABS = [
  { id: 'rentals', label: 'היסטוריית השכרות' },
  { id: 'purchases', label: 'רכישות' },
  { id: 'returns', label: 'החזרות' },
  { id: 'shipping', label: 'משלוחים' },
  { id: 'details', label: 'פרטים וכתובת' },
]

export default function CustomerProfile() {
  const { id } = useParams()
  const { db, api } = useAdminDb()
  const [tab, setTab] = useState('rentals')
  const [msg, setMsg] = useState('')

  const u = db.users.find((x) => x.id === id)
  if (!u) {
    return (
      <>
        <h1>לקוחה לא נמצאה</h1>
        <p className="admin-sub"><Link to="/admin/customers" className="link-gold">← חזרה לרשימת הלקוחות</Link></p>
      </>
    )
  }

  const plan = planOf(db, u)
  const units = activeUnits(db, u.id)
  const used = pointsUsed(db, u.id)
  const orders = db.orders.filter((o) => o.userId === u.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const rets = db.returns.filter((r) => r.userId === u.id)
  const openRets = openReturnsFor(db, u.id)
  const ships = db.shipments.filter((s) => orders.some((o) => o.id === s.orderId))
  const purchases = purchasesOf(db, u.id)
  const notes = db.notifications.filter((n) => n.userId === u.id)
  const addr = u.address || {}
  const fullAddress = [addr.street, addr.houseNo, addr.apt && `דירה ${addr.apt}`, addr.city, addr.zip]
    .filter(Boolean).join(', ')

  // כל היחידות שאי פעם היו אצלה — עם תקופת ההשכרה
  const rentalRows = orders.flatMap((o) => o.items.map((it) => {
    const p = db.products.find((x) => x.id === it.pid)
    return {
      key: o.id + it.serial, order: o, product: p, serial: it.serial,
      from: it.since || o.createdAt, to: it.returnedAt || null,
    }
  })).filter((r) => r.product)

  function saveDetails(e) {
    e.preventDefault()
    const f = e.target
    api.updateCustomer(u.id, {
      name: f.elements['name'].value,
      phone: f.elements['phone'].value,
      email: f.elements['email'].value,
      address: {
        street: f.elements['street'].value,
        houseNo: f.elements['houseNo'].value,
        apt: f.elements['apt'].value,
        city: f.elements['city'].value,
        zip: f.elements['zip'].value,
        notes: f.elements['notes'].value,
      },
    })
    setMsg('הפרטים נשמרו ✓')
  }

  return (
    <>
      <p className="admin-sub" style={{ marginBottom: 8 }}>
        <Link to="/admin/customers" className="link-gold">← כל הלקוחות</Link>
      </p>

      <div className="admin-head-row">
        <h1>{u.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {u.canceledAt
            ? <span className="pill warn">עזבה {heDate(u.canceledAt)}</span>
            : u.suspendedAt
              ? <span className="pill info">מנוי מושהה מ-{heDate(u.suspendedAt)}</span>
              : <span className="pill ok">מנוי פעיל</span>}
          {u.exchangeBlocked && <span className="pill warn">החלפות חסומות</span>}
        </div>
      </div>

      {/* התראות */}
      {(u.exchangeBlocked || openRets.length > 0) && (
        <div className="blocked-panel" style={{ marginBottom: 20 }}>
          {u.exchangeBlocked && <p><b>ההחלפות של הלקוחה חסומות</b> — עד לקליטת כל הפריטים שבהחזרה הפתוחה.</p>}
          {openRets.map((r) => (
            <p key={r.id}>
              החזרה פתוחה <b dir="ltr">{r.id}</b>: התקבלו {r.items.filter((i) => i.received).length}/{r.items.length} ·
              יעד {heDate(r.deadline)}
              {r.items.some((i) => !i.received) && ` · חסרים: ${r.items.filter((i) => !i.received).map((i) => i.serial).join(', ')}`}
            </p>
          ))}
        </div>
      )}

      {/* כרטיסי מצב */}
      <div className="account-grid">
        <div className="stat-card">
          <div className="label">מסלול</div>
          <div className="value" style={{ fontSize: '1.5rem' }}>{plan.latin}</div>
          <div className="hint">₪{plan.price} לחודש · הצטרפה {u.joined}</div>
        </div>
        <div className="stat-card">
          <div className="label">נקודות בשימוש</div>
          <div className="value">{used} / {plan.points}</div>
          <div className="hint">נותרו {plan.points - used} נק׳</div>
        </div>
        <div className="stat-card">
          <div className="label">תכשיטים אצלה כרגע</div>
          <div className="value">{units.length}</div>
          <div className="hint">{orders.length} הזמנות בסך הכול</div>
        </div>
        <div className="stat-card credit-card">
          <div className="label">קרדיטים לרכישה</div>
          <div className="value">₪{Math.round(creditBalance(db, u)).toLocaleString()}</div>
          <div className="hint">{creditMonths(u)} חודשי מנוי</div>
        </div>
      </div>

      {/* פרטי קשר וכתובת בקצרה */}
      <div className="panel" style={{ marginTop: 18 }}>
        <div className="info-grid">
          <div><span className="il">מס׳ לקוחה</span><b dir="ltr">{u.id}</b></div>
          <div><span className="il">טלפון</span><b dir="ltr">{u.phone}</b></div>
          <div><span className="il">אימייל</span><b dir="ltr">{u.email}</b></div>
          <div><span className="il">כתובת למשלוח</span><b>{fullAddress || <span className="cell-sub">לא הוזנה — ניתן להוסיף בלשונית "פרטים וכתובת"</span>}</b></div>
          {addr.notes && <div><span className="il">הערות משלוח</span><b>{addr.notes}</b></div>}
        </div>
      </div>

      {/* התכשיטים שאצלה */}
      <div className="admin-section">
        <h2>תכשיטים אצל הלקוחה ({units.length})</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>תמונה</th><th>תכשיט</th><th>מק״ט</th><th>מס׳ פריט</th><th>נק׳</th><th>קיבלה בתאריך</th><th>ימים אצלה</th></tr></thead>
            <tbody>
              {units.length === 0 && <tr><td colSpan="7" style={{ color: 'var(--muted)' }}>אין תכשיטים אצל הלקוחה כרגע</td></tr>}
              {units.map((x) => (
                <tr key={x.serial}>
                  <td><div className="mini-art"><Art product={x.product} /></div></td>
                  <td>{x.product.name}</td>
                  <td dir="ltr">{x.product.sku}</td>
                  <td dir="ltr">{x.serial}</td>
                  <td>{x.product.points}</td>
                  <td>{heDate(x.since)}</td>
                  <td>{daysBetween(x.since)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* לשוניות היסטוריה */}
      <div className="subtabs" style={{ marginTop: 24 }}>
        {TABS.map((t) => (
          <button key={t.id} className={`subtab${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {msg && <p className="msg-ok">{msg}</p>}

      {tab === 'rentals' && (
        <div className="admin-section">
          <h2>כל התכשיטים שהושכרו ללקוחה ({rentalRows.length})</h2>
          <div className="table-wrap">
            <table className="admin-table">
              <thead><tr><th>תכשיט</th><th>מק״ט</th><th>מס׳ פריט</th><th>הזמנה</th><th>סוג</th><th>מתאריך</th><th>עד תאריך</th><th>ימים</th></tr></thead>
              <tbody>
                {rentalRows.length === 0 && <tr><td colSpan="8" style={{ color: 'var(--muted)' }}>אין היסטוריית השכרות</td></tr>}
                {rentalRows.map((r) => (
                  <tr key={r.key}>
                    <td>{r.product.name}</td>
                    <td dir="ltr">{r.product.sku}</td>
                    <td dir="ltr">{r.serial}</td>
                    <td dir="ltr">{r.order.id}</td>
                    <td>{r.order.type}</td>
                    <td>{heDate(r.from)}</td>
                    <td>{r.to ? heDate(r.to) : <span className="pill ok">אצלה כעת</span>}</td>
                    <td>{daysBetween(r.from, r.to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'purchases' && (
        <div className="admin-section">
          <h2>רכישות ({purchases.length})</h2>
          <div className="table-wrap">
            <table className="admin-table">
              <thead><tr><th>מס׳ רכישה</th><th>תכשיט</th><th>מק״ט</th><th>מס׳ פריט</th><th>תאריך</th><th>מחיר</th><th>שולם בקרדיט</th><th>שולם בפועל</th></tr></thead>
              <tbody>
                {purchases.length === 0 && <tr><td colSpan="8" style={{ color: 'var(--muted)' }}>הלקוחה טרם רכשה תכשיטים</td></tr>}
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td dir="ltr">{p.id}</td>
                    <td>{p.name}</td>
                    <td dir="ltr">{p.sku}</td>
                    <td dir="ltr">{p.serial}</td>
                    <td>{heDate(p.date)}</td>
                    <td className="num">₪{p.price.toLocaleString()}</td>
                    <td className="num">₪{Math.round(p.creditUsed).toLocaleString()}</td>
                    <td className="num">₪{Math.round(p.paid).toLocaleString()}</td>
                  </tr>
                ))}
                {purchases.length > 0 && (
                  <tr className="total">
                    <td colSpan="5">סה״כ</td>
                    <td className="num">₪{purchases.reduce((s, p) => s + p.price, 0).toLocaleString()}</td>
                    <td className="num">₪{Math.round(purchases.reduce((s, p) => s + p.creditUsed, 0)).toLocaleString()}</td>
                    <td className="num">₪{Math.round(purchases.reduce((s, p) => s + p.paid, 0)).toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'returns' && (
        <div className="admin-section">
          <h2>החזרות ({rets.length})</h2>
          <div className="table-wrap">
            <table className="admin-table">
              <thead><tr><th>מס׳ החזרה</th><th>הזמנה</th><th>נפתחה</th><th>יעד</th><th>פריטים</th><th>סטטוס</th></tr></thead>
              <tbody>
                {rets.length === 0 && <tr><td colSpan="6" style={{ color: 'var(--muted)' }}>אין החזרות</td></tr>}
                {rets.map((r) => (
                  <tr key={r.id}>
                    <td dir="ltr">{r.id}</td>
                    <td dir="ltr">{r.orderId}</td>
                    <td>{heDate(r.createdAt)}</td>
                    <td>{heDate(r.deadline)}</td>
                    <td>
                      {r.items.map((i) => (
                        <div key={i.serial} className={i.received ? 'ret-item ok' : 'ret-item missing'}>
                          <span dir="ltr">{i.serial}</span> — {i.received ? `נסרק ${heDate(i.receivedAt)} ✓` : 'טרם הוחזר'}
                        </div>
                      ))}
                    </td>
                    <td><span className={`pill ${r.status === 'הושלמה' ? 'ok' : 'warn'}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {notes.length > 0 && (
            <>
              <h3 className="rep-h3">הודעות שנשלחו ללקוחה</h3>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead><tr><th>תאריך</th><th>ערוץ</th><th>סטטוס</th><th>תוכן</th></tr></thead>
                  <tbody>
                    {notes.map((n, i) => (
                      <tr key={i}>
                        <td>{heDate(n.ts)}</td><td>{n.channel}</td>
                        <td><span className="pill ok">{n.status}</span></td>
                        <td className="cell-sub" style={{ maxWidth: 420 }}>{n.text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'shipping' && (
        <div className="admin-section">
          <h2>משלוחים ({ships.length})</h2>
          <div className="table-wrap">
            <table className="admin-table">
              <thead><tr><th>מס׳ משלוח</th><th>מעקב</th><th>הזמנה</th><th>חברה</th><th>תאריך</th><th>סטטוס</th></tr></thead>
              <tbody>
                {ships.length === 0 && <tr><td colSpan="6" style={{ color: 'var(--muted)' }}>אין משלוחים</td></tr>}
                {ships.map((s) => (
                  <tr key={s.id}>
                    <td dir="ltr">{s.id}</td>
                    <td dir="ltr">{s.tracking}</td>
                    <td dir="ltr">{s.orderId}</td>
                    <td>{s.courier}</td>
                    <td>{s.date}</td>
                    <td><span className={`pill ${s.status === 'נמסר ללקוחה' ? 'ok' : 'info'}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'details' && (
        <div className="admin-section">
          <h2>פרטי קשר וכתובת למשלוח</h2>
          <form className="admin-form" onSubmit={saveDetails}>
            <div className="field"><label>שם מלא</label><input name="name" defaultValue={u.name} required /></div>
            <div className="field"><label>טלפון</label><input name="phone" defaultValue={u.phone} dir="ltr" /></div>
            <div className="field"><label>אימייל</label><input name="email" type="email" defaultValue={u.email} dir="ltr" /></div>
            <div className="field"><label>רחוב</label><input name="street" defaultValue={addr.street} /></div>
            <div className="field"><label>מספר בית</label><input name="houseNo" defaultValue={addr.houseNo} /></div>
            <div className="field"><label>דירה</label><input name="apt" defaultValue={addr.apt} /></div>
            <div className="field"><label>עיר</label><input name="city" defaultValue={addr.city} /></div>
            <div className="field"><label>מיקוד</label><input name="zip" defaultValue={addr.zip} dir="ltr" /></div>
            <div className="field"><label>הערות למשלוח</label><input name="notes" defaultValue={addr.notes} placeholder="קוד לבניין, שעות, השארה אצל שכן…" /></div>
            <div className="form-actions"><button className="btn btn-sm">שמירה</button></div>
          </form>
          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {!u.canceledAt && !u.suspendedAt && (
              <button className="btn-mini" onClick={() => { if (confirm(`להשהות את המנוי של ${u.name}? היא לא תחויב ולא תוכל להזמין עד ההפעלה מחדש.`)) api.suspendSubscription(u.id) }}>השהיית מנוי</button>
            )}
            {u.suspendedAt && (
              <button className="btn-mini strong" onClick={() => api.resumeSubscription(u.id)}>הפעלת מנוי מחדש</button>
            )}
            {!u.canceledAt
              ? <button className="btn-mini" onClick={() => { if (confirm(`לבטל את המנוי של ${u.name}?`)) api.cancelSubscription(u.id) }}>ביטול מנוי</button>
              : <button className="btn-mini" onClick={() => api.reactivateSubscription(u.id)}>חידוש מנוי</button>}
          </div>
        </div>
      )}
    </>
  )
}
