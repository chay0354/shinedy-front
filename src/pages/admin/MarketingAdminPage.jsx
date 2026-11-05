import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api.js'
import { heDate } from '../../lib/useAdminDb.js'

const MAIL_EMPTY = { subject: '', body: '', email: true, sms: false }
const SMS_LINK_CHARS = 66

function sentLine(label, part) {
  if (!part) return ''
  const bits = [`${part.sent} נשלחו`]
  if (part.failed) bits.push(`${part.failed} נכשלו`)
  if (part.skipped) bits.push(`${part.skipped} בלי ${label === 'מייל' ? 'אימייל' : 'טלפון'}`)
  return `${label}: ${bits.join(' · ')}`
}

export default function MarketingAdminPage() {
  const [data, setData] = useState(null)
  const [loadErr, setLoadErr] = useState('')
  const [mail, setMail] = useState(MAIL_EMPTY)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [birthday, setBirthday] = useState('')
  const [birthdayBusy, setBirthdayBusy] = useState(false)
  const [birthdayMsg, setBirthdayMsg] = useState('')
  const [rowBusy, setRowBusy] = useState('')

  const load = useCallback(async () => {
    try {
      const next = await api.marketingOverview()
      setData(next)
      setBirthday((prev) => prev || next.birthdayText || '')
      setLoadErr('')
    } catch (e) {
      setLoadErr(e.message || 'טעינת רשימת הדיוור נכשלה')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const subscribed = data?.subscribed || []
  const unsubscribed = data?.unsubscribed || []
  const withEmail = subscribed.filter((r) => r.email).length
  const withPhone = subscribed.filter((r) => r.phone).length

  async function send(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    if (!mail.email && !mail.sms) {
      setErr('יש לבחור מייל, SMS או את שניהם')
      return
    }
    const targets = [mail.email ? `${withEmail} במייל` : '', mail.sms ? `${withPhone} ב-SMS` : '']
      .filter(Boolean)
      .join(' ו-')
    if (!window.confirm(`לשלוח את ההודעה ל-${targets}?`)) return
    setBusy(true)
    try {
      const res = await api.broadcastMarketing(mail)
      if (!res?.recipients) {
        setErr('אין נמענות ברשימת הדיוור')
        return
      }
      setMsg(
        [mail.email ? sentLine('מייל', res.email) : '', mail.sms ? sentLine('SMS', res.sms) : '']
          .filter(Boolean)
          .join(' | '),
      )
      setMail(MAIL_EMPTY)
    } catch (e2) {
      setErr(e2.message || 'שליחת הדיוור נכשלה')
    } finally {
      setBusy(false)
    }
  }

  async function toggle(row, optIn) {
    if (!optIn && !window.confirm(`להסיר את ${row.name || 'הלקוחה'} מרשימת הדיוור?`)) return
    if (optIn && !window.confirm('להחזיר לרשימה רק אם הלקוחה ביקשה זאת בעצמה. להמשיך?')) return
    setRowBusy(row.id)
    try {
      await api.setCustomerMarketing(row.id, optIn)
      await load()
    } catch (e) {
      setErr(e.message || 'העדכון נכשל')
    } finally {
      setRowBusy('')
    }
  }

  async function saveBirthday(e) {
    e.preventDefault()
    setBirthdayMsg('')
    setBirthdayBusy(true)
    try {
      const res = await api.saveBirthdayText(birthday)
      setBirthday(res.birthdayText)
      setBirthdayMsg('ההודעה נשמרה ✓')
    } catch (e2) {
      setBirthdayMsg(e2.message || 'השמירה נכשלה')
    } finally {
      setBirthdayBusy(false)
    }
  }

  const smsLength = mail.body.trim().length + SMS_LINK_CHARS

  return (
    <>
      <div className="admin-head-row">
        <h1>ניהול דיוור</h1>
      </div>
      <p className="admin-sub">
        {data
          ? `${subscribed.length} לקוחות ברשימת הדיוור · ${withEmail} עם אימייל · ${withPhone} עם טלפון · ${unsubscribed.length} הסירו את עצמן.`
          : 'טוען…'}
      </p>
      {loadErr && <p className="form-err">{loadErr}</p>}

      <div className="admin-section" style={{ marginTop: 0 }}>
        <h2>שליחת הודעה</h2>
        <form className="admin-form" onSubmit={send}>
          <div className="field">
            <label>לשלוח ב</label>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <label className="check-row" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={mail.email}
                  onChange={(e) => setMail((m) => ({ ...m, email: e.target.checked }))}
                />
                <span>מייל ({withEmail})</span>
              </label>
              <label className="check-row" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={mail.sms}
                  onChange={(e) => setMail((m) => ({ ...m, sms: e.target.checked }))}
                />
                <span>SMS ({withPhone})</span>
              </label>
            </div>
          </div>
          {mail.email && (
            <div className="field">
              <label htmlFor="mk-subject">נושא המייל</label>
              <input
                id="mk-subject"
                required
                value={mail.subject}
                onChange={(e) => setMail((m) => ({ ...m, subject: e.target.value }))}
                placeholder="למשל: קולקציה חדשה ב-Shinedy"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="mk-body">תוכן ההודעה</label>
            <textarea
              id="mk-body"
              required
              rows={7}
              value={mail.body}
              onChange={(e) => setMail((m) => ({ ...m, body: e.target.value }))}
              placeholder="כתבי כאן את העדכון…"
            />
            <span className="cell-sub">
              לכל הודעה מתווסף אוטומטית קישור אישי להסרה מהרשימה.
              {mail.sms ? ` אורך ה-SMS כולל הקישור: כ-${smsLength} תווים (${Math.max(1, Math.ceil(smsLength / 67))} הודעות).` : ''}
            </span>
          </div>
          {err && <p className="form-err">{err}</p>}
          {msg && <p className="msg-ok">{msg}</p>}
          <div className="form-actions">
            <button className="btn btn-sm" disabled={busy || subscribed.length === 0}>
              {busy ? 'שולחת…' : 'שליחה לרשימה'}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-section">
        <h2>הודעת יום הולדת</h2>
        <p className="admin-sub">
          נשלחת ב-SMS בתחילת חודש יום ההולדת, רק ללקוחות שברשימת הדיוור. קישור ההסרה מתווסף אוטומטית.
        </p>
        <form className="admin-form" onSubmit={saveBirthday}>
          <div className="field">
            <label htmlFor="mk-birthday">נוסח ההודעה</label>
            <textarea
              id="mk-birthday"
              rows={4}
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>
          {birthdayMsg && <p className="cell-sub">{birthdayMsg}</p>}
          <div className="form-actions" style={{ gap: 10 }}>
            <button className="btn btn-sm" disabled={birthdayBusy}>
              {birthdayBusy ? 'שומרת…' : 'שמירת ההודעה'}
            </button>
            {data?.birthdayDefault && birthday !== data.birthdayDefault && (
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setBirthday(data.birthdayDefault)}
              >
                חזרה לנוסח המקורי
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-section">
        <h2>ברשימת הדיוור</h2>
        <div className="table-wrap">
          <table className="admin-table cust-table">
            <thead>
              <tr>
                <th>לקוחה</th>
                <th>טלפון</th>
                <th>אימייל</th>
                <th>אישרה דיוור</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subscribed.length === 0 && (
                <tr><td colSpan="5" style={{ color: 'var(--muted)' }}>אין לקוחות ברשימה</td></tr>
              )}
              {subscribed.map((r) => (
                <tr key={r.id}>
                  <td><Link className="cust-link" to={`/admin/customers/${r.id}`}>{r.name || 'לקוחה'}</Link></td>
                  <td dir="ltr">{r.phone || '—'}</td>
                  <td dir="ltr">{r.email || '—'}</td>
                  <td>{r.optedInAt ? heDate(r.optedInAt) : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-mini danger"
                      disabled={rowBusy === r.id}
                      onClick={() => toggle(r, false)}
                    >
                      הסרה מהדיוור
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {unsubscribed.length > 0 && (
        <div className="admin-section">
          <h2>הוסרו מהדיוור</h2>
          <div className="table-wrap">
            <table className="admin-table cust-table">
              <thead>
                <tr>
                  <th>לקוחה</th>
                  <th>טלפון</th>
                  <th>אימייל</th>
                  <th>הוסרה</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {unsubscribed.map((r) => (
                  <tr key={r.id}>
                    <td><Link className="cust-link" to={`/admin/customers/${r.id}`}>{r.name || 'לקוחה'}</Link></td>
                    <td dir="ltr">{r.phone || '—'}</td>
                    <td dir="ltr">{r.email || '—'}</td>
                    <td>{heDate(r.optedOutAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-mini"
                        disabled={rowBusy === r.id}
                        onClick={() => toggle(r, true)}
                      >
                        החזרה לדיוור
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
