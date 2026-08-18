import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { planOf, useAdminDb } from '../../lib/useAdminDb.js'
import Returns from './AdminReturnsPanel.jsx'

function orderPill(status) {
  if (status === 'נמסרה' || status === 'הוחזרה') return 'ok'
  if (status === 'נשלחה' || status === 'נשלח') return 'info'
  return 'warn'
}

// פתק ליקוט להדפסה — מודפס ומוכנס לנרתיק; ה-QR מכיל את מספר ההזמנה ומספרי הפריטים
function Slip({ order, db, onClose }) {
  const customer = db.users.find((x) => x.id === order.userId || x.name === order.customerName)
  const plan = customer ? planOf(db, customer) : null
  const payload = JSON.stringify({
    order: order.id,
    items: (order.items || []).map((it) => it.serial),
    returns: (order.returns || []).map((r) => r.serial),
  })

  // בזמן שהפתק פתוח — הדפסה מדפיסה רק אותו (ראו חוקי @media print)
  useEffect(() => {
    document.body.classList.add('has-slip')
    return () => document.body.classList.remove('has-slip')
  }, [])

  return (
    <div className="slip-overlay">
      <div className="slip">
        <div className="slip-brand">SHINEDY</div>
        <div className="slip-title">פתק ליקוט ונרתיק · {order.type}</div>
        <table className="slip-table">
          <tbody>
            <tr><td>מס׳ הזמנה</td><td dir="ltr">{order.id}</td></tr>
            <tr><td>תאריך</td><td>{order.date}</td></tr>
            <tr><td>לקוחה</td><td>{customer ? customer.name : '—'}</td></tr>
            <tr><td>טלפון</td><td dir="ltr">{customer ? customer.phone : ''}</td></tr>
            <tr><td>מסלול</td><td>{plan ? plan.latin : ''}</td></tr>
          </tbody>
        </table>
        <div className="slip-items-title">פריטים ללקט:</div>
        <table className="slip-table slip-items">
          <thead><tr><th>תכשיט</th><th>מספר פריט</th><th>נק׳</th></tr></thead>
          <tbody>
            {order.items.map((it) => {
              const p = db.products.find((x) => x.id === it.pid)
              return (
                <tr key={it.serial}>
                  <td>{p ? p.name : it.pid}</td>
                  <td dir="ltr">{it.serial}</td>
                  <td>{p ? p.points : ''}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {order.returns && order.returns.length > 0 && (
          <>
            <div className="slip-items-title">הלקוחה מחזירה בנרתיק:</div>
            <table className="slip-table slip-items">
              <tbody>
                {order.returns.map((r) => {
                  const p = db.products.find((x) => x.id === r.pid)
                  return (
                    <tr key={r.serial}>
                      <td>{p ? p.name : r.pid}</td>
                      <td dir="ltr">{r.serial}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}
        <div className="slip-qr" style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
          <QRCodeSVG value={payload} size={180} includeMargin />
        </div>
        <div className="slip-foot">להדפיס, להכניס לנרתיק ולסרוק בקבלת ההחזרה</div>
        <div className="slip-actions">
          <button className="btn btn-sm" onClick={() => window.print()}>הדפסה</button>
          <button className="btn btn-outline btn-sm" onClick={onClose}>סגירה</button>
        </div>
      </div>
    </div>
  )
}

// ===== הזמנות יוצאות: ליקוט → אריזה → שליח =====
function Outgoing() {
  const { db, api } = useAdminDb()
  const [slipOrder, setSlipOrder] = useState(null)
  const [showDone, setShowDone] = useState(false)

  const OPEN = ['חדשה', 'בליקוט', 'ליקוט', 'נארזה', 'בקרה', 'אריזה']
  const SENT = ['נשלחה', 'נשלח', 'נמסרה']
  const inProcess = db.orders.filter((o) => OPEN.includes(o.status))
  const onTheWay = db.orders.filter((o) => SENT.includes(o.status))
  // רכישות שהתכשיט אינו אצל הרוכשת (אורחת / מהקטלוג) — המחסן צריך לשלוח
  const pursToShip = db.purchases.filter((x) => x.needsShipping && !x.shippedAt)

  const rowsOf = (list) => list.map((o) => {
    const u = db.users.find((x) => x.id === o.userId) || db.users.find((x) => x.name === o.customerName)
    return (
      <tr key={o.id}>
        <td dir="ltr">{o.id}</td>
        <td>{u ? u.name : '—'}<br /><span className="cell-sub" dir="ltr">{u ? u.phone : ''}</span></td>
        <td>
          {o.items.map((it) => {
            const p = db.products.find((x) => x.id === it.pid)
            return (
              <div key={it.serial}>
                {p ? p.name : it.pid} · <span className="cell-sub" dir="ltr">{it.serial}</span>
              </div>
            )
          })}
          {o.returns && o.returns.length > 0 && (
            <div className="returns-note">מחזירה בנרתיק: {o.returns.map((r) => r.serial).join(', ')}</div>
          )}
        </td>
        <td>{o.type}</td>
        <td>{o.date}</td>
        <td><span className={`pill ${orderPill(o.status)}`}>{o.status}</span></td>
        <td><button className="btn-mini" onClick={() => setSlipOrder(o)}>פתק + QR</button></td>
        <td>
          {(o.status === 'חדשה' || o.status === 'ליקוט' || o.status === 'בליקוט') && <button type="button" className="btn-mini" onClick={() => api.advanceFulfillment(o.id)}>התחילי ליקוט / קדמי</button>}
          {(o.status === 'בקרה' || o.status === 'נארזה') && <button type="button" className="btn-mini" onClick={() => api.advanceFulfillment(o.id)}>אישור אריזה</button>}
          {o.status === 'אריזה' && <button type="button" className="btn-mini strong" onClick={() => api.orderCourier(o.id)}>הזמיני שליח ↗</button>}
          {o.status === 'נמסרה' && o.returns && o.returns.length > 0 && (
            <span className="cell-sub">קליטת המוחזרים — בלשונית "החזרות נכנסות"</span>
          )}
          {o.status === 'נמסרה' && (!o.returns || o.returns.length === 0) && (
            <button type="button" className="btn-mini" onClick={() => api.returnOrder(o.id)}>התקבלה החזרה מלאה</button>
          )}
        </td>
      </tr>
    )
  })

  return (
    <>
      <p className="admin-sub">
        הזרימה: הזמנה חדשה → ליקוט → הדפסת פתק + QR לנרתיק → אריזה → "הזמיני שליח".
        מעקב המשלוחים עצמם נמצא בטאב "ניהול השכרות".
      </p>

      <div className="admin-section">
        <h2>ממתינות לטיפול ({inProcess.length})</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>מס׳ הזמנה</th><th>לקוחה</th><th>פריטים ללקט (מס׳ פריט)</th><th>סוג</th><th>תאריך</th><th>סטטוס</th><th>פתק</th><th>פעולה</th></tr>
            </thead>
            <tbody>
              {inProcess.length === 0 && <tr><td colSpan="8" style={{ color: 'var(--muted)' }}>אין הזמנות שממתינות לטיפול — הכול טופל ✓</td></tr>}
              {rowsOf(inProcess)}
            </tbody>
          </table>
        </div>
      </div>

      {pursToShip.length > 0 && (
        <div className="admin-section">
          <h2>רכישות למשלוח ({pursToShip.length})</h2>
          <p className="admin-sub" style={{ marginTop: -6 }}>
            תכשיטים שנרכשו (רכישת אורחת או רכישה מהקטלוג) והרוכשת עדיין לא קיבלה אותם.
          </p>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>מס׳ רכישה</th><th>רוכשת</th><th>תכשיט</th><th>כתובת למשלוח</th><th>שולם</th><th>פעולה</th></tr>
              </thead>
              <tbody>
                {pursToShip.map((pur) => {
                  const buyerName = pur.recipient || (pur.buyer && pur.buyer.name) || '—'
                  const a = pur.address || {}
                  return (
                    <tr key={pur.id}>
                      <td dir="ltr">{pur.id}</td>
                      <td>
                        {buyerName}{!pur.userId && <span className="cell-sub"> (אורחת)</span>}
                        {pur.buyer && pur.buyer.phone && <><br /><span className="cell-sub" dir="ltr">{pur.buyer.phone}</span></>}
                      </td>
                      <td>{pur.name} <span className="cell-sub" dir="ltr">{pur.serial}</span></td>
                      <td>{[a.street, a.houseNo, a.apt && `דירה ${a.apt}`, a.city].filter(Boolean).join(', ') || '—'}</td>
                      <td>₪{Math.round(pur.paid).toLocaleString()}</td>
                      <td><button className="btn-mini strong" onClick={() => api.markPurchaseShipped(pur.id)}>נשלחה ✓</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-section">
        <div className="admin-head-row">
          <h2>יצאו מהמחסן ({onTheWay.length})</h2>
          <button className="btn-mini" onClick={() => setShowDone((v) => !v)}>
            {showDone ? 'הסתרה' : 'הצגה'}
          </button>
        </div>
        {showDone && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>מס׳ הזמנה</th><th>לקוחה</th><th>פריטים</th><th>סוג</th><th>תאריך</th><th>סטטוס</th><th>פתק</th><th>פעולה</th></tr>
              </thead>
              <tbody>
                {onTheWay.length === 0 && <tr><td colSpan="8" style={{ color: 'var(--muted)' }}>אין הזמנות שיצאו</td></tr>}
                {rowsOf(onTheWay)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {slipOrder && <Slip order={slipOrder} db={db} onClose={() => setSlipOrder(null)} />}
    </>
  )
}

// ===== מסך המחסן: אותה עמדה, שני מצבי עבודה =====
export default function Warehouse() {
  const { db } = useAdminDb()
  const location = useLocation()
  const fromPath = location.pathname.includes('returns') ? 'in' : 'out'
  const [tab, setTab] = useState(fromPath)
  // הרכיב משרת גם את /admin/warehouse וגם את /admin/returns — צריך להגיב לשינוי הנתיב,
  // אחרת מעבר בין השניים משאיר את הלשונית הקודמת
  useEffect(() => { setTab(fromPath) }, [fromPath])

  const waiting = db.orders.filter((o) => ['חדשה', 'בליקוט', 'ליקוט', 'נארזה', 'בקרה', 'אריזה'].includes(o.status)).length
  const openReturns = db.returns.filter((r) => r.status !== 'הושלמה').length

  return (
    <>
      <h1>מחסן</h1>
      <div className="subtabs">
        <button className={`subtab${tab === 'out' ? ' on' : ''}`} onClick={() => setTab('out')}>
          הזמנות יוצאות {waiting > 0 && <span className="subtab-badge">{waiting}</span>}
        </button>
        <button className={`subtab${tab === 'in' ? ' on' : ''}`} onClick={() => setTab('in')}>
          החזרות נכנסות {openReturns > 0 && <span className="subtab-badge">{openReturns}</span>}
        </button>
      </div>

      {tab === 'out' ? <Outgoing /> : <Returns embedded />}
    </>
  )
}
