import { useEffect, useRef, useState } from 'react'
import { api as liveApi } from '../../api.js'
import { matchesPlanId, planShowcase, publicCatalogPlans, subscribePlanId } from '../../lib/plans.js'
import { useAdminDb } from '../../lib/useAdminDb.js'
import { useApp } from '../../state/AppContext'

export default function Subscriptions() {
  const { db, api } = useAdminDb()
  const { run } = useApp()
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState('')
  const [drafts, setDrafts] = useState({})
  const [termsText, setTermsText] = useState('')
  const termsSeeded = useRef(false)
  const plans = publicCatalogPlans(db.plans)
  const savedTerms = (db.membershipTerms || []).filter(Boolean)

  useEffect(() => {
    if (termsSeeded.current || !savedTerms.length) return
    termsSeeded.current = true
    setTermsText(savedTerms.join('\n'))
  }, [savedTerms])

  function draftOf(plan) {
    return drafts[plan.id] || { price: plan.price, points: plan.points }
  }

  function setDraft(planId, field, value) {
    setDrafts((prev) => {
      const plan = plans.find((p) => p.id === planId)
      const base = prev[planId] || { price: plan?.price, points: plan?.points }
      return { ...prev, [planId]: { ...base, [field]: value } }
    })
  }

  async function save(plan) {
    setErr('')
    setMsg('')
    const d = draftOf(plan)
    const price = Number(d.price)
    const points = Number(d.points)
    if (!Number.isFinite(price) || price < 1) {
      setErr('יש להזין מחיר חודשי תקין')
      return
    }
    if (!Number.isFinite(points) || points < 10) {
      setErr('יש להזין מספר נקודות תקין')
      return
    }
    setBusyId(plan.id)
    const liveId = subscribePlanId(plan.id, db.plans)
    const ok = await api.updatePlan(liveId, { price, points })
    setBusyId('')
    if (ok === false) {
      setErr('השמירה נכשלה — נסי שוב')
      return
    }
    setMsg(`${planShowcase(plan)} עודכן ✓ — המחיר והנקודות מתעדכנים מיד באתר ובהרשמה`)
  }

  return (
    <>
      <h1>ניהול מסלולים</h1>
      <p className="admin-sub">
        עריכת המחיר והנקודות של כל מסלול. השינוי מתעדכן מיד בעמוד המסלולים, בהרשמה ובחישוב הנקודות.
      </p>

      {msg && <p className="msg-ok">{msg}</p>}
      {err && <p className="form-err">{err}</p>}

      <div className="admin-plans-grid">
        {plans.map((plan) => {
          const d = draftOf(plan)
          const count = (db.users || []).filter((u) => matchesPlanId(u.plan, plan.id) && !u.canceledAt).length
          return (
            <article key={plan.id} className={`admin-plan-card${plan.featured ? ' featured' : ''}`}>
              {plan.featured ? <div className="flag">הכי פופולרי</div> : null}
              <div className="plan-name">{planShowcase(plan)}</div>
              <div className="admin-plan-he">{plan.name}</div>
              <p className="materials">{plan.materials}</p>
              <div className="admin-plan-count">
                <b>{count}</b>
                <span>מנויות פעילות</span>
              </div>
              <div className="admin-plan-fields">
                <label>
                  מחיר לחודש (₪)
                  <input
                    className="num-input"
                    type="number"
                    min="1"
                    dir="ltr"
                    value={d.price}
                    onChange={(e) => setDraft(plan.id, 'price', e.target.value)}
                  />
                </label>
                <label>
                  נקודות בחודש
                  <input
                    className="num-input"
                    type="number"
                    min="10"
                    dir="ltr"
                    value={d.points}
                    onChange={(e) => setDraft(plan.id, 'points', e.target.value)}
                  />
                </label>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                disabled={busyId === plan.id}
                onClick={() => save(plan)}
              >
                {busyId === plan.id ? 'שומר…' : 'שמירת מסלול'}
              </button>
            </article>
          )
        })}
      </div>

      <div className="admin-section" style={{ marginTop: 28 }}>
        <h2>תנאי המנוי (קבועים לכל המסלולים)</h2>
        <p className="admin-sub">שורה אחת לכל תנאי. השמירה מתעדכנת גם בעמוד המסלולים ללקוחות.</p>
        <textarea
          className="terms-editor"
          rows={6}
          value={termsText}
          onChange={(e) => setTermsText(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-sm"
          style={{ display: 'block', marginTop: 12 }}
          onClick={async () => {
            setErr('')
            setMsg('')
            const terms = termsText.split('\n').map((x) => x.trim()).filter(Boolean)
            const data = await run(() => liveApi.updateMembershipTerms(terms))
            if (!data) {
              setErr('שמירת התנאים נכשלה')
              return
            }
            setMsg('תנאי המנוי עודכנו')
          }}
        >
          שמירת תנאי המנוי
        </button>
      </div>
    </>
  )
}
