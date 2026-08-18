import { Fragment, useRef, useState } from 'react'
import { CATEGORIES, PLAN_NAME } from '../../lib/site.js'
import { salePriceFor, unitsAvailable, unitsCleaning, unitsOut, unitsTotal, useAdminDb } from '../../lib/useAdminDb.js'
import Art from '../../components/Art.jsx'

// priceRule — כדי שההגירה ב-store לא תדרוס מחיר שהוזן ידנית לפריט חדש
const EMPTY = { id: '', name: '', sku: '', category: 'טבעות', metal: 'כסף 925', stone: 'מויסנייט', points: 30, price: salePriceFor(200), priceRule: 1, cost: 200, sizes: '', large: false, image: null }

export default function Inventory() {
  const { db, api } = useAdminDb()
  const [edit, setEdit] = useState(null)
  const [saved, setSaved] = useState('')
  // מספרי הפריט גלויים כברירת מחדל; לחיצה על המונה מקפלת דגם ספציפי
  const [closedUnits, setClosedUnits] = useState(() => new Set())
  const fileRef = useRef(null)

  function toggleUnits(pid) {
    setClosedUnits((prev) => {
      const next = new Set(prev)
      if (next.has(pid)) next.delete(pid)
      else next.add(pid)
      return next
    })
  }

  function startEdit(p) {
    setEdit({ ...EMPTY, ...p })
    setSaved('')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function onImage(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setEdit((prev) => ({ ...prev, image: reader.result }))
    reader.readAsDataURL(f)
  }

  function saveEdit(e) {
    e.preventDefault()
    api.saveProduct({
      ...edit,
      id: edit.id || `p-${Date.now()}`,
      points: Number(edit.points),
      price: Number(edit.price),
      cost: Number(edit.cost),
    })
    setSaved(edit.id ? 'התכשיט עודכן ✓' : 'התכשיט נוסף לקטלוג ✓')
    setEdit(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <div className="admin-head-row">
        <h1>ניהול מלאי</h1>
        <button className="btn btn-sm" onClick={() => startEdit(EMPTY)}>+ תכשיט חדש</button>
      </div>
      <p className="admin-sub">
        כל שינוי כאן מתעדכן מיד בקטלוג שבאתר — כולל העלאת צילומי תכשיטים אמיתיים מהמחשב.
      </p>

      {saved && <p className="msg-ok">{saved}</p>}

      {edit && (
        <div className="admin-section">
          <h2>{edit.id ? `עריכת תכשיט — ${edit.name}` : 'תכשיט חדש'}</h2>
          <form className="admin-form" onSubmit={saveEdit}>
            <div className="field"><label>שם</label>
              <input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div className="field"><label>מק״ט</label>
              <input dir="ltr" value={edit.sku || ''} onChange={(e) => setEdit({ ...edit, sku: e.target.value })} placeholder="נוצר אוטומטית אם נשאר ריק" /></div>
            <div className="field"><label>קטגוריה</label>
              <select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select></div>
            <div className="field"><label>מתכת</label>
              <select value={edit.metal} onChange={(e) => setEdit({ ...edit, metal: e.target.value })}>
                <option>כסף 925</option><option>כסף מצופה זהב</option><option>זהב 14K</option><option>זהב 18K</option>
              </select></div>
            <div className="field"><label>אבן</label>
              <select value={edit.stone} onChange={(e) => setEdit({ ...edit, stone: e.target.value })}>
                <option>מויסנייט</option><option>יהלום מעבדה</option><option>ללא אבן</option>
              </select></div>
            <div className="field"><label>נקודות</label>
              <input type="number" min="5" required value={edit.points} onChange={(e) => setEdit({ ...edit, points: e.target.value })} /></div>
            <div className="field"><label>עלות רכישה שלנו (₪)</label>
              <input type="number" min="0" value={edit.cost} onChange={(e) => {
                const cost = e.target.value
                // שינוי העלות מחשב מחדש את מחיר הקנייה (עלות +50% +מע"מ)
                setEdit({ ...edit, cost, price: salePriceFor(cost) })
              }} />
              <span className="cell-sub">קובע את מחיר הקנייה אוטומטית</span></div>
            <div className="field"><label>מחיר קנייה ללקוחה (₪)</label>
              <input type="number" min="0" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} />
              <span className="cell-sub">עלות + 50% + מע״מ 18% — ניתן לשינוי ידני</span></div>
            <div className="field"><label>מידות (לטבעות)</label>
              <input value={edit.sizes || ''} onChange={(e) => setEdit({ ...edit, sizes: e.target.value })} placeholder="48–60" /></div>
            <div className="field"><label>תמונה</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={onImage} />
              {edit.image && <img src={edit.image} alt="" style={{ height: 60, marginTop: 8, objectFit: 'cover' }} />}</div>
            <label className="check-row" style={{ alignSelf: 'end' }}>
              <input type="checkbox" checked={!!edit.large} onChange={(e) => setEdit({ ...edit, large: e.target.checked })} />
              <span>יהלום גדול (מסלול GOLD בלבד)</span>
            </label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'end' }}>
              <button className="btn btn-sm">שמירה</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setEdit(null)}>ביטול</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-section">
        <div className="table-wrap">
          {/* טבלה קומפקטית: פרטים קשורים נערמים באותו תא, כך שהכול נראה בלי גלילה לצדדים */}
          <table className="admin-table inv-table">
            <thead>
              <tr>
                <th>תכשיט</th><th>מק״ט</th><th>פרטים</th><th>מחיר מכירה</th>
                <th>יחידות ומצב</th><th>פעיל</th><th></th>
              </tr>
            </thead>
            <tbody>
              {db.products.map((p) => (
                <Fragment key={p.id}>
                  <tr>
                    <td>
                      <div className="inv-name">
                        <div className="mini-art"><Art product={p} /></div>
                        <div>
                          <b>{p.name}</b>
                          <span className="cell-sub">{p.category}</span>
                        </div>
                      </div>
                    </td>
                    <td dir="ltr"><b>{p.sku}</b></td>
                    <td>
                      {p.metal} · {p.stone}
                      <span className="cell-sub">{p.points} נק׳{PLAN_NAME[p.minPlan] ? ` · ${PLAN_NAME[p.minPlan]}` : ''}</span>
                    </td>
                    <td>
                      <b>₪{Number(p.price || 0).toLocaleString()}</b>
                      <span className="cell-sub">
                        עלות ₪{Number(p.cost || 0).toLocaleString()}{p.costIsEstimate ? ' (אומדן)' : ''}
                      </span>
                    </td>
                    <td>
                      <span className="qty">
                        <button className="qty-btn" title="הסרת יחידה זמינה" onClick={() => api.removeUnit(p.id)}>−</button>
                        <button className="link-btn" title="הצגה/הסתרה של מספרי הפריט" onClick={() => toggleUnits(p.id)}>{unitsTotal(p)}</button>
                        <button className="qty-btn" title="הוספת יחידה חדשה" onClick={() => api.addUnit(p.id)}>+</button>
                      </span>
                      <span className="inv-state">
                        <i className={unitsAvailable(p) > 2 ? 'st-ok' : 'st-warn'}>זמין {unitsAvailable(p)}</i>
                        {' · '}מושכר {unitsOut(p)}
                        {unitsCleaning(p) > 0 && <> · ניקוי {unitsCleaning(p)}</>}
                      </span>
                    </td>
                    <td>
                      <button className="btn-mini" onClick={() => api.toggleAvailable(p.id)}>
                        {p.available ? 'פעיל ✓' : 'מושבת'}
                      </button>
                    </td>
                    <td><button className="btn-mini" onClick={() => startEdit(p)}>עריכה</button></td>
                  </tr>
                  {/* מק״ט של כל מוצר יחיד — גלוי תמיד, בלי צורך בלחיצה */}
                  {!closedUnits.has(p.id) && (
                    <tr>
                      <td colSpan="7" className="units-cell">
                        {p.units.map((u) => (
                          <span key={u.serial} className={`unit-chip ${u.status === 'זמין' ? 'ok' : u.status === 'מושכר' ? 'out' : 'clean'}`}>
                            <span dir="ltr">{u.serial}</span> · {u.status}
                            {u.status === 'בניקוי' && (
                              <button className="btn-mini" style={{ marginInlineStart: 8 }} onClick={() => api.finishCleaning(p.id, u.serial)}>סיום ניקוי ✓</button>
                            )}
                          </span>
                        ))}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
