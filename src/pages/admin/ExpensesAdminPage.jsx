import { useMemo, useState } from 'react'
import { useApp } from '../../state/AppContext'
import { buildDbFromState, adminApiFromState } from '../../lib/dbFromState'
import { EXPENSE_CATEGORIES } from '../../lib/kpiSupport.js'
import { heDate } from '../../lib/accountHelpers.js'
import { computeKpis, fmtMoney, periodRange } from '../../lib/kpi.js'

const money = (n) => fmtMoney(n) || '₪0'

export default function ExpensesAdminPage() {
  const { state } = useApp()
  const [, bump] = useState(0)
  const db = useMemo(() => buildDbFromState(state), [state, bump])
  const api = useMemo(() => adminApiFromState(state, () => bump((n) => n + 1)), [state])
  const [msg, setMsg] = useState('')
  // אותו מנוע חישוב בדיוק שמזין את לוח הבקרה — כדי שהפירוט כאן יהיה זהה לדוחות
  const k = useMemo(() => computeKpis(db, periodRange('this-month'), {}), [db])
  const cd = k.costDrivers
  const cb = k.profitability.costBreakdown
  const r = db.rates

  const monthlyRecurring = db.expenses
    .filter((e) => e.recurring && !e.endDate)
    .reduce((s, e) => s + e.amount, 0)
  const oneTime = db.expenses.filter((e) => !e.recurring).reduce((s, e) => s + e.amount, 0)
  const byCat = EXPENSE_CATEGORIES.map((c) => ({
    c, sum: db.expenses.filter((e) => e.category === c && e.recurring && !e.endDate).reduce((s, e) => s + e.amount, 0),
  })).filter((x) => x.sum > 0)

  function addExp(e) {
    e.preventDefault()
    const f = e.target
    const recurring = f.elements['r'].checked
    api.addExpense({
      date: f.elements['d'].value,
      category: f.elements['c'].value,
      amount: Number(f.elements['a'].value),
      note: f.elements['n'].value,
      recurring,
    })
    f.reset()
    setMsg(recurring
      ? 'ההוצאה נרשמה כהוצאה חודשית מתחדשת ✓ — תיספר בכל חודש עד שתופסק'
      : 'ההוצאה נרשמה כהוצאה חד-פעמית ✓ — המדדים בלוח הבקרה מתעדכנים מיד')
  }

  function saveRates(e) {
    e.preventDefault()
    const f = e.target
    api.setRates({
      shippingPerOrder: Number(f.elements['ship'].value),
      packagingPerOrder: Number(f.elements['pack'].value),
      shipInsurancePerOrder: Number(f.elements['ins'].value),
      cleaningPerItem: Number(f.elements['clean'].value),
      paymentPct: Number(f.elements['pay'].value),
      creditPct: Number(f.elements['credit'].value),
    })
    setMsg('התעריפים עודכנו ✓')
  }

  return (
    <>
      <h1>הוצאות ותעריפים</h1>
      <p className="admin-sub">
        כאן נרשמות ההוצאות בפועל והתעריפים המשתנים. מכאן נגזרים במדויק: עלות גיוס לקוחה (CAC),
        המרווח הגולמי, המרווח התרומתי והתזרים בלוח הבקרה.
      </p>

      {msg && <p className="msg-ok">{msg}</p>}

      {db.expenses.length === 0 && (
        <div className="empty-state">
          <h3>עדיין לא נרשמו הוצאות — ולכן "עלויות קבועות" בלוח הבקרה מציג ‎—</h3>
          <p>
            כרטיס <b>עלויות קבועות</b>, <b>המרווח התפעולי</b>, <b>נקודת האיזון</b> ו-<b>CAC</b> מחושבים
            מההוצאות שנרשמות כאן. המערכת לא ממציאה מספרים, ולכן כל עוד אין רישומים היא מציגה "אין מספיק נתונים".
          </p>
          <p><b>מה כדאי לרשום כדי שהלוח יתמלא:</b></p>
          <ul className="empty-list">
            <li><b>שכר</b> — משכורות עובדים</li>
            <li><b>מחסן</b> — שכירות ותפעול</li>
            <li><b>תוכנה</b> — מנויים ומערכות</li>
            <li><b>ביטוח</b> — ביטוח תכשיטים ועסק</li>
            <li><b>מיסים</b> — תשלומי חובה</li>
            <li><b>שיווק ופרסום</b> — לחישוב עלות גיוס לקוחה</li>
            <li><b>רכש תכשיטים</b> — השקעה במלאי (מוצג בנפרד מהרווח התפעולי)</li>
          </ul>
          <p className="cell-sub">
            רוצה לראות איך זה נראה מלא לפני שאת מזינה נתונים אמיתיים? אפשר לטעון מערך הוצאות
            לדוגמה בלחיצה אחת — ולמחוק אותו אחר כך.
          </p>
          <button className="btn btn-sm" onClick={() => { api.loadSampleExpenses(); setMsg('נטענו הוצאות לדוגמה ✓ — לוח הבקרה מתעדכן מיד') }}>
            טעינת הוצאות לדוגמה
          </button>
        </div>
      )}

      <div className="admin-section">
        <h2>רישום הוצאה</h2>
        <form className="admin-form" onSubmit={addExp}>
          <div className="field"><label>תאריך</label><input name="d" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          <div className="field"><label>קטגוריה</label>
            <select name="c" required>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="field"><label>סכום (₪)</label><input name="a" type="number" min="0" step="1" required /></div>
          <div className="field"><label>הערה</label><input name="n" placeholder="למשל: קמפיין אינסטגרם" /></div>
          <label className="check-row" style={{ alignSelf: 'end', marginBottom: 0 }}>
            <input name="r" type="checkbox" defaultChecked />
            <span><b>מתחדשת כל חודש</b> — תיספר אוטומטית בכל חודש (שכר, מחסן, תוכנה, ביטוח). בטלי לרישום חד-פעמי.</span>
          </label>
          <div className="form-actions"><button className="btn btn-sm">הוספה</button></div>
        </form>
      </div>

      <div className="admin-section">
        <h2>תעריפי עלות משתנה — לפי אירוע, לא לפי מנוי</h2>
        <p className="admin-sub" style={{ marginTop: -4 }}>
          כל תעריף מוכפל במה שקרה בפועל: משלוח, אריזה וביטוח נספרים <b>לכל הזמנה</b> (הזמנה ראשונה או
          החלפה), ניקוי נספר <b>לכל פריט שחזר ונסרק במחסן</b>, וסליקה וקרדיטים הם <b>אחוז מההכנסה</b>.
          לכן לקוחה שמחליפה שלוש פעמים בחודש עולה פי שלושה במשלוחים מלקוחה שלא החליפה — ובדיוק בגלל זה
          לא מדובר בעלות אחידה למנויה.
        </p>
        <form className="admin-form" onSubmit={saveRates}>
          <div className="field"><label>משלוח הלוך-חזור להזמנה (₪)</label>
            <input name="ship" type="number" min="0" step="1" defaultValue={db.rates.shippingPerOrder} /></div>
          <div className="field"><label>אריזה ונרתיק להזמנה (₪)</label>
            <input name="pack" type="number" min="0" step="1" defaultValue={db.rates.packagingPerOrder} /></div>
          <div className="field"><label>ביטוח משלוח להזמנה (₪)</label>
            <input name="ins" type="number" min="0" step="1" defaultValue={db.rates.shipInsurancePerOrder} /></div>
          <div className="field"><label>ניקוי ליחידה שחזרה (₪)</label>
            <input name="clean" type="number" min="0" step="1" defaultValue={db.rates.cleaningPerItem} /></div>
          <div className="field"><label>עמלת סליקה (%)</label>
            <input name="pay" type="number" min="0" step="0.1" defaultValue={db.rates.paymentPct} /></div>
          <div className="field"><label>קרדיט ללקוחה (% מהמנוי)</label>
            <input name="credit" type="number" min="0" max="100" step="0.5" defaultValue={db.rates.creditPct} />
            <span className="cell-sub">נצבר ללקוחה כל חודש ומוצג באזור האישי</span></div>
          <div className="form-actions"><button className="btn btn-sm">שמירת תעריפים</button></div>
        </form>
      </div>

      <div className="admin-section">
        <h2>כך חושבו העלויות המשתנות החודש</h2>
        <p className="admin-sub" style={{ marginTop: -4 }}>
          החישוב מתבצע על נתוני החודש הנוכחי ({cd.orders} הזמנות · {cd.returnedItems} פריטים שחזרו ·
          הכנסה {money(cd.revenue)}). <b>אלה בדיוק אותם מספרים</b> שמופיעים בדוח הרווח וההפסד בלוח הבקרה.
        </p>
        <div className="table-wrap">
          <table className="admin-table calc-table">
            <thead><tr><th>רכיב</th><th>מוכפל ב־</th><th>כמות בחודש</th><th>תעריף</th><th>עלות</th></tr></thead>
            <tbody>
              <tr>
                <td>משלוח הלוך-חזור</td><td>הזמנה</td><td>{cd.orders}</td>
                <td>{money(r.shippingPerOrder)}</td><td className="num">{money(cb.shipping)}</td>
              </tr>
              <tr>
                <td>אריזה ונרתיק</td><td>הזמנה</td><td>{cd.orders}</td>
                <td>{money(r.packagingPerOrder)}</td><td className="num">{money(cb.packaging)}</td>
              </tr>
              <tr>
                <td>ביטוח משלוח</td><td>הזמנה</td><td>{cd.orders}</td>
                <td>{money(r.shipInsurancePerOrder)}</td><td className="num">{money(cb.insurance)}</td>
              </tr>
              <tr>
                <td>ניקוי וחיטוי</td><td>פריט שחזר ונסרק</td><td>{cd.returnedItems}</td>
                <td>{money(r.cleaningPerItem)}</td><td className="num">{money(cb.cleaning)}</td>
              </tr>
              <tr>
                <td>עמלת סליקה</td><td>הכנסה</td><td>{money(cd.revenue)}</td>
                <td>{r.paymentPct}%</td><td className="num">{money(cb.fees)}</td>
              </tr>
              <tr>
                <td>קרדיטים ללקוחות</td><td>הכנסה</td><td>{money(cd.revenue)}</td>
                <td>{r.creditPct}%</td><td className="num">{money(cb.credits)}</td>
              </tr>
              <tr className="total">
                <td>סה״כ עלויות משתנות</td><td colSpan="3"></td>
                <td className="num">{money(k.profitability.variableCosts)}</td>
              </tr>
              <tr>
                <td className="cell-sub">ממוצע למנויה פעילה (לצורך השוואה בלבד)</td>
                <td colSpan="3" className="cell-sub">
                  {money(k.profitability.variableCosts)} ÷ {cd.avgActive.toFixed(1)} מנויות
                </td>
                <td className="num cell-sub">
                  {cd.avgActive > 0 ? money(k.profitability.variableCosts / cd.avgActive) : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="cell-sub" style={{ marginTop: 10 }}>
          מכאן זה זורם לדוחות: סה״כ העלויות המשתנות מנוכה מההכנסה ונותן את <b>הרווח הגולמי</b>; ממנו
          מנוכות העלויות הקבועות והשיווק ומתקבל <b>הרווח התפעולי</b>. אותו חישוב מתבצע בנפרד לכל מסלול
          (בדוח "רווחיות לפי מסלול") ולכל לקוחה (בדוח "רווחיות לפי לקוחה") — שם רואים את העלות האמיתית
          של כל לקוחה לפי מספר ההחלפות שלה בפועל.
        </p>
      </div>

      <div className="admin-section">
        <div className="admin-head-row">
          <h2>הוצאות שנרשמו</h2>
          <span className="cell-sub">
            {money(monthlyRecurring)} לחודש (מתחדשות) · {money(oneTime)} חד-פעמיות · {db.expenses.length} רשומות
          </span>
        </div>
        <div className="chips-row">
          {byCat.map((x) => <span className="chip static" key={x.c}>{x.c}: <b>{money(x.sum)}</b> לחודש</span>)}
        </div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>מס׳</th><th>תאריך</th><th>קטגוריה</th><th>סכום</th><th>סוג</th><th>הערה</th><th></th></tr></thead>
            <tbody>
              {db.expenses.length === 0 && <tr><td colSpan="7" style={{ color: 'var(--muted)' }}>לא נרשמו הוצאות</td></tr>}
              {db.expenses.slice(0, 40).map((e) => (
                <tr key={e.id}>
                  <td dir="ltr">{e.id}</td>
                  <td>{heDate(e.date)}{e.recurring && <span className="cell-sub"> החל מ־</span>}</td>
                  <td>{e.category}</td>
                  <td className="num">{money(e.amount)}{e.recurring && <span className="cell-sub"> לחודש</span>}</td>
                  <td>
                    {e.recurring
                      ? (e.endDate
                        ? <span className="pill warn">הופסקה {heDate(e.endDate)}</span>
                        : <span className="pill ok">חודשית ↻</span>)
                      : <span className="cell-sub">חד-פעמית</span>}
                  </td>
                  <td className="cell-sub">{e.note}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {e.recurring && !e.endDate && <button className="btn-mini" onClick={() => api.stopRecurring(e.id)}>הפסקה</button>}
                    {e.recurring && e.endDate && <button className="btn-mini" onClick={() => api.resumeRecurring(e.id)}>חידוש</button>}{' '}
                    <button className="btn-mini" onClick={() => api.deleteExpense(e.id)}>מחיקה</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="cell-sub" style={{ marginTop: 10 }}>
            הוצאה <b>חודשית</b> נספרת אוטומטית בכל חודש מתאריך תחילתה — כך שהעלויות הקבועות בלוח הבקרה
            תמיד מעודכנות בלי לרשום אותן מחדש. "הפסקה" עוצרת את הספירה מהחודש הנוכחי ואילך.
          </p>
        </div>
      </div>

      <div className="admin-section" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'end' }}>
        <form onSubmit={(ev) => { ev.preventDefault(); const v = ev.target.elements['np'].value.trim(); if (v.length >= 6) { api.setAdminPass(v); ev.target.reset(); setMsg('סיסמת הניהול עודכנה ✓') } }} style={{ display: 'flex', gap: 10, alignItems: 'end' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>שינוי סיסמת ניהול (6+ תווים)</label>
            <input name="np" type="password" dir="ltr" placeholder="סיסמה חדשה" />
          </div>
          <button className="btn btn-sm">עדכון</button>
        </form>
        <button className="btn btn-outline btn-sm" onClick={() => { if (confirm('לאפס את כל הנתונים לנתוני הדמו ההתחלתיים?')) { api.resetDemo(); setMsg('הנתונים אופסו ✓') } }}>
          איפוס לנתוני דמו
        </button>
      </div>
    </>
  )
}

