import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { buildDbFromState } from '../../lib/dbFromState';
import { PERIODS, computeKpis, fmtMoney, fmtNum, fmtPct, periodRange, trend } from '../../lib/kpi.js';
import { Drawer, KpiCard, Section } from '../../components/Kpi.jsx';

const money = (n) => fmtMoney(n) || '—';
const pct = (n) => fmtPct(n) || '—';

function MovementChart({ data }) {
  if (!data.length) return <p className="cell-sub">אין נתונים לתקופה</p>;
  const max = Math.max(...data.map((d) => Math.max(d.active, d.joined, d.left)), 1);
  const h = (n) => `${Math.max(n > 0 ? 4 : 0, (n / max) * 100)}%`;
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
  );
}

function ActionTile({ to, n, label }) {
  return (
    <Link to={to} className={`action-tile ${n > 0 ? 'urgent' : 'clear'}`}>
      <span className="at-n">{n}</span>
      <span className="at-lab">{label}</span>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { state } = useApp();
  const db = useMemo(() => buildDbFromState(state), [state]);
  const [period, setPeriod] = useState('this-month');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [drill, setDrill] = useState(null);

  const range = useMemo(() => periodRange(period, custom), [period, custom]);
  const k = useMemo(() => computeKpis(db, range, {}), [db, range]);
  const prev = useMemo(
    () => computeKpis(db, { start: range.prevStart, end: range.prevEnd }, {}),
    [db, range],
  );

  const s = k.subscriptions;
  const p = k.profitability;
  const ops = k.operations;
  const ps = prev.subscriptions;
  const pp = prev.profitability;
  const periodLabel = `${range.start.toLocaleDateString('he-IL')} – ${range.end.toLocaleDateString('he-IL')}`;

  const pendingOrders = db.orders.filter((o) => ['חדשה', 'בליקוט', 'ליקוט', 'נארזה', 'בקרה', 'אריזה'].includes(o.status)).length;
  const overdueReturns = db.returns.filter((r) => r.status !== 'הושלמה' && Date.now() > new Date(r.deadline).getTime()).length;
  const cleaningUnits = db.products.reduce((sum, prod) => sum + prod.units.filter((u) => u.status === 'בניקוי').length, 0);
  const pursToShip = db.purchases.filter((x) => x.needsShipping && !x.shippedAt).length;
  const blockedCustomers = db.users.filter((u) => u.exchangeBlocked).length;

  return (
    <div className="kpi-dash">
      <div className="admin-head-row">
        <h1>דשבורד</h1>
      </div>

      <div className="admin-section" style={{ marginTop: 18 }}>
        <h2>ממתין לטיפול עכשיו</h2>
        <div className="action-strip">
          <ActionTile to="/admin/warehouse" n={pendingOrders} label="הזמנות ממתינות לטיפול" />
          <ActionTile to="/admin/returns" n={overdueReturns} label="החזרות באיחור" />
          <ActionTile to="/admin/inventory" n={cleaningUnits} label="פריטים בניקוי" />
          <ActionTile to="/admin/warehouse" n={pursToShip} label="רכישות ממתינות למשלוח" />
          <ActionTile to="/admin/customers" n={blockedCustomers} label="לקוחות חסומות להחלפה" />
        </div>
      </div>

      <Section title="נתונים מסכמים" note={periodLabel}>
        <div className="kpi-filters" style={{ marginBottom: 22 }}>
          <div className="filter-group">
            <label>תקופה</label>
            <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((x) => (
                <option key={x.id} value={x.id}>{x.label}</option>
              ))}
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
        </div>

        <div className="kpi-grid">
          <KpiCard
            label="מנויות פעילות"
            value={s.activeEnd}
            trendPct={trend(s.activeEnd, ps.activeEnd)}
            hint={`${s.newSubs} חדשות בתקופה · ${s.churned} עזבו`}
            explain={{
              what: 'מספר המנויות עם מנוי פעיל בסוף התקופה — המדד הבסיסי לצמיחה.',
              how: 'לקוחות שהצטרפו עד סוף התקופה ולא ביטלו עד אליה.',
              now: `${s.activeEnd} מנויות פעילות · ${s.newSubs} הצטרפו · ${s.churned} עזבו בתקופה.`,
            }}
          />
          <KpiCard
            label="הכנסות"
            value={money(p.totalRevenue)}
            trendPct={trend(p.totalRevenue, pp.totalRevenue)}
            hint={`מנויים ${money(p.revenue)} · רכישות ${money(p.purchaseRevenue)}${p.exchangeFeeIncome > 0 ? ` · דמי החלפה ${money(p.exchangeFeeIncome)}` : ''}`}
            explain={{
              what: 'סך ההכנסות של העסק בתקופה — דמי המנוי, רכישות תכשיטים, ודמי משלוח על החלפות נוספות.',
              how: `דמי מנוי לפי המנויות הפעילות + מחירי הרכישות + ₪${db.rates.extraExchangeFee} על כל החלפה מעבר לכלולה.`,
              now: `סה"כ ${money(p.totalRevenue)}: מנויים ${money(p.revenue)}, רכישות ${money(p.purchaseRevenue)}, דמי החלפה ${money(p.exchangeFeeIncome)}.`,
            }}
          />
          <KpiCard
            label="רווח גולמי למנויה לחודש"
            value={money(p.grossPerSubMonth)}
            explain={{
              what: 'האם דמי המנוי מכסים את העלויות המשתנות — מבחן הכלכלה של המסלולים.',
              how: 'רווח גולמי חודשי ÷ מספר ממוצע של מנויות פעילות.',
              now: p.grossPerSubMonth ? `כל מנויה מייצרת ${money(p.grossPerSubMonth)} רווח גולמי בחודש.` : 'אין מספיק נתונים.',
            }}
          />
          <KpiCard
            label="נקודת איזון (מנויות)"
            value={p.breakEvenSubs}
            trendGood="down"
            hint={p.breakEvenSubs ? `כרגע ${s.activeEnd} · ${p.breakEvenSubs <= s.activeEnd ? 'מעל האיזון ✓' : `חסרות ${p.breakEvenSubs - s.activeEnd}`}` : null}
            empty="נדרשים רווח גולמי חיובי ועלויות קבועות"
            explain={{
              what: 'כמה מנויות פעילות דרושות כדי שהרווח הגולמי יכסה בדיוק את העלויות הקבועות.',
              how: 'עלויות קבועות חודשיות ÷ רווח גולמי חודשי ממוצע למנויה.',
              now: p.breakEvenSubs ? `דרושות ${p.breakEvenSubs} מנויות לאיזון. כרגע יש ${s.activeEnd}.` : 'אין מספיק נתונים לחישוב.',
            }}
          />
          <KpiCard
            label="החלפות למנויה"
            value={fmtNum(ops.exchangeRate)}
            trendPct={trend(ops.exchangeRate, prev.operations.exchangeRate)}
            hint={`${ops.exchanges} החלפות בתקופה`}
            explain={{
              what: 'כמה החלפות בממוצע ביצעה כל מנויה — מנוע העלות המרכזי במודל החלפות ללא הגבלה.',
              how: 'החלפות שבוצעו ÷ מספר ממוצע של מנויות פעילות.',
              now: ops.exchangeRate ? `כל מנויה ביצעה בממוצע ${fmtNum(ops.exchangeRate)} החלפות בתקופה.` : 'לא בוצעו החלפות בתקופה.',
            }}
          />
          <KpiCard
            label="החזרות פתוחות"
            value={ops.outstanding}
            trendGood="down"
            hint={`מעל 5 ימים: ${ops.overdue}`}
            onOpen={() => setDrill('returns')}
            explain={{
              what: 'תכשיטים שנמצאים בחוץ — החזרות שטרם נסרקו במלואן במחסן.',
              how: 'החזרות שסטטוסן אינו "הושלמה".',
              now: ops.outstanding === 0 ? 'כל ההחזרות הושלמו.' : `${ops.outstanding} החזרות פתוחות, מהן ${ops.overdue} חרגו מיעד 5 הימים.`,
            }}
          />
          <KpiCard
            label="עלויות קבועות"
            value={money(p.fixedCosts)}
            trendGood="down"
            trendPct={trend(p.fixedCosts, pp.fixedCosts)}
            hint={s.monthCount > 1 ? `${money(p.fixedMonthly)} בממוצע לחודש` : 'שכר · מחסן · תוכנה · ביטוח · מיסים'}
            onOpen={() => setDrill('fixed')}
            empty='רשמי אותן בטאב "כספים"'
            explain={{
              what: 'ההוצאות שאינן תלויות במספר המנויות: משכורות, מחסן, תוכנות, ביטוח ומיסים.',
              how: 'סכום ההוצאות שנרשמו בטאב "כספים" בקטגוריות הקבועות, בתוך התקופה.',
              now: p.fixedCosts
                ? `${money(p.fixedCosts)} בתקופה${s.monthCount > 1 ? ` (${money(p.fixedMonthly)} לחודש)` : ''}.`
                : 'לא נרשמו עלויות קבועות — אפשר לרשום אותן בטאב הכספים.',
            }}
          />
          <KpiCard
            label="עלות גיוס לקוחה (CAC)"
            value={money(p.cac)}
            trendGood="down"
            trendPct={trend(p.cac, pp.cac)}
            empty={p.marketing ? 'לא גויסו לקוחות חדשות בתקופה' : 'לא נרשמו הוצאות שיווק בתקופה'}
            explain={{
              what: 'עלות ממוצעת לגיוס מנויה חדשה.',
              how: 'הוצאות שיווק ומכירה בתקופה ÷ מספר המנויות החדשות.',
              now: p.cac ? `בממוצע עלה ${money(p.cac)} לגייס מנויה חדשה.` : 'צריך גם הוצאות שיווק וגם מנויות חדשות בתקופה.',
            }}
          />
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>תנועת מנויות חודשית</h3>
            <button type="button" className="btn-mini" onClick={() => setDrill('movement')}>טבלה</button>
          </div>
          <MovementChart data={s.movement} />
        </div>

        <p className="cell-sub" style={{ marginTop: 14 }}>
          לניתוח המלא — רווח והפסד, רווחיות לפי לקוחה ומסלול, ניצול מלאי, ביצועי תכשיטים ותזרים מפורט —
          {' '}<Link to="/admin/reports" className="link-gold">טאב "דוחות"</Link>.
        </p>
      </Section>

      {drill === 'movement' && (
        <Drawer title="תנועת מנויות חודשית" sub={periodLabel} onClose={() => setDrill(null)}>
          <table className="admin-table">
            <thead><tr><th>חודש</th><th>פעילות</th><th>הצטרפו</th><th>עזבו</th><th>שינוי נטו</th></tr></thead>
            <tbody>
              {s.movement.map((m) => (
                <tr key={m.label}>
                  <td>{m.label}</td>
                  <td>{m.active}</td>
                  <td>{m.joined}</td>
                  <td>{m.left}</td>
                  <td className={m.joined - m.left >= 0 ? 'pos' : 'neg'}>
                    {m.joined - m.left >= 0 ? '+' : ''}{m.joined - m.left}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <tr><td colSpan="5" style={{ color: 'var(--muted)' }}>לא נרשמו עלויות קבועות בתקופה — אפשר לרשום אותן בטאב "כספים"</td></tr>
              )}
              {p.fixedByCategory.map((f) => (
                <tr key={f.category}>
                  <td>{f.category}</td>
                  <td className="num">{money(f.amount)}</td>
                  <td className="num">{money(f.amount / s.monthCount)}</td>
                  <td>{pct((f.amount / p.fixedCosts) * 100)}</td>
                  <td>{p.totalRevenue > 0 ? pct((f.amount / p.totalRevenue) * 100) : '—'}</td>
                </tr>
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
              {(ops.outstandingBreakdown || []).map((b) => (
                <tr key={b.label}><td>{b.label}</td><td>{b.n}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="cell-sub" style={{ marginTop: 10 }}>לטיפול בהחזרות — טאב "מחסן".</p>
        </Drawer>
      )}
    </div>
  );
}
