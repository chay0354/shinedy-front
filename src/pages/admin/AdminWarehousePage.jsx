import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { computeOrderStats } from '../../lib/adminOverview.js'
import { QRCodeSVG } from 'qrcode.react'
import { planOf, heDate, useAdminDb } from '../../lib/useAdminDb.js'
import { courierActionLabel, resolveCourierJob } from '../../lib/courierJob.js'
import AdminUserCell, { userPlanLabel } from '../../components/AdminUserCell.jsx'
import Returns from './AdminReturnsPanel.jsx'
import PrintLabels, { ShippingLabel, formatAddress } from '../../components/PrintLabels.jsx'

function orderShipLabel(db, o) {
  const u = db.users.find((x) => x.id === o.userId) || db.users.find((x) => x.name === o.customerName)
  const job = resolveCourierJob(o)
  return {
    id: o.id,
    recipient: (u && u.name) || o.customerName,
    phone: (u && u.phone) || '',
    address: formatAddress(o.address || (u && u.address)),
    jobLabel: o.courierJobLabel || courierActionLabel(job).replace('הזמיני שליח — ', ''),
    signatureLabel: o.deliverySignatureRequired ? 'חתימת מסירה נדרשת' : '',
    planLabel: userPlanLabel(db, u),
    itemsCount: (o.items || []).length,
    qrValue: JSON.stringify({ order: o.id, items: (o.items || []).map((it) => it.serial), job }),
  }
}

