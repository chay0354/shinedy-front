import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// חלון קופץ שנפתח כשהלקוחה מנסה להוסיף תכשיט שחורג ממכסת הנקודות.
// שלוש דרכים להתקדם — לפי הסדר שנקבע: שדרוג מנוי · תכשיט אחר · החזרת תכשיט שאצלה.
const OPTIONS = [
  { to: '/plans', title: 'שדרוג המנוי', upgrade: true },
  { to: '/catalog', title: 'בחירת תכשיט אחר' },
  { to: '/exchange', title: 'החזרת תכשיט שאצלך' },
]

// hideUpgrade: הלקוחה כבר במסלול הגבוה ביותר — אין מה להציע לה שדרוג
export default function QuotaDialog({ open, onClose, product, missing, remaining, hideUpgrade }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  if (!open) return null

  function go(to) {
    onClose()
    navigate(to)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="quota-title"
        onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="סגירה">×</button>
        <h2 id="quota-title">עברת את מכסת הנקודות</h2>
        {missing > 0 && <p className="modal-sub">חסרות {missing} נק׳</p>}
        <div className="modal-opts">
          {OPTIONS.filter((o) => !(o.upgrade && hideUpgrade)).map((o) => (
            <button type="button" key={o.to} className="opt-row" onClick={() => go(o.to)}>
              {o.title}
            </button>
          ))}
        </div>
        <button type="button" className="modal-cancel" onClick={onClose}>ביטול</button>
      </div>
    </div>
  )
}
