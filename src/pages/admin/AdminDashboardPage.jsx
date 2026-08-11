import { useMemo, useState } from 'react'
import { CATEGORIES } from '../../lib/site.js'
import { useApp } from '../../state/AppContext'
import { buildDbFromState } from '../../lib/dbFromState'
import { PERIODS, computeKpis, fmtMoney, fmtNum, fmtPct, periodRange, trend } from '../../lib/kpi.js'
import { Drawer, KpiCard, Section } from '../../components/Kpi.jsx'

const money = (n) => fmtMoney(n) || '—'
const pct = (n) => fmtPct(n) || '—'

// גרף תנועת מנויים — עמודות HTML, יציב בכל מספר חודשים
function MovementChart({ data }) {
  if (!data.length) return <p className="cell-sub">אין נתונים לתקופה</p>
  const max = Math.max(...data.map((d) => Math.max(d.active, d.joined, d.left)), 1)
  const h = (n) => `${Math.max(n > 0 ? 4 : 0, (n / max) * 100)}%`
  return (
    <div className="chart-wrap">
      <div className="mchart">
        {data.map((d) => (
          <div className="mcol" key={d.label}>
            <div className="mbars">
              <span className="mbar active" style={{ height: h(d.active) }} title={`פעילות: ${d.active}`}>
                <b>{d.active}</b>
              </span>
              <span className="mbar joined" style={{ height: h(d.joined) }} title={`הצטרפו: ${d.joined}`} />
              <span className="mbar left" style={{ height: h(d.left) }} title={`עזבו: ${d.left}`} />
            </div>
            <span className="mlabel">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span><i className="sw active" /> מנויות פעילות</span>
        <span><i className="sw joined" /> הצטרפו</span>
        <span><i className="sw left" /> עזבו</span>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { state } = useApp()
  const db = useMemo(() => buildDbFromState(state), [state])
  const [period, setPeriod] = useState('this-month')
  const [custom, setCustom] = useState({ from: '', to: '' })
  const [plan, setPlan] = useState('')
  const [category, setCategory] = useState('')
  const [utilMode, setUtilMode] = useState('units')
  const [drill, setDrill] = useState(null)

  const range = useMemo(() => periodRange(period, custom), [period, custom])
  const filters = useMemo(() => ({ plan: plan || null, category: category || null }), [plan, category])
  const k = useMemo(() => computeKpis(db, range, filters), [db, range, filters])
  const prev = useMemo(
    () => computeKpis(db, { start: range.prevStart, end: range.prevEnd }, filters),
    [db, range, filters]
  )

  const s = k.subscriptions, p = k.profitability, inv = k.inventory, ops = k.operations, cash = k.cash
  const ps = prev.subscriptions, pp = prev.profitability, pinv = prev.inventory, pops = prev.operations

  const periodLabel = `${range.start.toLocaleDateString('he-IL')} – ${range.end.toLocaleDateString('he-IL')}`

  return (
    <div className="kpi-dash">
      <div className="admin-head-row">
        <h1>לוח בקרה</h1>
        <span className="cell-sub">{periodLabel}</span>
      </div>

      {/* ===== פילטרים אחידים ===== */}
      <div className="kpi-filters">
        <div className="filter-group">
          <label>תקופה</label>
          <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </div>
        {period === 'custom' && (
          <>
            <div className="filter-group">
              <label>מתאריך</label>
              <input className="select" type="date" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
            </div>
            <div className="filter-group">
              <label>עד תאריך</label>
              <input className="select" type="date" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
            </div>
          </>
        )}
        <div className="filter-group">
          <label>מסלול</label>
          <select className="select" value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="">כל המסלולים</option>
            {db.plans.map((x) => <option key={x.id} value={x.id}>{x.latin}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>קטגוריה</label>
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">כל הקטגוריות</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* ===== 1. מנויים ===== */}
      <Section title="מנויים">
        <div className="kpi-grid">
          <KpiCard
            label="מנויות פעילות" value={s.activeEnd}
            trendPct={trend(s.activeEnd, ps.activeEnd)}
            explain={{
              what: 'מספר המנויות שיש להן מנוי פעיל נכון לסוף התקופה שנבחרה.',
              how: 'לקוחות שהצטרפו עד סוף התקופה ולא ביטלו עד אליה.',
              now: `${s.activeEnd} מנויות פעילות בסוף התקופה.`,
            }}
          />
          <KpiCard
            label="מנויות חדשות" value={s.newSubs}
            trendPct={trend(s.newSubs, ps.newSubs)}
            explain={{
              what: 'מספר הלקוחות שהחלו מנוי משלם במהלך התקופה שנבחרה.',
              how: 'ספירת לקוחות שתאריך ההצטרפות שלהן נופל בתוך התקופה.',
              now: `${s.newSubs} לקוחות חדשות הצטרפו בתקופה.`,
            }}
          />
          <KpiCard
            label="מנויות שעזבו" value={s.churned} trendGood="down"
            trendPct={trend(s.churned, ps.churned)}
            explain={{
              what: 'מספר המנויות שהפסיקו את המנוי במהלך התקופה.',
              how: 'ספירת לקוחות שתאריך הביטול שלהן נופל בתוך התקופה.',
              now: s.churned === 0 ? 'אף מנויה לא עזבה בתקופה זו.' : `${s.churned} מנויות סיימו את המנוי בתקופה.`,
            }}
          />
          <KpiCard
            label="הכנסה ממוצעת למנויה (ARPU)" value={money(s.arpu)}
            trendPct={trend(s.arpu, ps.arpu)}
            hint={s.monthCount > 1 && s.arpuMonthly ? `${money(s.arpuMonthly)} בממוצע לחודש` : null}
            explain={{
              what: 'סכום ההכנסה הממוצעת שכל מנויה מייצרת בתקופה שנבחרה.',
              how: 'הכנסות ממנויים ÷ מספר ממוצע של מנויות פעילות בתקופה.',
              now: s.arpu
                ? `כל מנויה ייצרה בממוצע ${money(s.arpu)} בתקופה${s.monthCount > 1 ? ` (${money(s.arpuMonthly)} לחודש)` : ''}.`
                : 'אין מנויות פעילות בתקופה.',
            }}
          />
          <KpiCard
            label="שיעור נטישה חודשי (Churn)" value={pct(s.churnRate)} trendGood="down"
            trendPct={trend(s.churnRate, ps.churnRate)}
            hint={s.churned > 0 ? `${s.churned} מנויות עזבו בתקופה` : null}
            empty="אין מנויות בתחילת התקופה לחישוב"
            explain={{
              what: 'אחוז המנויות שעזבו בחודש ממוצע, מתוך אלה שהיו פעילות בתחילת אותו חודש.',
              how: 'לכל חודש: מנויות שעזבו ÷ מנויות פעילות בתחילתו × 100. בתקופה רב-חודשית מוצג הממוצע החודשי.',
              now: s.churnRate === null ? 'אין מספיק נתונים.'
                : `${pct(s.churnRate)} מהלקוחות הפעילות עוזבות בחודש ממוצע.`,
            }}
          />
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>תנועת מנויות חודשית</h3>
            <button className="btn-mini" onClick={() => setDrill('movement')}>טבלה</button>
          </div>
          <MovementChart data={s.movement} />
        </div>
      </Section>

      {/* ===== 2. רווחיות ===== */}
      <Section title="רווחיות">
        <div className="kpi-grid">
          <KpiCard
            label="עלות גיוס לקוחה (CAC)" value={money(p.cac)} trendGood="down"
            trendPct={trend(p.cac, pp.cac)}
            empty={p.marketing ? 'לא גויסו לקוחות חדשות בתקופה' : 'לא נרשמו הוצאות שיווק בתקופה'}
            explain={{
              what: 'עלות ממוצעת לגיוס מנויה חדשה.',
              how: 'הוצאות שיווק ומכירה בתקופה ÷ מספר המנויות החדשות.',
              now: p.cac ? `בממוצע עלה ${money(p.cac)} לגייס מנויה חדשה (${money(p.marketing)} שיווק ÷ ${s.newSubs} מנויות).`
                : 'צריך גם הוצאות שיווק וגם מנויות חדשות בתקופה.',
            }}
          />
          <KpiCard
            label="ערך חיי לקוחה (LTV)" value={money(p.ltv)}
            empty="אין עדיין מספיק נתוני נטישה"
            explain={{
              what: 'הערך הכלכלי המשוער שמנויה מייצרת לאורך כל תקופת המנוי שלה.',
              how: 'ARPU חודשי × אחוז המרווח התרומתי ÷ שיעור הנטישה החודשי.',
              now: p.ltv ? `כל מנויה צפויה לייצר ${money(p.ltv)} לאורך חייה כלקוחה.`
                : 'אין מספיק היסטוריית נטישה כדי לחשב LTV אמין — נדרשות מנויות שעזבו בתקופה.',
            }}
          />
          <KpiCard
            label="מרווח גולמי" value={pct(p.grossMarginPct)}
            trendPct={trend(p.grossMarginPct, pp.grossMarginPct)}
            hint={`רווח גולמי ${money(p.grossProfit)}`}
            onOpen={() => setDrill('margin')}
            explain={{
              what: 'אחוז ההכנסה שנשאר לאחר העלויות הישירות של אספקת השירות.',
              how: '(הכנסה − עלויות ישירות) ÷ הכנסה × 100. העלויות: משלוח, אריזה, ניקוי וסליקה.',
              now: p.grossMarginPct ? `${pct(p.grossMarginPct)} מההכנסה נשארים אחרי העלויות הישירות.` : 'אין הכנסה בתקופה.',
            }}
          />
          <KpiCard
            label="מרווח תפעולי" value={pct(p.operatingMarginPct)}
            trendPct={trend(p.operatingMarginPct, pp.operatingMarginPct)}
            hint={`רווח תפעולי ${money(p.operatingProfit)}`}
            onOpen={() => setDrill('operating')}
            explain={{
              what: 'אחוז ההכנסה שנשאר כרווח אחרי כל ההוצאות השוטפות — משתנות, קבועות ושיווק.',
              how: '(הכנסה − עלויות משתנות − הוצאות קבועות − שיווק) ÷ הכנסה × 100. רכש מלאי אינו נכלל (השקעה).',
              now: p.operatingMarginPct !== null
                ? `${p.operatingProfit >= 0 ? 'העסק רווחי תפעולית' : 'העסק עדיין בהפסד תפעולי'} — ${money(p.operatingProfit)} (${pct(p.operatingMarginPct)}).`
                : 'אין הכנסה בתקופה.',
            }}
          />
          <KpiCard
            label="עלויות קבועות" value={money(p.fixedCosts)} trendGood="down"
            trendPct={trend(p.fixedCosts, pp.fixedCosts)}
            hint={s.monthCount > 1 ? `${money(p.fixedMonthly)} בממוצע לחודש` : 'שכר · מחסן · תוכנה · ביטוח · מיסים'}
            onOpen={() => setDrill('fixed')}
            empty='רשמי אותן בטאב "הוצאות ותעריפים"'
            explain={{
              what: 'ההוצאות שאינן תלויות במספר המנויות: משכורות, מחסן, תוכנות, ביטוח ומיסים.',
              how: 'סכום ההוצאות שנרשמו בטאב "הוצאות ותעריפים" בקטגוריות הקבועות, בתוך התקופה.',
              now: p.fixedCosts
                ? `${money(p.fixedCosts)} בתקופה${s.monthCount > 1 ? ` (${money(p.fixedMonthly)} לחודש)` : ''}. לחיצה על הכרטיס לפירוט לפי קטגוריה.`
                : 'לא נרשמו הוצאות קבועות — אפשר לרשום אותן בטאב ההוצאות.',
            }}
          />
          <KpiCard
            label="נקודת איזון (מנויות)" value={p.breakEvenSubs} trendGood="down"
            hint={p.breakEvenSubs ? `כרגע ${s.activeEnd} מנויות · ${p.breakEvenSubs <= s.activeEnd ? 'מעל האיזון ✓' : `חסרות ${p.breakEvenSubs - s.activeEnd}`}` : null}
            empty="נדרשים רווח גולמי חיובי ועלויות קבועות"
            explain={{
              what: 'כמה מנויות פעילות דרושות כדי שהרווח הגולמי יכסה בדיוק את העלויות הקבועות.',
              how: 'עלויות קבועות חודשיות ÷ רווח גולמי חודשי ממוצע למנויה.',
              now: p.breakEvenSubs
                ? `דרושות ${p.breakEvenSubs} מנויות לאיזון (כל מנויה מייצרת ${money(p.grossPerSubMonth)} רווח גולמי בחודש). כרגע יש ${s.activeEnd}.`
                : 'אין מספיק נתונים לחישוב.',
            }}
          />
          <KpiCard
            label="התחייבות קרדיטים ללקוחות" value={money(p.creditLiability)}
            hint={`נצברו בתקופה ${money(p.creditsAccrued)}`}
            explain={{
              what: 'סך הקרדיטים שצברו הלקוחות וטרם מומשו — כסף שהעסק "חייב" להן לרכישת תכשיטים.',
              how: `${db.rates.creditPct}% מדמי המנוי החודשיים נצברים לכל לקוחה, פחות קרדיטים שכבר מומשו.`,
              now: `הלקוחות מחזיקות כרגע ${money(p.creditLiability)} קרדיט לניצול. שיעור הצבירה ניתן לעריכה בטאב ההוצאות.`,
            }}
          />
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>רווחיות לפי לקוחה</h3>
            <button className="btn-mini" onClick={() => setDrill('customers')}>פירוט מלא</button>
          </div>
          {p.byCustomer.length === 0 ? (
            <p className="cell-sub">אין נתוני לקוחות בתקופה</p>
          ) : (
            <div className="cust-preview">
              {[...p.byCustomer].sort((a, b) => b.operating - a.operating).slice(0, 3).map((c) => (
                <div className="cust-row" key={c.id}>
                  <span className="cust-name">{c.name}</span>
                  <span className="cust-plan">{c.plan}</span>
                  <span className="cust-rev">הכנסה {money(c.revenue)}</span>
                  <span className={`cust-op ${c.operating < 0 ? 'neg' : 'pos'}`}>רווח תפעולי {money(c.operating)}</span>
                </div>
              ))}
              <p className="cell-sub" style={{ marginTop: 8 }}>
                מוצגות 3 הרווחיות ביותר · ממוצע ללקוחה {money(p.avgCustomerOperating)} · לחיצה לפירוט כל הלקוחות
              </p>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>מרווח תפעולי לפי מסלול</h3>
            <button className="btn-mini" onClick={() => setDrill('plans')}>פירוט מלא</button>
          </div>
          <div className="mini-bars">
            {p.byPlan.map((row) => (
              <div className="mini-bar-row" key={row.id}>
                <span className="mbr-label">{row.name}</span>
                <span className="mbr-track">
                  <span className="mbr-fill" style={{ width: `${Math.max(0, Math.min(100, row.operatingMarginPct || 0))}%` }} />
                </span>
                <span className="mbr-val">{pct(row.operatingMarginPct)}</span>
                <span className="mbr-sub">{row.subscribers} מנויות · רווח תפעולי {money(row.operating)}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== 3. ביצועי מלאי ===== */}
      <Section title="ביצועי מלאי">
        <div className="kpi-grid">
          <KpiCard
            label="ניצול מלאי"
            value={pct(utilMode === 'units' ? inv.utilizationUnits : inv.utilizationValue)}
            trendPct={trend(
              utilMode === 'units' ? inv.utilizationUnits : inv.utilizationValue,
              utilMode === 'units' ? pinv.utilizationUnits : pinv.utilizationValue
            )}
            hint={`${inv.inUse} מתוך ${inv.totalUnits} יחידות אצל לקוחות כרגע`}
            onOpen={() => setDrill('sku')}
            explain={{
              what: 'איזה אחוז מהמלאי הזמין באמת נמצא בשימוש אצל לקוחות.',
              how: 'ימי־שימוש בתכשיטים ÷ ימי־מלאי זמינים להשכרה × 100 (פריטים מושבתים אינם נספרים).',
              now: `בממוצע ${pct(utilMode === 'units' ? inv.utilizationUnits : inv.utilizationValue)} מקיבולת המלאי הייתה בשימוש בתקופה.`,
            }}
          />
          <KpiCard
            label="הכנסה ממוצעת לתכשיט" value={money(inv.avgRevenuePerItem)}
            trendPct={trend(inv.avgRevenuePerItem, pinv.avgRevenuePerItem)}
            onOpen={() => setDrill('items')}
            empty="לא הוקצתה הכנסה לתכשיטים בתקופה"
            explain={{
              what: 'כמה הכנסה ייצר בממוצע כל תכשיט שהיה בשימוש בתקופה.',
              how: 'הכנסת המנוי מוקצית לתכשיטים לפי יחס הנקודות שלהם אצל כל לקוחה.',
              now: inv.avgRevenuePerItem ? `כל תכשיט פעיל ייצר בממוצע ${money(inv.avgRevenuePerItem)} בתקופה.` : 'אין תכשיטים פעילים בתקופה.',
            }}
          />
          <KpiCard
            label="החזר השקעה ממוצע (חודשים)" value={fmtNum(inv.avgPayback) || null}
            unit=" חודשים" trendGood="down"
            trendPct={trend(inv.avgPayback, pinv.avgPayback)}
            onOpen={() => setDrill('items')}
            empty="נדרשת עלות רכישה ותרומה חיובית"
            explain={{
              what: 'כמה חודשי שימוש נדרשים כדי להחזיר את עלות רכישת התכשיט.',
              how: 'עלות רכישת התכשיט ÷ התרומה החודשית הממוצעת שהוא מייצר.',
              now: inv.avgPayback ? `בקצב הנוכחי תכשיט מחזיר את עלותו תוך ${fmtNum(inv.avgPayback)} חודשים בממוצע.` : 'אין מספיק נתונים.',
            }}
          />
          <KpiCard
            label="מלאי שאינו זז (90+ ימים)"
            value={inv.buckets[3].items} trendGood="down"
            hint={`שווי ${money(inv.buckets[3].value)}`}
            onOpen={() => setDrill('aging')}
            explain={{
              what: 'כמה זמן המלאי הזמין יושב ללא שימוש.',
              how: 'ספירת יחידות זמינות לפי הימים שחלפו מאז שחזרו למדף (או מאז כניסתן למלאי).',
              now: `${inv.buckets[3].items} יחידות לא הושכרו מעל 90 ימים — ${money(inv.buckets[3].value)} הון שאינו מייצר הכנסה.`,
            }}
          />
        </div>
        <div className="toggle-row">
          <span className="cell-sub">מדידת ניצול:</span>
          <button className={`chip${utilMode === 'units' ? ' on' : ''}`} onClick={() => setUtilMode('units')}>לפי יחידות</button>
          <button className={`chip${utilMode === 'value' ? ' on' : ''}`} onClick={() => setUtilMode('value')}>לפי שווי</button>
        </div>
      </Section>

      {/* ===== 4. תפעול ומזומן ===== */}
      <Section title="תפעול ומזומן">
        <div className="kpi-grid">
          <KpiCard
            label="החלפות למנויה" value={fmtNum(ops.exchangeRate)}
            trendPct={trend(ops.exchangeRate, pops.exchangeRate)}
            hint={`${ops.exchanges} החלפות בתקופה`}
            explain={{
              what: 'כמה החלפות בממוצע ביצעה כל מנויה בתקופה.',
              how: 'החלפות שהושלמו ÷ מספר ממוצע של מנויות פעילות.',
              now: ops.exchangeRate ? `כל מנויה ביצעה בממוצע ${fmtNum(ops.exchangeRate)} החלפות — משפיע ישירות על עלויות המשלוח והטיפול.` : 'לא בוצעו החלפות בתקופה.',
            }}
          />
          <KpiCard
            label="זמן מחזור החזרה" value={fmtNum(ops.avgCycle)} unit=" ימים" trendGood="down"
            trendPct={trend(ops.avgCycle, pops.avgCycle)}
            empty="לא הושלמו החזרות בתקופה"
            explain={{
              what: 'כמה זמן עובר מפתיחת ההחזרה ועד שכל התכשיטים נסרקים חזרה במחסן.',
              how: 'ממוצע הימים מפתיחת ההחזרה ועד סריקת הפריט האחרון שלה.',
              now: ops.avgCycle
                ? `ממוצע ${fmtNum(ops.avgCycle)} ימים · חציון ${fmtNum(ops.medianCycle)} · ${pct(ops.within5)} הוחזרו תוך 5 ימים${ops.longestOpen ? ` · ההחזרה הפתוחה הוותיקה: ${fmtNum(ops.longestOpen)} ימים` : ''}.`
                : 'אין החזרות שהושלמו בתקופה.',
            }}
          />
          <KpiCard
            label="החזרות פתוחות" value={ops.outstanding} trendGood="down"
            hint={`מעל 5 ימים: ${ops.overdue}`}
            onOpen={() => setDrill('returns')}
            explain={{
              what: 'מספר ההחזרות שעדיין לא הושלמו — לפחות תכשיט אחד לא נסרק חזרה במחסן.',
              how: 'החזרות שסטטוסן אינו "הושלמה". סטטוס חברת המשלוחים אינו סוגר החזרה.',
              now: ops.outstanding === 0 ? 'כל ההחזרות הושלמו.' : `${ops.outstanding} החזרות פתוחות, מהן ${ops.overdue} חרגו מיעד 5 הימים.`,
            }}
          />
          <KpiCard
            label="תזרים נטו" value={money(cash.netCash)}
            trendPct={trend(cash.netCash, prev.cash.netCash)}
            hint={`נכנס ${money(cash.cashIn)} · יצא ${money(cash.cashOut)}`}
            onOpen={() => setDrill('cash')}
            explain={{
              what: 'ההפרש בין הכסף שנכנס לעסק לבין הכסף שיצא בתקופה.',
              how: 'גביית מנויים (אומדן לפי מנויות פעילות) פחות ההוצאות שנרשמו והעלויות התפעוליות המחושבות.',
              now: `${cash.netCash >= 0 ? 'תזרים חיובי' : 'תזרים שלילי'} של ${money(Math.abs(cash.netCash))} בתקופה.`,
            }}
          />
        </div>
        <p className="cell-sub" style={{ marginTop: 10 }}>
          * הגבייה מחושבת כאומדן לפי המנויות הפעילות — בגרסת הענן היא תגיע מהסליקה בפועל לפי תאריך תשלום.
        </p>
      </Section>

      {/* ===== Drill-down ===== */}
      {drill === 'movement' && (
        <Drawer title="תנועת מנויות חודשית" sub={periodLabel} onClose={() => setDrill(null)}>
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
        </Drawer>
      )}

      {(drill === 'margin' || drill === 'operating') && (
        <Drawer title="דוח רווח והפסד" sub={periodLabel} onClose={() => setDrill(null)}>
          <table className="admin-table">
            <tbody>
              <tr><td><b>הכנסות ממנויים</b></td><td className="num">{money(p.revenue)}</td></tr>
              <tr><td colSpan="2" className="cell-sub" style={{ paddingTop: 14 }}>עלויות משתנות</td></tr>
              <tr><td>משלוחים</td><td className="num neg">−{money(p.costBreakdown.shipping)}</td></tr>
              <tr><td>אריזה ונרתיקים</td><td className="num neg">−{money(p.costBreakdown.packaging)}</td></tr>
              <tr><td>ביטוח משלוחים</td><td className="num neg">−{money(p.costBreakdown.insurance)}</td></tr>
              <tr><td>ניקוי וחיטוי</td><td className="num neg">−{money(p.costBreakdown.cleaning)}</td></tr>
              <tr><td>עמלות סליקה</td><td className="num neg">−{money(p.costBreakdown.fees)}</td></tr>
              <tr><td>קרדיטים ללקוחות ({db.rates.creditPct}% מהמנוי)</td><td className="num neg">−{money(p.costBreakdown.credits)}</td></tr>
              <tr className="total"><td>רווח גולמי</td><td className="num">{money(p.grossProfit)} · {pct(p.grossMarginPct)}</td></tr>
              <tr><td colSpan="2" className="cell-sub" style={{ paddingTop: 14 }}>הוצאות קבועות ושיווק</td></tr>
              {p.fixedByCategory.map((f) => (
                <tr key={f.category}><td>{f.category}</td><td className="num neg">−{money(f.amount)}</td></tr>
              ))}
              {p.fixedByCategory.length === 0 && (
                <tr><td className="cell-sub">לא נרשמו עלויות קבועות בתקופה</td><td className="num">—</td></tr>
              )}
              <tr><td>שיווק ופרסום</td><td className="num neg">−{money(p.marketing)}</td></tr>
              {p.otherExpenses > 0 && <tr><td>הוצאות אחרות</td><td className="num neg">−{money(p.otherExpenses)}</td></tr>}
              <tr className="total"><td>רווח תפעולי</td>
                <td className={`num ${p.operatingProfit < 0 ? 'neg' : 'pos'}`}>{money(p.operatingProfit)} · {pct(p.operatingMarginPct)}</td></tr>
              {p.capex > 0 && (
                <tr><td className="cell-sub">רכש תכשיטים (השקעה במלאי, מחוץ לרווח התפעולי)</td>
                  <td className="num cell-sub">{money(p.capex)}</td></tr>
              )}
            </tbody>
          </table>
          <p className="cell-sub" style={{ marginTop: 12 }}>
            התעריפים המשתנים ואחוז הקרדיט ניתנים לעריכה בטאב "הוצאות ותעריפים";
            העלויות הקבועות מגיעות מההוצאות שנרשמו שם.
          </p>
        </Drawer>
      )}

      {drill === 'fixed' && (
        <Drawer
          title="עלויות קבועות — פירוט"
          sub={`${periodLabel} · סה״כ ${money(p.fixedCosts)}${s.monthCount > 1 ? ` · ${money(p.fixedMonthly)} לחודש` : ''}`}
          onClose={() => setDrill(null)}
        >
          <table className="admin-table">
            <thead><tr><th>קטגוריה</th><th>סכום בתקופה</th><th>ממוצע לחודש</th><th>% מהקבועות</th><th>% מההכנסה</th></tr></thead>
            <tbody>
              {p.fixedByCategory.length === 0 && (
                <tr><td colSpan="5" style={{ color: 'var(--muted)' }}>לא נרשמו עלויות קבועות בתקופה — אפשר לרשום אותן בטאב "הוצאות ותעריפים"</td></tr>
              )}
              {p.fixedByCategory.map((f) => (
                <tr key={f.category}>
                  <td>{f.category}</td>
                  <td className="num">{money(f.amount)}</td>
                  <td className="num">{money(f.amount / s.monthCount)}</td>
                  <td>{pct((f.amount / p.fixedCosts) * 100)}</td>
                  <td>{p.revenue > 0 ? pct((f.amount / p.revenue) * 100) : '—'}</td>
                </tr>
              ))}
              {p.fixedByCategory.length > 0 && (
                <tr className="total">
                  <td>סה״כ קבועות</td>
                  <td className="num">{money(p.fixedCosts)}</td>
                  <td className="num">{money(p.fixedMonthly)}</td>
                  <td>100.0%</td>
                  <td>{p.revenue > 0 ? pct((p.fixedCosts / p.revenue) * 100) : '—'}</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="panel" style={{ marginTop: 18 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>מה זה אומר</h3>
            <p className="cell-sub">
              {p.breakEvenSubs
                ? `כל מנויה מייצרת ${money(p.grossPerSubMonth)} רווח גולמי בחודש. כדי לכסות ${money(p.fixedMonthly)} עלויות קבועות חודשיות דרושות ${p.breakEvenSubs} מנויות פעילות — כרגע יש ${s.activeEnd}.`
                : 'כדי לחשב נקודת איזון נדרשים רווח גולמי חיובי ועלויות קבועות רשומות.'}
            </p>
          </div>
          <p className="cell-sub" style={{ marginTop: 12 }}>
            העלויות הקבועות נרשמות בטאב "הוצאות ותעריפים" בקטגוריות: שכר, מחסן, תוכנה, ביטוח ומיסים.
            שיווק ורכש תכשיטים מטופלים בנפרד (גיוס והשקעה במלאי).
          </p>
        </Drawer>
      )}

      {drill === 'plans' && (
        <Drawer title="רווחיות לפי מסלול" sub={periodLabel} onClose={() => setDrill(null)}>
          <table className="admin-table">
            <thead><tr><th>מסלול</th><th>מנויות</th><th>הכנסה</th><th>עלויות משתנות</th><th>רווח גולמי</th><th>חלק בקבועות</th><th>רווח תפעולי</th><th>מרווח תפעולי</th></tr></thead>
            <tbody>
              {p.byPlan.map((r) => (
                <tr key={r.id}>
                  <td><b>{r.name}</b> · ₪{r.price}</td>
                  <td>{r.subscribers}</td>
                  <td className="num">{money(r.revenue)}</td>
                  <td className="num neg">{money(r.variableCosts)}</td>
                  <td className="num">{money(r.contribution)}</td>
                  <td className="num neg">{money(r.fixedShare)}</td>
                  <td className={`num ${r.operating < 0 ? 'neg' : 'pos'}`}>{money(r.operating)}</td>
                  <td>{pct(r.operatingMarginPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="cell-sub" style={{ marginTop: 10 }}>העלויות הקבועות והשיווק מוקצות בין המסלולים לפי משקל המנויות.</p>
        </Drawer>
      )}

      {drill === 'customers' && (
        <Drawer title="רווחיות לפי לקוחה" sub={`${periodLabel} · רווח תפעולי ממוצע ${money(p.avgCustomerOperating)}`} onClose={() => setDrill(null)}>
          <table className="admin-table">
            <thead><tr><th>לקוחה</th><th>מסלול</th><th>הכנסה</th><th>משלוחים</th><th>אריזה</th><th>ביטוח</th><th>ניקוי</th><th>סליקה</th><th>קרדיטים</th><th>החלפות</th><th>רווח גולמי</th><th>חלק בקבועות</th><th>רווח תפעולי</th></tr></thead>
            <tbody>
              {[...p.byCustomer].sort((a, b) => b.operating - a.operating).map((c) => (
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
                  <td className="num">{money(c.contribution)}</td>
                  <td className="num neg">{money(c.fixedShare)}</td>
                  <td className={`num ${c.operating < 0 ? 'neg' : 'pos'}`}>{money(c.operating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="cell-sub" style={{ marginTop: 10 }}>העלויות הקבועות מחולקות שווה בשווה בין הלקוחות הפעילות בתקופה.</p>
        </Drawer>
      )}

      {drill === 'sku' && (
        <Drawer title="ניצול לפי דגם" sub={periodLabel} onClose={() => setDrill(null)}>
          <table className="admin-table">
            <thead><tr><th>דגם</th><th>SKU</th><th>קטגוריה</th><th>יחידות</th><th>ימי מלאי</th><th>ימי שימוש</th><th>ניצול %</th><th>הכנסה</th><th>תרומה</th></tr></thead>
            <tbody>
              {[...inv.bySku].sort((a, b) => (b.utilization || 0) - (a.utilization || 0)).map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td><td dir="ltr">{r.sku}</td><td>{r.category}</td>
                  <td>{r.units}</td><td>{Math.round(r.availDays)}</td><td>{Math.round(r.useDays)}</td>
                  <td><span className={`pill ${(r.utilization || 0) >= 50 ? 'ok' : 'warn'}`}>{pct(r.utilization)}</span></td>
                  <td className="num">{money(r.revenue)}</td>
                  <td className="num">{money(r.contribution)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Drawer>
      )}

      {drill === 'items' && (
        <Drawer title="ביצועים לפי תכשיט (מספר פריט)" sub={`${periodLabel} · הכנסה מוקצית לפי יחס נקודות`} onClose={() => setDrill(null)}>
          <table className="admin-table">
            <thead><tr><th>מס׳ פריט</th><th>דגם</th><th>סטטוס</th><th>עלות רכישה</th><th>הכנסה מוקצית</th><th>תרומה</th><th>חודשים במלאי</th><th>החזר (חודשים)</th><th>נותר להחזיר</th><th>ROI</th></tr></thead>
            <tbody>
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
          <p className="cell-sub" style={{ marginTop: 10 }}>מוצגים 60 התכשיטים המובילים לפי הכנסה. עלות הרכישה ניתנת לעריכה בדף המלאי.</p>
        </Drawer>
      )}

      {drill === 'aging' && (
        <Drawer title="התיישנות מלאי" sub="יחידות זמינות שאינן אצל לקוחה" onClose={() => setDrill(null)}>
          <table className="admin-table">
            <thead><tr><th>טווח</th><th>יחידות</th><th>שווי מלאי</th></tr></thead>
            <tbody>
              {inv.buckets.map((b) => (
                <tr key={b.label}><td>{b.label}</td><td>{b.items}</td><td className="num">{money(b.value)}</td></tr>
              ))}
            </tbody>
          </table>
        </Drawer>
      )}

      {drill === 'returns' && (
        <Drawer title="החזרות פתוחות" sub="פירוט לפי מצב" onClose={() => setDrill(null)}>
          <table className="admin-table">
            <thead><tr><th>מצב</th><th>כמות</th></tr></thead>
            <tbody>
              {ops.outstandingBreakdown.map((b) => (
                <tr key={b.label}><td>{b.label}</td><td>{b.n}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="cell-sub" style={{ marginTop: 10 }}>לטיפול בהחזרות — טאב "החזרות".</p>
        </Drawer>
      )}

      {drill === 'cash' && (
        <Drawer title="תזרים מזומנים" sub={periodLabel} onClose={() => setDrill(null)}>
          <table className="admin-table">
            <tbody>
              {cash.categories.map((c) => (
                <tr key={c.label}>
                  <td>{c.label}</td>
                  <td className={`num ${c.amount < 0 ? 'neg' : 'pos'}`}>{c.amount < 0 ? '−' : ''}{money(Math.abs(c.amount))}</td>
                </tr>
              ))}
              <tr className="total"><td>תזרים נטו</td><td className={`num ${cash.netCash < 0 ? 'neg' : 'pos'}`}>{money(cash.netCash)}</td></tr>
            </tbody>
          </table>
        </Drawer>
      )}
    </div>
  )
}

