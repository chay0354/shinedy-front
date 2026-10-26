import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api as liveApi } from '../../api.js'
import { publicCatalogPlans } from '../../lib/plans.js'
import { activeItems, heDate, isActiveSubscriber, openReturnsFor, planOf, pointsUsed, useAdminDb } from '../../lib/useAdminDb.js'
import { useApp } from '../../state/AppContext'
import AdminUserCell from '../../components/AdminUserCell.jsx'

const EMPTY = { name: '', phone: '', email: '', planId: 'silver', password: '' }
const MAIL_EMPTY = { subject: '', body: '' }

export default function Customers() {
  const { db } = useAdminDb()
  const { run } = useApp()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [mailOpen, setMailOpen] = useState(false)
  const [mail, setMail] = useState(MAIL_EMPTY)
  const [mailBusy, setMailBusy] = useState(false)
  const [mailErr, setMailErr] = useState('')
  const [listCount, setListCount] = useState(null)
  const plans = publicCatalogPlans(db.plans)
  const active = db.users.filter((u) => isActiveSubscriber(u)).length
  const localOptIn = db.users.filter((u) => u.marketingOptIn && u.email).length
  const term = q.trim().toLowerCase()
  const list = term
    ? db.users.filter((u) => [u.name, u.phone, u.email].some((v) => (v || '').toLowerCase().includes(term)))
    : db.users

  useEffect(() => {
    if (!mailOpen) return undefined
    let cancelled = false
    liveApi
      .marketingRecipientCount()
      .then((data) => {
        if (!cancelled) setListCount(typeof data?.count === 'number' ? data.count : localOptIn)
      })
      .catch(() => {
        if (!cancelled) setListCount(localOptIn)
      })
    return () => {
      cancelled = true
    }
  }, [mailOpen, localOptIn])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function addCustomer(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    setBusy(true)
    const data = await run(() => liveApi.createCustomer(form))
    setBusy(false)
    if (!data) {
      setErr('הוספת הלקוחה נכשלה')
      return
    }
    setMsg(`${form.name} נוספה. אפשר להתחבר עם האימייל והסיסמה הזמנית.`)
    setForm(EMPTY)
    setOpen(false)
  }

  async function sendBroadcast(e) {
    e.preventDefault()
    setMailErr('')
    setMsg('')
    setMailBusy(true)
    try {
      const data = await liveApi.broadcastMarketing(mail)
      const sent = data?.sent ?? 0
      const failed = data?.failed ?? 0
      const total = data?.recipients ?? 0
      if (total === 0) {
        setMailErr('אין נמענות ברשימת הדיוור (לקוחות שאישרו דיוור שיווקי).')
      } else {
        setMsg(`נשלח ל-${sent} מתוך ${total}${failed ? ` · ${failed} נכשלו` : ''}`)
        setMail(MAIL_EMPTY)
        setMailOpen(false)
      }
    } catch (e) {
      setMailErr(e.message || 'שליחת הדיוור נכשלה')
    } finally {
      setMailBusy(false)
    }
  }

  return (
    <>
      <div className="admin-head-row">
        <h1>ניהול לקוחות</h1>
        <div className="admin-head-actions">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => {
              setMailOpen(true)
              setMailErr('')
              setErr('')
              setMsg('')
            }}
          >
            שליחת הודעה לרשימת התפוצה
          </button>
          <button type="button" className="btn btn-sm" onClick={() => { setOpen((v) => !v); setErr(''); setMsg('') }}>
            {open ? 'סגירה' : 'הוספת לקוחה'}
          </button>
        </div>
      </div>
      <p className="admin-sub">
        {db.users.length} חשבונות · {active} מנויות פעילות. לחיצה על השם פותחת את התיק המלא.
      </p>

      {msg && <p className="msg-ok">{msg}</p>}
      {err && <p className="form-err">{err}</p>}

      {open && (
        <form className="admin-form" onSubmit={addCustomer} style={{ marginBottom: 22 }}>
          <div className="field">
            <label>שם</label>
            <input required value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </div>
          <div className="field">
            <label>טלפון</label>
            <input required dir="ltr" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="0500000000" />
          </div>
          <div className="field">
            <label>אימייל</label>
            <input required type="email" dir="ltr" value={form.email} onChange={(e) => setField('email', e.target.value)} />
          </div>
          <div className="field">
            <label>מסלול</label>
            <select value={form.planId} onChange={(e) => setField('planId', e.target.value)}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.latin} · ₪{p.price}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>סיסמה זמנית</label>
            <input required minLength={6} dir="ltr" value={form.password} onChange={(e) => setField('password', e.target.value)} />
          </div>
          <div className="form-actions">
            <button className="btn btn-sm" disabled={busy}>{busy ? 'שומרת…' : 'שמירת לקוחה'}</button>
          </div>
        </form>
      )}

      {mailOpen && (
        <div className="modal-overlay" role="presentation" onClick={() => !mailBusy && setMailOpen(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="modal-x" aria-label="סגירה" onClick={() => !mailBusy && setMailOpen(false)}>
              ×
            </button>
            <h2 id="mail-title">שליחת הודעה לרשימת התפוצה</h2>
            <p className="modal-sub">
              המייל יישלח רק ללקוחות שאישרו דיוור שיווקי
              {listCount != null ? ` · ${listCount} נמענות` : ''}.
            </p>
            <form onSubmit={sendBroadcast}>
              <div className="field">
                <label htmlFor="mail-subject">נושא</label>
                <input
                  id="mail-subject"
                  required
                  value={mail.subject}
                  onChange={(e) => setMail((m) => ({ ...m, subject: e.target.value }))}
                  placeholder="למשל: קולקציה חדשה ב-Shinedy"
                />
              </div>
              <div className="field">
                <label htmlFor="mail-body">תוכן ההודעה</label>
                <textarea
                  id="mail-body"
                  required
                  rows={8}
                  value={mail.body}
                  onChange={(e) => setMail((m) => ({ ...m, body: e.target.value }))}
                  placeholder="כתבי כאן את העדכון…"
                />
              </div>
              {mailErr && <p className="form-err">{mailErr}</p>}
              <div className="form-actions" style={{ marginTop: 16, gap: 10 }}>
                <button type="submit" className="btn btn-sm" disabled={mailBusy || listCount === 0}>
                  {mailBusy ? 'שולחת…' : 'שליחה לרשימה'}
                </button>
                <button type="button" className="btn btn-sm btn-outline" disabled={mailBusy} onClick={() => setMailOpen(false)}>
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-section">
        <div className="admin-head-row">
          <input
            className="select admin-search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="חיפוש לפי שם, טלפון או אימייל"
          />
          <span className="cell-sub">{list.length} מתוך {db.users.length}</span>
        </div>
        <div className="table-wrap">
          <table className="admin-table cust-table">
            <thead>
              <tr>
                <th>לקוחה</th>
                <th>מסלול</th>
                <th>אצלה</th>
                <th>מצב</th>
                <th>הצטרפה</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan="6" style={{ color: 'var(--muted)' }}>לא נמצאו לקוחות</td></tr>}
              {list.map((u) => {
                const plan = planOf(db, u)
                const openRet = openReturnsFor(db, u.id).length
                const items = activeItems(db, u.id).length
                return (
                  <tr key={u.id}>
                    <td>
                      <AdminUserCell db={db} user={u} details={false} />
                      {u.phone && <span className="cell-sub wh-cell-line" dir="ltr">{u.phone}</span>}
                      {u.email && <span className="cell-sub wh-cell-line" dir="ltr">{u.email}</span>}
                    </td>
                    <td>
                      <b>{plan.latin}</b>
                      <span className="cell-sub">₪{plan.price} · {pointsUsed(db, u.id)}/{plan.points} נק׳</span>
                    </td>
                    <td>
                      {items} תכשיטים
                      <span className="cell-sub">
                        {openRet > 0 ? <span className="pill warn">{openRet} החזרות</span> : 'בלי החזרה פתוחה'}
                      </span>
                    </td>
                    <td>
                      {u.canceledAt
                        ? <span className="pill warn">עזבה {heDate(u.canceledAt)}</span>
                        : u.suspendedAt
                          ? <span className="pill info">מושהה</span>
                          : <span className="pill ok">פעילה</span>}
                      <span className="cell-sub">{u.exchangeBlocked ? 'החלפות חסומות' : 'החלפות זמינות'}</span>
                    </td>
                    <td>{u.joined}</td>
                    <td><Link className="btn-mini" to={`/admin/customers/${u.id}`}>תיק</Link></td>
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
