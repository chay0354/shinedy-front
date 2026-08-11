import { useEffect, useState } from 'react'

// כרטיס מדד: מספר גדול, שם קטן, מגמה מתחת, ו-[+] עדין עם הסבר
export function KpiCard({ label, value, unit, trendPct, trendGood = 'up', hint, explain, onOpen, empty }) {
  const [open, setOpen] = useState(false)
  const show = value !== null && value !== undefined
  const dir = trendPct === null || trendPct === undefined ? null : (trendPct >= 0 ? 'up' : 'down')
  const good = dir && (trendGood === 'up' ? dir === 'up' : dir === 'down')

  return (
    <div className={`kpi-card${onOpen && show ? ' clickable' : ''}`} onClick={onOpen && show ? onOpen : undefined}>
      <div className="kpi-head">
        <span className="kpi-label">{label}</span>
        {explain && (
          <span className="kpi-info-wrap" onClick={(e) => e.stopPropagation()}>
            <button
              type="button" className="kpi-info" aria-label={`הסבר על ${label}`}
              onClick={() => setOpen((v) => !v)}
            >+</button>
            <span className={`kpi-pop${open ? ' open' : ''}`}>
              <b>מה זה?</b>
              <span>{explain.what}</span>
              <b>איך מחושב?</b>
              <span>{explain.how}</span>
              <b>הנתון שלך</b>
              <span>{explain.now}</span>
            </span>
          </span>
        )}
      </div>
      {show ? (
        <>
          <div className="kpi-value">{value}{unit && <small>{unit}</small>}</div>
          {trendPct !== null && trendPct !== undefined && (
            <div className={`kpi-trend ${good ? 'good' : 'bad'}`}>
              {dir === 'up' ? '↑' : '↓'} {Math.abs(trendPct).toFixed(1)}% מול התקופה הקודמת
            </div>
          )}
          {hint && <div className="kpi-hint">{hint}</div>}
        </>
      ) : (
        <>
          <div className="kpi-value empty">—</div>
          <div className="kpi-hint">{empty || 'אין מספיק נתונים'}</div>
        </>
      )}
      {onOpen && show && <div className="kpi-more">לפירוט ←</div>}
    </div>
  )
}

// מגירת Drill-down — הדוחות המפורטים לא מוצגים בדשבורד הראשי
export function Drawer({ title, sub, onClose, children }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <h2>{title}</h2>
            {sub && <p className="cell-sub">{sub}</p>}
          </div>
          <button className="btn-mini" onClick={onClose}>סגירה ✕</button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  )
}

export function Section({ title, note, children }) {
  return (
    <section className="kpi-section">
      <div className="kpi-section-head">
        <h2>{title}</h2>
        {note && <span className="cell-sub">{note}</span>}
      </div>
      {children}
    </section>
  )
}
