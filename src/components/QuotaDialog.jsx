import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// hideUpgrade: הלקוחה כבר במסלול הגבוה ביותר — אין מה להציע לה שדרוג
export default function QuotaDialog({
  open,
  onClose,
  missing,
  hideUpgrade,
  upgradeTo = '/account/plans',
}) {
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
        <h2 id="quota-title">אין מספיק נקודות במינוי שברשותך</h2>
        {missing > 0 && <p className="modal-sub">חסרות {missing} נק׳ לפריט הזה</p>}
        <div className={`modal-opts quota-opts${hideUpgrade ? ' quota-opts-single' : ''}`}>
          {!hideUpgrade && (
            <button type="button" className="btn btn-tan" onClick={() => go(upgradeTo)}>
              לשדרוג המנוי
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={() => go('/exchange')}>
            להחזרת פריט
          </button>
        </div>
      </div>
    </div>
  )
}
