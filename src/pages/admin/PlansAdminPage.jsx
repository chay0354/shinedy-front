import { useState } from 'react'
import { matchesPlanId, publicCatalogPlans, subscribePlanId } from '../../lib/plans.js'
import { useAdminDb } from '../../lib/useAdminDb.js'

export default function Subscriptions() {
  const { db, api } = useAdminDb()
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState('')
  const [drafts, setDrafts] = useState({})
  const plans = publicCatalogPlans(db.plans)

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
    setMsg(`${plan.latin} עודכן ✓ — המחיר והנקודות מתעדכנים מיד באתר ובהרשמה`)
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
              <div className="plan-name">{plan.latin}</div>
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
                {busyId === plan.id ? 'שומרת…' : 'שמירת מסלול'}
              </button>
            </article>
          )
        })}
      </div>

      <div className="admin-section" style={{ marginTop: 28 }}>
        <h2>תנאי המנוי (קבועים לכל המסלולים)</h2>
        <ul className="admin-terms">
          <li>החלפות ללא הגבלה</li>
          <li>משלוח דו-חודשי כלול · משלוח החלפה נוסף ₪65</li>
          <li>ביטול אחרי ניצול המשלוח — החזרה ₪65</li>
          <li>אין תקרת תכשיטים — הבחירה לפי נקודות בלבד</li>
        </ul>
      </div>
    </>
  )
}
