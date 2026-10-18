import { useMemo, useState } from 'react'
import { EXPENSE_CATEGORIES } from '../../lib/kpiSupport.js'
import { heDate, useAdminDb } from '../../lib/useAdminDb.js'
import { computeKpis, fmtMoney, periodRange } from '../../lib/kpi.js'

const money = (n) => fmtMoney(n) || '₪0'

function MobileTip({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`mobile-tip${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="info-tip-btn"
        aria-label="הסבר"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        i
      </button>
      <div className="mobile-tip-text">{children}</div>
    </div>
  )
}

function parseExpenseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return []
  const split = (line) => line.split(/[;,]/).map((c) => c.trim().replace(/^"|"$/g, ''))
  const first = split(lines[0]).map((c) => c.toLowerCase())
  const hasHeader = first.some((c) => /date|תאריך|amount|סכום|category|קטגוריה/.test(c))
  const body = hasHeader ? lines.slice(1) : lines
  return body.map((line) => {
    const [date, category, amount, note, recurring] = split(line)
    const known = EXPENSE_CATEGORIES.includes(category) ? category : 'אחר'
    const extra = known === 'אחר' && category && !EXPENSE_CATEGORIES.includes(category) ? category : ''
    return {
      date,
      category: known,
      amount,
      note: [extra, note].filter(Boolean).join(' · '),
      recurring: /^(1|true|yes|כן|חודשי)$/i.test(recurring || ''),
    }
  })
}

export default function Expenses() {
  const { db, api } = useAdminDb()
  const [msg, setMsg] = useState('')
  // אותו מנוע חישוב בדיוק שמזין את הדשבורד — כדי שהפירוט כאן יהיה זהה לדוחות
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
      : 'ההוצאה נרשמה כהוצאה חד-פעמית ✓ — המדדים בדשבורד מתעדכנים מיד')
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
      extraExchangeFee: Number(f.elements['exfee'].value),
    })
    setMsg('התעריפים עודכנו ✓')
  }

  return (
    <>
      <h1>כספים</h1>
      <MobileTip>
        <p className="admin-sub">
          כאן נרשמות ההוצאות בפועל והתעריפים המשתנים. מכאן נגזרים במדויק: עלות גיוס לקוחה (CAC),
          המרווח הגולמי, המרווח התפעולי והתזרים בדשבורד.
        </p>
      </MobileTip>

      {msg && <p className="msg-ok">{msg}</p>}

      <section className={`cash-forecast${k.cash.netCash < 0 ? ' neg' : ''}`} aria-label="סיכום חודשי">
        <div>
          <div className="cash-forecast-kicker">תזרים חודשי צפוי</div>
          <b>{k.cash.netCash >= 0 ? '+' : ''}{money(k.cash.netCash)}</b>
          <p>החודש הנוכחי. גבייה משוערת פחות הוצאות ועלויות משתנות.</p>
        </div>
        <div className="cash-forecast-split">
          <span>נכנס <b>{money(k.cash.cashIn)}</b></span>
          <span>יוצא <b>{money(k.cash.cashOut)}</b></span>
          <span>קבועות לחודש <b>{money(monthlyRecurring)}</b></span>
        </div>
      </section>

      <div className="admin-section">
        <h2>הנהלת חשבונות</h2>
        <p className="admin-sub">
          שומרים כאן קישור למערכת שבה מעלים קבלות, ומייבאים ממנה קובץ הוצאות כדי לא להקליד פעמיים.
          חיבור אוטומטי מלא תלוי במערכת החשבונות עצמה. עד אז הייבוא מעדכן את העמוד ואת הדשבורד מיד.
        </p>
        <form
          className="admin-form"
          onSubmit={(ev) => {
            ev.preventDefault()
            api.setAccounting(ev.target.elements.url.value)
            setMsg('הקישור להנהלת החשבונות נשמר')
          }}
        >
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>כתובת מערכת הנהלת החשבונות</label>
            <input name="url" type="url" dir="ltr" defaultValue={db.accountingUrl || ''} placeholder="https://" />
          </div>
          <div className="form-actions">
            <button className="btn btn-sm">שמירת קישור</button>
            {db.accountingUrl ? (
              <a className="btn btn-outline btn-sm" href={db.accountingUrl} target="_blank" rel="noreferrer">פתיחת המערכת</a>
            ) : null}
          </div>
        </form>
        <form
          className="admin-form"
          style={{ marginTop: 14 }}
          onSubmit={(ev) => {
            ev.preventDefault()
            const file = ev.target.elements.file.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              const rows = parseExpenseCsv(String(reader.result || ''))
              const n = api.importExpenses(rows)
              setMsg(n ? `יובאו ${n} הוצאות. הדשבורד עודכן.` : 'לא נמצאו שורות תקינות בקובץ')
              ev.target.reset()
            }
            reader.readAsText(file)
          }}
        >
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>ייבוא הוצאות מקובץ</label>
            <input name="file" type="file" accept=".csv,text/csv" required />
            <span className="cell-sub">עמודות: תאריך, קטגוריה, סכום, הערה, חודשי (כן/לא). קטגוריה לא מוכרת נשמרת כ״אחר״.</span>
          </div>
          <div className="form-actions"><button className="btn btn-outline btn-sm">ייבוא</button></div>
        </form>
      </div>

      {db.expenses.length === 0 && (
        <div className="empty-state">
          <h3>עדיין לא נרשמו הוצאות — ולכן "עלויות קבועות" בדשבורד מציג ‎—</h3>
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
          <button className="btn btn-sm" onClick={() => { api.loadSampleExpenses(); setMsg('נטענו הוצאות לדוגמה ✓ — הדשבורד מתעדכן מיד') }}>
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
        <div className="admin-head-row">
          <h2>תעריפי עלות משתנה, לפי אירוע</h2>
        </div>
        <MobileTip>
          <p className="admin-sub" style={{ marginTop: 0 }}>
            כל תעריף מוכפל במה שקרה בפועל: משלוח, אריזה וביטוח נספרים <b>לכל הזמנה</b> (הזמנה ראשונה או
            החלפה), ניקוי נספר <b>לכל פריט שחזר ונסרק במחסן</b>, וסליקה וקרדיטים הם <b>אחוז מההכנסה</b>.
            משלוח אחד כלול לכל לקוחה בחודשיים. על כל החלפה נוספת מעבר לו הלקוחה
            משלמת ₪{db.rates.extraExchangeFee}, והסכום נרשם כהכנסה מול עלות המשלוח.
          </p>
        </MobileTip>
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
          <div className="field"><label>דמי משלוח החלפה נוספת (₪)</label>
            <input name="exfee" type="number" min="0" step="1" defaultValue={db.rates.extraExchangeFee} />
            <span className="cell-sub">מה שהלקוחה משלמת על החלפה מעבר לכלולה בחלון הדו-חודשי — נספר כהכנסה</span></div>
          <div className="form-actions"><button className="btn btn-sm">שמירת תעריפים</button></div>
        </form>
      </div>

      <div className="admin-section">
        <h2>כך חושבו העלויות המשתנות החודש</h2>
        <MobileTip>
          <p className="admin-sub" style={{ marginTop: 0 }}>
            החישוב מתבצע על נתוני החודש הנוכחי ({cd.orders} הזמנות · {cd.returnedItems} פריטים שחזרו ·
            הכנסה {money(cd.revenue)}). אלה בדיוק אותם מספרים שמופיעים בדוח הרווח וההפסד.
          </p>
        </MobileTip>
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
            הוצאה <b>חודשית</b> נספרת אוטומטית בכל חודש מתאריך תחילתה — כך שהעלויות הקבועות בדשבורד
            תמיד מעודכנות בלי לרשום אותן מחדש. "הפסקה" עוצרת את הספירה מהחודש הנוכחי ואילך.
          </p>
        </div>
      </div>

      <div className="admin-section">
        <h2>יתרת מזומן פתיחה</h2>
        <p className="admin-sub" style={{ marginTop: -6 }}>
          כמה כסף יש בחשבון העסק היום. מכאן הדשבורד מחשב את היתרה הנוכחית ואת ה-Runway —
          לכמה חודשים מספיק הכסף בקצב ההוצאות הנוכחי.
        </p>
        <form
          onSubmit={(ev) => { ev.preventDefault(); api.setCashOpening(ev.target.elements['co'].value); setMsg('יתרת הפתיחה עודכנה ✓ — הדשבורד מציג עכשיו יתרה ו-Runway') }}
          style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}
        >
          <div className="field" style={{ marginBottom: 0 }}>
            <label>יתרה בבנק (₪)</label>
            <input name="co" type="number" dir="ltr" defaultValue={db.cashOpening ?? ''} placeholder="למשל 50000" />
          </div>
          <button className="btn btn-sm">שמירה</button>
        </form>
      </div>
    </>
  )
}
