import { useMemo, useState } from 'react'
import { heDate, useAdminDb } from '../../lib/useAdminDb.js'
import { PERIODS, computeKpis, fmtMoney, fmtNum, fmtPct, periodRange } from '../../lib/kpi.js'

const money = (n) => fmtMoney(n) || '—'
const pct = (n) => fmtPct(n) || '—'

function Row({ label, value, strong, neg }) {
  return (
    <tr className={strong ? 'total' : ''}>
      <td>{label}</td>
      <td className={`num ${neg ? 'neg' : ''}`}>{value}</td>
    </tr>
  )
}

// דוח מלא להדפסה / PDF — כל המדדים במסמך אחד, מאותו מנוע חישוב של לוח הבקרה
export default function Reports() {
  const { db } = useAdminDb()
  const [period, setPeriod] = useState('this-month')
  const range = useMemo(() => periodRange(period), [period])
  const k = useMemo(() => computeKpis(db, range, {}), [db, range])
  const s = k.subscriptions, p = k.profitability, inv = k.inventory, ops = k.operations, cash = k.cash
  const label = `${range.start.toLocaleDateString('he-IL')} – ${range.end.toLocaleDateString('he-IL')}`

  return (
    <div className="report-area">
      <div className="admin-head-row no-print">
        <h1>דוח עסקי מלא</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.filter((x) => x.id !== 'custom').map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
          <button className="btn btn-sm" onClick={() => window.print()}>הפקת דוח (הדפסה / PDF)</button>
        </div>
      </div>
      <p className="admin-sub">
        Shinedy · דוח לתקופה {label} · הופק ב-{new Date().toLocaleDateString('he-IL')} ·
        כל הנתונים מחושבים חיים מהמערכת
      </p>

      {/* ===== 1. מנויים ===== */}
      <div className="admin-section">
        <h2>1. מנויים</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <tbody>
              <Row label="מנויות פעילות בסוף התקופה" value={s.activeEnd} />
              <Row label="מנויות חדשות בתקופה" value={s.newSubs} />
              <Row label="מנויות שעזבו" value={s.churned} />
              <Row label="שיעור נטישה חודשי" value={s.churnRate !== null ? pct(s.churnRate) : `— (אחוז יוצג מ-30 מנויות; עזבו ${s.churned})`} />
              <Row label="הכנסה ממוצעת למנויה (ARPU)" value={money(s.arpu)} />
              <Row label="מספר ממוצע של מנויות פעילות" value={fmtNum(s.avgActive)} />
            </tbody>
          </table>
        </div>
        <h3 className="rep-h3">תנועה חודשית</h3>
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>חודש</th><th>פעילות</th><th>הצטרפו</th><th>עזבו</th><th>שינוי נטו</th></tr></thead>
            <tbody>
              {s.movement.map((m) => (
                <tr key={m.label}>
                  <td>{m.label}</td><td>{m.active}</td><td>{m.joined}</td><td>{m.left}</td>
                  <td className={m.joined - m.left >= 0 ? 'pos' : 'neg'}>{m.joined - m.left >= 0 ? '+' : ''}{m.joined - m.left}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 2. רווח והפסד ===== */}
      <div className="admin-section">
        <h2>2. רווח והפסד — רווח גולמי ורווח תפעולי</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <tbody>
              <Row label="הכנסות ממנויים" value={money(p.revenue)} />
              {p.purchaseRevenue > 0 && <Row label="הכנסות מרכישות תכשיטים" value={money(p.purchaseRevenue)} />}
              {p.exchangeFeeIncome > 0 && <Row label={`דמי משלוח החלפות נוספות (₪${db.rates.extraExchangeFee})`} value={money(p.exchangeFeeIncome)} />}
              <Row label="סה״כ הכנסות" value={money(p.totalRevenue)} strong />
              <tr><td colSpan="2" className="cell-sub" style={{ paddingTop: 12 }}>עלויות משתנות</td></tr>
              <Row label="משלוחים" value={`−${money(p.costBreakdown.shipping)}`} neg />
              <Row label="אריזה ונרתיקים" value={`−${money(p.costBreakdown.packaging)}`} neg />
              <Row label="ביטוח משלוחים" value={`−${money(p.costBreakdown.insurance)}`} neg />
              <Row label="ניקוי וחיטוי" value={`−${money(p.costBreakdown.cleaning)}`} neg />
              <Row label="עמלות סליקה" value={`−${money(p.costBreakdown.fees)}`} neg />
              <Row label={`קרדיטים ללקוחות (${db.rates.creditPct}% מהמנוי)`} value={`−${money(p.costBreakdown.credits)}`} neg />
              <Row label={`רווח גולמי · ${pct(p.grossMarginPct)}`} value={money(p.grossProfit)} strong />
              <tr><td colSpan="2" className="cell-sub" style={{ paddingTop: 12 }}>הוצאות קבועות ושיווק</td></tr>
              {p.fixedByCategory.map((f) => (
                <Row key={f.category} label={f.category} value={`−${money(f.amount)}`} neg />
              ))}
              {p.fixedByCategory.length === 0 && <Row label="לא נרשמו עלויות קבועות" value="—" />}
              <Row label="שיווק ופרסום" value={`−${money(p.marketing)}`} neg />
              {p.otherExpenses > 0 && <Row label="הוצאות אחרות" value={`−${money(p.otherExpenses)}`} neg />}
              <Row label={`רווח תפעולי · ${pct(p.operatingMarginPct)}`} value={money(p.operatingProfit)} strong neg={p.operatingProfit < 0} />
              {p.capex > 0 && <Row label="רכש תכשיטים (השקעה במלאי — מחוץ לרווח התפעולי)" value={money(p.capex)} />}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 3. מדדי רווחיות ===== */}
      <div className="admin-section">
        <h2>3. מדדי רווחיות</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <tbody>
              <Row label="מרווח גולמי" value={pct(p.grossMarginPct)} />
              <Row label="מרווח תפעולי" value={pct(p.operatingMarginPct)} />
              <Row label="עלות גיוס לקוחה (CAC)" value={money(p.cac)} />
              <Row label="ערך חיי לקוחה (LTV)" value={money(p.ltv)} />
              <Row label="יחס LTV ל-CAC" value={p.ltv && p.cac ? fmtNum(p.ltv / p.cac) + 'x' : '—'} />
              {p.fixedAllocationReliable
                ? <Row label="רווח תפעולי ממוצע ללקוחה" value={money(p.avgCustomerOperating)} />
                : <Row label="רווח גולמי (תרומה) ממוצע ללקוחה" value={money(p.avgCustomerContribution)} />}
              <Row label="עלויות קבועות בתקופה" value={money(p.fixedCosts)} />
              <Row label="עלויות קבועות לחודש" value={money(p.fixedMonthly)} />
              <Row label="נקודת איזון (מנויות דרושות)" value={p.breakEvenSubs || '—'} />
              <Row label="התחייבות קרדיטים ללקוחות" value={money(p.creditLiability)} />
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 4. רווחיות לפי מסלול ===== */}
      <div className="admin-section">
        <h2>4. רווחיות לפי מסלול</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>מסלול</th><th>מנויות</th><th>הכנסה</th><th>עלויות משתנות</th><th>רווח גולמי</th>
                {p.fixedAllocationReliable && <><th>חלק בקבועות</th><th>רווח תפעולי</th></>}
                <th>מרווח</th>
              </tr>
            </thead>
            <tbody>
              {p.byPlan.map((r) => (
                <tr key={r.id}>
                  <td><b>{r.name}</b> · ₪{r.price}</td>
                  <td>{r.subscribers}</td>
                  <td className="num">{money(r.revenue)}</td>
                  <td className="num neg">{money(r.variableCosts)}</td>
                  <td className={`num ${r.contribution < 0 ? 'neg' : 'pos'}`}>{money(r.contribution)}</td>
                  {p.fixedAllocationReliable && <>
                    <td className="num neg">{money(r.fixedShare)}</td>
                    <td className={`num ${r.operating < 0 ? 'neg' : 'pos'}`}>{money(r.operating)}</td>
                  </>}
                  <td>{pct(p.fixedAllocationReliable ? r.operatingMarginPct : r.marginPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!p.fixedAllocationReliable && (
          <p className="cell-sub">
            מוצג רווח גולמי (תרומה) בלבד: הקצאת עלויות קבועות בין מסלולים אמינה רק מ-50 מנויות ומעלה —
            מתחת לזה כל מסלול "סופג" חלק ענק מהקבועות ונראה מפסיד בטעות.
          </p>
        )}
      </div>

      {/* ===== 5. רווחיות לפי לקוחה ===== */}
      <div className="admin-section">
        <h2>5. רווחיות לפי לקוחה</h2>
        <p className="cell-sub" style={{ marginBottom: 8 }}>
          ממוינות מהנמוכה לגבוהה — מי ששוחקת את הרווח מופיעה ראשונה. "הכנסה" כוללת דמי החלפות נוספות ששולמו.
        </p>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>לקוחה</th><th>מסלול</th><th>הכנסה</th><th>משלוחים</th><th>אריזה</th><th>ביטוח</th><th>ניקוי</th><th>סליקה</th><th>קרדיטים</th><th>החלפות</th><th>רווח גולמי</th>
                {p.fixedAllocationReliable && <><th>חלק בקבועות</th><th>רווח תפעולי</th></>}
              </tr>
            </thead>
            <tbody>
              {p.byCustomer.length === 0 && <tr><td colSpan="13" style={{ color: 'var(--muted)' }}>אין נתוני לקוחות בתקופה</td></tr>}
              {[...p.byCustomer].sort((a, b) => a.contribution - b.contribution).map((c) => (
                <tr key={c.id}>
                  <td>{c.name}{!c.active && <span className="cell-sub"> (עזבה)</span>}</td>
                  <td>{c.plan}</td>
                  <td className="num">{money(c.revenue)}</td>
                  <td className="num neg">{money(c.shipping)}</td>
                  <td className="num neg">{money(c.packaging)}</td>
                  <td className="num neg">{money(c.insurance)}</td>
                  <td className="num neg">{money(c.cleaning)}</td>
                  <td className="num neg">{money(c.fees)}</td>
                  <td className="num neg">{money(c.credits)}</td>
                  <td>{c.exchanges}</td>
                  <td className={`num ${c.contribution < 0 ? 'neg' : 'pos'}`}>{money(c.contribution)}</td>
                  {p.fixedAllocationReliable && <>
                    <td className="num neg">{money(c.fixedShare)}</td>
                    <td className={`num ${c.operating < 0 ? 'neg' : 'pos'}`}>{money(c.operating)}</td>
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="cell-sub">
          העלויות מחושבות לפי הפעילות בפועל של כל לקוחה.
          {p.fixedAllocationReliable
            ? ' העלויות הקבועות מחולקות שווה בשווה.'
            : ' מוצג רווח גולמי (תרומה) בלבד — הקצאת קבועות ללקוחה אמינה רק מ-50 מנויות ומעלה.'}
        </p>
      </div>

      {/* ===== 6. מלאי ===== */}
      <div className="admin-section">
        <h2>6. מלאי וביצועי תכשיטים</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <tbody>
              <Row label="יחידות סה״כ" value={inv.totalUnits} />
              <Row label="יחידות אצל לקוחות" value={inv.inUse} />
              <Row label="ניצול מלאי (לפי ימי שימוש)" value={pct(inv.utilizationUnits)} />
              <Row label="שווי מלאי (עלות רכישה)" value={money(inv.value)} />
              <Row label="הכנסה ממוצעת לתכשיט" value={money(inv.avgRevenuePerItem)} />
              <Row label="החזר השקעה ממוצע (חודשים)" value={fmtNum(inv.avgPayback) || '—'} />
            </tbody>
          </table>
        </div>
        <h3 className="rep-h3">ניצול לפי דגם</h3>
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>דגם</th><th>יחידות</th><th>ימי שימוש</th><th>ניצול</th><th>הכנסה</th><th>תרומה</th></tr></thead>
            <tbody>
              {[...inv.bySku].sort((a, b) => (b.utilization || 0) - (a.utilization || 0)).map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td><td>{r.units}</td><td>{Math.round(r.useDays)}</td>
                  <td>{pct(r.utilization)}</td>
                  <td className="num">{money(r.revenue)}</td>
                  <td className="num">{money(r.contribution)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="rep-h3">התיישנות מלאי</h3>
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>טווח</th><th>יחידות</th><th>שווי</th></tr></thead>
            <tbody>
              {inv.buckets.map((b) => (
                <tr key={b.label}><td>{b.label}</td><td>{b.items}</td><td className="num">{money(b.value)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 7. תפעול ומזומן ===== */}
      <div className="admin-section">
        <h2>7. תפעול ותזרים</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <tbody>
              <Row label="הזמנות בתקופה" value={k.costDrivers.orders} />
              <Row label="החלפות" value={ops.exchanges} />
              <Row label="החלפות ממוצעות למנויה" value={fmtNum(ops.exchangeRate)} />
              <Row label="זמן מחזור החזרה (ימים)" value={fmtNum(ops.avgCycle) || '—'} />
              <Row label="החזרות פתוחות" value={ops.outstanding} />
              <Row label="מתוכן מעל 5 ימים" value={ops.overdue} />
            </tbody>
          </table>
        </div>
        <h3 className="rep-h3">תזרים מזומנים — פירוט</h3>
        <div className="table-wrap">
          <table className="admin-table">
            <tbody>
              {cash.categories.map((c) => (
                <Row key={c.label} label={c.label} value={c.amount < 0 ? `−${money(Math.abs(c.amount))}` : money(c.amount)} neg={c.amount < 0} />
              ))}
              <Row label="תזרים נטו" value={money(cash.netCash)} strong neg={cash.netCash < 0} />
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 8. ביצועים לפי תכשיט (מספר פריט) ===== */}
      <div className="admin-section">
        <h2>8. ביצועים לפי תכשיט (מספר פריט)</h2>
        <p className="cell-sub">
          הכנסה מוקצית לפי יחס נקודות · מוצגים 60 המובילים לפי הכנסה ·
          Payback ו-ROI מוצגים רק לפריטים עם 3+ חודשי פעילות
        </p>
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>מס׳ פריט</th><th>דגם</th><th>סטטוס</th><th>עלות רכישה</th><th>הכנסה מוקצית</th><th>תרומה</th><th>חודשים במלאי</th><th>החזר (חודשים)</th><th>נותר להחזיר</th><th>ROI</th></tr></thead>
            <tbody>
              {inv.items.length === 0 && <tr><td colSpan="10" style={{ color: 'var(--muted)' }}>אין נתוני פריטים בתקופה</td></tr>}
              {[...inv.items].sort((a, b) => b.revenue - a.revenue).slice(0, 60).map((i) => (
                <tr key={i.serial}>
                  <td dir="ltr">{i.serial}</td><td>{i.name}</td><td>{i.status}</td>
                  <td className="num">{money(i.cost)}</td>
                  <td className="num">{money(i.revenue)}</td>
                  <td className="num">{money(i.contribution)}</td>
                  <td>{i.monthsActive}</td>
                  <td>{i.paybackMonths ? fmtNum(i.paybackMonths) : '—'}</td>
                  <td className="num">{money(i.remaining)}</td>
                  <td className={i.roi > 0 ? 'pos' : ''}>{pct(i.roi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="cell-sub">עלות הרכישה ניתנת לעריכה בטאב "ניהול מלאי".</p>
      </div>

      {/* ===== 9. יומנים (לא נכללים בהדפסה) ===== */}
      <div className="admin-section no-print">
        <h2>9. הודעות שנשלחו ללקוחות</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>תאריך</th><th>לקוחה</th><th>ערוץ</th><th>סטטוס</th><th>תוכן</th></tr></thead>
            <tbody>
              {db.notifications.length === 0 && <tr><td colSpan="5" style={{ color: 'var(--muted)' }}>לא נשלחו הודעות</td></tr>}
              {db.notifications.slice(0, 12).map((n, i) => {
                const u = db.users.find((x) => x.id === n.userId)
                return (
                  <tr key={i}>
                    <td>{heDate(n.ts)}</td>
                    <td>{u ? u.name : '—'}</td>
                    <td>{n.channel}</td>
                    <td><span className="pill ok">{n.status}</span></td>
                    <td style={{ maxWidth: 420, fontSize: '0.85rem', color: 'var(--muted)' }}>{n.text}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section no-print">
        <h2>10. יומן פעולות (Audit Log)</h2>
        <p className="cell-sub" style={{ marginTop: -6 }}>
          כל שינוי במערכת נרשם כאן אוטומטית: הזמנות, מחסן ומשלוחים, סריקות החזרה, רכישות,
          שינויי מחירים ומסלולים, מלאי, הוצאות ותעריפים, ולקוחות. נשמרות 300 הפעולות האחרונות.
        </p>
        <div className="audit-log">
          {db.audit.length === 0 && <div className="cell-sub">אין אירועים עדיין</div>}
          {db.audit.slice(0, 100).map((a, i) => (
            <div key={i} className="audit-row">
              <span className="audit-ts" dir="ltr">{new Date(a.ts).toLocaleString('he-IL')}</span>
              <span className="audit-actor">{a.actor || '—'}</span>
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="cell-sub" style={{ marginTop: 24 }}>
        * הגבייה מחושבת כאומדן לפי המנויות הפעילות. בגרסת הענן היא תגיע מהסליקה בפועל לפי תאריך תשלום.
      </p>
    </div>
  )
}