function purchaseShipLabel(db, pur) {
  const buyer = db.users.find((x) => x.id === pur.userId) || pur.buyer || null
  return {
    id: pur.id,
    recipient: pur.recipient || (buyer && buyer.name) || '',
    phone: pur.phone || (buyer && buyer.phone) || '',
    address: formatAddress(pur.address || (buyer && buyer.address)),
    jobLabel: 'משלוח רכישה',
    planLabel: userPlanLabel(db, buyer),
    itemsCount: 1,
    qrValue: JSON.stringify({ purchase: pur.id, items: [pur.serial].filter(Boolean) }),
  }
}

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
    job: resolveCourierJob(order),
    deliverySignatureRequired: Boolean(order.deliverySignatureRequired),
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
            <tr><td>לשליח</td><td>{order.courierJobLabel || courierActionLabel(resolveCourierJob(order)).replace('הזמיני שליח — ', '')}</td></tr>
            <tr><td>חתימת מסירה</td><td>{order.deliverySignatureLabel || (order.deliverySignatureRequired ? 'נדרשת' : 'לא נדרשת')}</td></tr>
          </tbody>
        </table>
        <div className="slip-items-title">{order.needsDelivery === false ? 'אין פריטים למשלוח' : 'פריטים ללקט:'}</div>
        <table className="slip-table slip-items">
          <thead><tr><th>תכשיט</th><th>מספר פריט</th><th>נק׳</th></tr></thead>
          <tbody>
            {(order.items || []).map((it) => {
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
        <div className="slip-qr">
          <QRCodeSVG value={payload} size={220} includeMargin />
        </div>
        <div className="slip-foot">בהדפסה יוצא רק הברקוד — להכניס לנרתיק ולסרוק בקבלת ההחזרה</div>
        <div className="slip-actions">
          <button className="btn btn-sm" onClick={() => window.print()}>הדפסת ברקוד</button>
          <button className="btn btn-outline btn-sm" onClick={onClose}>סגירה</button>
        </div>
      </div>
    </div>
  )
}

function OrderStatsPanel({ orders }) {
  const s = useMemo(() => computeOrderStats(orders), [orders])
  return (
    <aside className="warehouse-stats" aria-label="סיכום הזמנות">
      <div className="warehouse-stats-head">
        <div className="wh-stat-block">
          <span className="wh-stat-lab">סה״כ הזמנות</span>
          <b className="wh-stat-num">{s.total}</b>
        </div>
        <div className="wh-stat-block">
          <span className="wh-stat-lab">הזמנות פתוחות</span>
          <b className={`wh-stat-num${s.open > 0 ? ' tone-urgent' : ''}`}>{s.open}</b>
        </div>
      </div>
      <ul className="warehouse-stats-list">
        <li>
          <span>טרם נשלחו · ממתינות לטיפול</span>
          <b className={s.pending > 0 ? 'tone-urgent' : 'tone-ok'}>{s.pending}</b>
        </li>
        <li>
          <span>נשלחו וטרם נמסרו</span>
          <b className={s.inTransit > 0 ? 'tone-warn' : 'tone-ok'}>{s.inTransit}</b>
        </li>
        <li>
          <span>נמסרו</span>
          <b className="tone-ok">{s.delivered}</b>
        </li>
      </ul>
    </aside>
  )
}

// ===== הזמנות יוצאות: ליקוט → אריזה → שליח =====
function Outgoing() {
  const { db, api } = useAdminDb()
  const [slipOrder, setSlipOrder] = useState(null)
  const [showDone, setShowDone] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [shipLabels, setShipLabels] = useState(null)

  const OPEN = ['חדשה', 'בליקוט', 'ליקוט', 'נארזה', 'בקרה', 'אריזה']
  const SENT = ['נשלחה', 'נשלח', 'נמסרה']
  const inProcess = db.orders.filter((o) => OPEN.includes(o.status))
  const onTheWay = db.orders.filter((o) => SENT.includes(o.status))
  // רכישות שהתכשיט אינו אצל הרוכשת (אורחת / מהקטלוג) — המחסן צריך לשלוח
  const pursToShip = db.purchases.filter((x) => x.needsShipping && !x.shippedAt)

  async function act(orderId, fn) {
    setBusyId(orderId)
    try {
      await fn()
    } finally {
      setBusyId(null)
    }
  }

  const rowsOf = (list) => list.map((o) => {
    const u = db.users.find((x) => x.id === o.userId) || db.users.find((x) => x.name === o.customerName)
    const busy = busyId === o.id
    const plan = userPlanLabel(db, u)
    const phone = (u && u.phone) || ''
    return (
      <tr key={o.id}>
        <td><span dir="ltr">{o.id}</span></td>
        <td>
          <AdminUserCell db={db} user={u} name={o.customerName} details={false} />
          <span className="cell-sub wh-cell-line">{plan || '—'}</span>
          {phone && <span className="cell-sub wh-cell-line" dir="ltr">{phone}</span>}
        </td>
        <td>
          {(o.items || []).map((it) => {
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
        <td>
          {o.type}
          <br />
          <span className="cell-sub">{o.courierJobLabel || 'משלוח'}</span>
          <br />
          <span className="cell-sub">{o.deliverySignatureLabel || (o.deliverySignatureRequired ? 'חתימת מסירה נדרשת' : 'ללא חתימת מסירה')}</span>
        </td>
        <td>{o.date}</td>
        <td><span className={`pill ${orderPill(o.status)}`}>{o.status}</span></td>
        <td>
          <div className="btn-stack">
            <button type="button" className="btn-mini" onClick={() => setSlipOrder(o)}>פתק + QR</button>
            {o.needsDelivery !== false && (
              <button type="button" className="btn-mini" onClick={() => setShipLabels([orderShipLabel(db, o)])}>מדבקת משלוח</button>
            )}
          {(o.status === 'חדשה' || o.status === 'ליקוט' || o.status === 'בליקוט') && (
            <button type="button" className="btn-mini" disabled={busy} onClick={() => act(o.id, () => api.advanceFulfillment(o.id))}>
              {busy ? 'מקדמת…' : 'התחילי ליקוט / קדמי'}
            </button>
          )}
          {(o.status === 'בקרה' || o.status === 'נארזה') && (
            <button type="button" className="btn-mini" disabled={busy} onClick={() => act(o.id, () => api.advanceFulfillment(o.id))}>
              {busy ? 'מקדמת…' : 'אישור אריזה'}
            </button>
          )}
          {o.status === 'אריזה' && (
            <button type="button" className="btn-mini strong" disabled={busy} onClick={() => act(o.id, () => api.orderCourier(o.id))}>
              {busy ? 'מזמינה שליח…' : `${courierActionLabel(resolveCourierJob(o))} ↗`}
            </button>
          )}
          {o.status === 'נמסרה' && o.returns && o.returns.length > 0 && (
            <span className="cell-sub">קליטת המוחזרים — בלשונית "החזרות נכנסות"</span>
          )}
          {o.status === 'נמסרה' && (!o.returns || o.returns.length === 0) && (
            <button type="button" className="btn-mini" onClick={() => api.returnOrder(o.id)}>התקבלה החזרה מלאה</button>
          )}
          </div>
        </td>
      </tr>
    )
  })

  return (
    <div className="warehouse-main">
      <OrderStatsPanel orders={db.orders} />

      <div className="admin-section">
        <div className="admin-head-row">
          <h2>ממתינות לטיפול ({inProcess.length})</h2>
          {inProcess.some((o) => o.needsDelivery !== false) && (
            <button
              type="button"
              className="btn-mini"
              onClick={() => setShipLabels(inProcess.filter((o) => o.needsDelivery !== false).map((o) => orderShipLabel(db, o)))}
            >
              הדפסת כל מדבקות המשלוח
            </button>
          )}
        </div>
        <p className="admin-sub" style={{ marginTop: -6 }}>
          הזמנה → ליקוט → פתק + QR → אריזה → שליח. מסלול ראשון ללא חתימת מסירה, שני המסלולים הגבוהים עם חתימה.
        </p>
        <div className="table-wrap wh-table-wrap">
          <table className="admin-table wh-table">
            <thead>
              <tr><th>מס׳ הזמנה</th><th>לקוחה</th><th>פריטים ללקט</th><th>סוג</th><th>תאריך</th><th>סטטוס</th><th>פעולות</th></tr>
            </thead>
            <tbody>
              {inProcess.length === 0 && <tr><td colSpan="7" style={{ color: 'var(--muted)' }}>אין הזמנות שממתינות לטיפול. הכול טופל ✓</td></tr>}
              {rowsOf(inProcess)}
            </tbody>
          </table>
        </div>
      </div>

      {pursToShip.length > 0 && (
        <div className="admin-section">
          <h2>רכישות למשלוח ({pursToShip.length})</h2>
          <p className="admin-sub" style={{ marginTop: -6 }}>
            מכירה = משלוח בלבד. תכשיטים שנרכשו והרוכשת עדיין לא קיבלה אותם.
          </p>
          <div className="table-wrap wh-table-wrap">
            <table className="admin-table wh-table">
              <thead>
                <tr><th>מס׳ רכישה</th><th>רוכשת</th><th>תכשיט</th><th>כתובת למשלוח</th><th>שולם</th><th>פעולה</th></tr>
              </thead>
              <tbody>
                {pursToShip.map((pur) => {
                  const buyer = db.users.find((x) => x.id === pur.userId) || pur.buyer || null
                  const buyerName = pur.recipient || (buyer && buyer.name) || '—'
                  const a = pur.address || {}
                  return (
                    <tr key={pur.id}>
                      <td><span dir="ltr">{pur.id}</span></td>
                      <td>
                        <AdminUserCell db={db} user={buyer} name={buyerName} details={false} />
                        {!pur.userId && <span className="cell-sub"> (אורחת)</span>}
                        <span className="cell-sub wh-cell-line">{userPlanLabel(db, buyer) || '—'}</span>
                        {buyer && buyer.phone && <span className="cell-sub wh-cell-line" dir="ltr">{buyer.phone}</span>}
                      </td>
                      <td>{pur.name} <span className="cell-sub" dir="ltr">{pur.serial}</span></td>
                      <td>{[a.street, a.houseNo, a.apt && `דירה ${a.apt}`, a.city].filter(Boolean).join(', ') || '—'}</td>
                      <td>₪{Math.round(pur.paid).toLocaleString()}</td>
                      <td>
                        <div className="btn-stack">
                          <button type="button" className="btn-mini" onClick={() => setShipLabels([purchaseShipLabel(db, pur)])}>מדבקת משלוח</button>
                          <button className="btn-mini strong" onClick={() => api.markPurchaseShipped(pur.id)}>נשלחה ✓</button>
                        </div>
                      </td>
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
          <div className="table-wrap wh-table-wrap">
            <table className="admin-table wh-table">
              <thead>
                <tr><th>מס׳ הזמנה</th><th>לקוחה</th><th>פריטים</th><th>סוג</th><th>תאריך</th><th>סטטוס</th><th>פעולות</th></tr>
              </thead>
              <tbody>
                {onTheWay.length === 0 && <tr><td colSpan="7" style={{ color: 'var(--muted)' }}>אין הזמנות שיצאו</td></tr>}
                {rowsOf(onTheWay)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {slipOrder && <Slip order={slipOrder} db={db} onClose={() => setSlipOrder(null)} />}
      {shipLabels && (
        <PrintLabels
          title={shipLabels.length > 1 ? `מדבקות משלוח (${shipLabels.length})` : 'מדבקת משלוח'}
          width={100}
          height={150}
          onClose={() => setShipLabels(null)}
        >
          {shipLabels.map((l) => <ShippingLabel key={l.id} {...l} />)}
        </PrintLabels>
      )}
    </div>
  )
}

// ===== מסך המחסן: אותה עמדה, שני מצבי עבודה =====
export default function Warehouse() {
  const { db, api } = useAdminDb()
  const location = useLocation()
  const fromPath = location.pathname.includes('returns') ? 'in' : 'out'
  const [tab, setTab] = useState(fromPath)
  useEffect(() => { setTab(fromPath) }, [fromPath])
  useEffect(() => { api.runReturnCheck() }, [])

  const waiting = db.orders.filter((o) => ['חדשה', 'בליקוט', 'ליקוט', 'נארזה', 'בקרה', 'אריזה'].includes(o.status)).length
  const openReturns = db.returns.filter((r) => r.status !== 'הושלמה').length
  const courierAlerts = db.returns.filter((r) => r.needsCourierInquiry && r.status !== 'הושלמה')

  return (
    <>
      <h1>ניהול הזמנות</h1>
      {courierAlerts.length > 0 && (
        <div className="warehouse-alert" role="alert">
          <h3>בירור אצל חברת המשלוחים</h3>
          <p>
            חלפו 5 ימים מאישור השליח להעברת ההזמנה, והמוצרים הקודמים עדיין לא הגיעו ונסרקו במחסן.
            יש לפתוח בירור מול חברת המשלוחים.
          </p>
          <ul>
            {courierAlerts.map((r) => {
              const u = db.users.find((x) => x.id === r.userId)
              const missing = r.items.filter((i) => !i.received).map((i) => i.serial).join(', ')
              return (
                <li key={r.id}>
                  <AdminUserCell db={db} user={u} name={r.userId} fallback={r.userId} />
                  {' · '}הזמנה <span dir="ltr">{r.orderId}</span>
                  {missing ? <> · חסרים: <span dir="ltr">{missing}</span></> : null}
                  <span className="alert-meta">אישור שליח: {r.courierConfirmedAt ? heDate(r.courierConfirmedAt) : '—'} · יעד סריקה: {heDate(r.deadline)}</span>
                </li>
              )
            })}
          </ul>
          <button type="button" className="btn btn-sm" style={{ marginTop: 14 }} onClick={() => setTab('in')}>
            מעבר להחזרות נכנסות
          </button>
        </div>
      )}
      <div className="subtabs">
        <button className={`subtab${tab === 'out' ? ' on' : ''}`} onClick={() => setTab('out')}>
          הזמנות יוצאות {waiting > 0 && <span className="subtab-badge">{waiting}</span>}
        </button>
        <button className={`subtab${tab === 'in' ? ' on' : ''}`} onClick={() => setTab('in')}>
          החזרות נכנסות {(courierAlerts.length || openReturns) > 0 && (
            <span className="subtab-badge">{courierAlerts.length || openReturns}</span>
          )}
        </button>
      </div>

      {tab === 'out' ? <Outgoing /> : <Returns embedded />}
    </>
  )
}
