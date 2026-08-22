import { Fragment, useMemo, useRef, useState } from 'react'
import { CATEGORIES, PLAN_NAME } from '../../lib/site.js'
import { salePriceFor, unitsAvailable, unitsCleaning, unitsOut, unitsTotal, useAdminDb } from '../../lib/useAdminDb.js'
import Art from '../../components/Art.jsx'

const EMPTY = {
  id: '',
  name: '',
  sku: '',
  category: 'טבעות',
  metal: 'כסף 925',
  stone: 'מויסנייט',
  points: 30,
  price: salePriceFor(200),
  priceRule: 1,
  cost: 200,
  sizes: '',
  large: false,
  image: null,
}

export default function Inventory() {
  const { db, api } = useAdminDb()
  const [edit, setEdit] = useState(null)
  const [saved, setSaved] = useState('')
  const [closedUnits, setClosedUnits] = useState(() => new Set())
  const fileRef = useRef(null)

  const byCategory = useMemo(() => {
    const products = db.products || []
    const groups = CATEGORIES.map((cat) => ({
      category: cat,
      items: products.filter((p) => p.category === cat),
    })).filter((g) => g.items.length > 0)
    const known = new Set(CATEGORIES)
    const extra = products.filter((p) => !known.has(p.category))
    if (extra.length) groups.push({ category: 'אחר', items: extra })
    return groups
  }, [db.products])

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

  async function saveEdit(e) {
    e.preventDefault()
    const ok = await api.saveProduct({
      ...edit,
      points: Number(edit.points),
      price: Number(edit.price),
      cost: Number(edit.cost),
    })
    if (!ok) return
    setSaved(edit.id ? 'התכשיט עודכן ✓' : 'הדגם נוסף למלאי ✓')
    setEdit(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <div className="admin-head-row">
        <h1>ניהול מלאי</h1>
        <button className="btn btn-sm" onClick={() => startEdit(EMPTY)}>+ דגם חדש</button>
      </div>
      <p className="admin-sub">
        לפי סוג ודגם: מק״ט של המוצר, כמה יחידות יש במלאי וכמה מהן זמינות. כל יחידה פיזית מקבלת מק״ט משלה מתחת לדגם.
      </p>

      {saved && <p className="msg-ok">{saved}</p>}

      {edit && (
        <div className="admin-section" style={{ marginTop: 18 }}>
          <h2>{edit.id ? `עריכת דגם — ${edit.name}` : 'דגם חדש'}</h2>
          <form className="admin-form" onSubmit={saveEdit}>
            <div className="field"><label>שם</label>
              <input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div className="field"><label>מק״ט דגם</label>
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

      {byCategory.map((group) => (
        <div className="admin-section" key={group.category} style={{ marginTop: 18 }}>
          <h2 className="inv-cat-title">{group.category}</h2>
          <div className="table-wrap">
            <table className="admin-table inv-table">
              <thead>
                <tr>
                  <th>דגם</th>
                  <th>מק״ט</th>
                  <th>פרטים</th>
                  <th>מחיר מכירה</th>
                  <th>יחידות ומצב</th>
                  <th>פעיל</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((p) => {
                  const total = unitsTotal(p) || (p.available ? 1 : 0)
                  const avail = unitsAvailable(p)
                  const out = unitsOut(p)
                  const cleaning = unitsCleaning(p)
                  const units = p.units || []
                  return (
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
                        <td dir="ltr"><b>{p.sku || p.id}</b></td>
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
                            <button type="button" className="qty-btn" title="הסרת יחידה זמינה" onClick={() => api.removeUnit(p.id)}>−</button>
                            <button type="button" className="link-btn" title="הצגה/הסתרה של מק״טי היחידות" onClick={() => toggleUnits(p.id)}>{total}</button>
                            <button type="button" className="qty-btn" title="הוספת יחידה חדשה" onClick={() => api.addUnit(p.id)}>+</button>
                          </span>
                          <span className="inv-state">
                            <i className={avail > 2 ? 'st-ok' : 'st-warn'}>זמין {avail}</i>
                            {' · '}מושכר {out}
                            {cleaning > 0 && <> · ניקוי {cleaning}</>}
                          </span>
                        </td>
                        <td>
                          <button type="button" className="btn-mini" onClick={() => api.toggleAvailable(p.id)}>
                            {p.available !== false ? 'פעיל ✓' : 'מושבת'}
                          </button>
                        </td>
                        <td>
                          <button type="button" className="btn-mini" onClick={() => startEdit(p)}>עריכה</button>
                        </td>
                      </tr>
                      {!closedUnits.has(p.id) && units.length > 0 && (
                        <tr>
                          <td colSpan="7" className="units-cell">
                            {units.map((u) => (
                              <span key={u.serial} className={`unit-chip ${u.status === 'זמין' ? 'ok' : u.status === 'מושכר' || u.status === 'אצל לקוחה' ? 'out' : 'clean'}`}>
                                <span dir="ltr">{u.serial}</span> · {u.status}
                                {(u.status === 'בניקוי' || u.status === 'בתיקון') && (
                                  <button type="button" className="btn-mini" style={{ marginInlineStart: 8 }} onClick={() => api.finishCleaning(p.id, u.serial)}>
                                    {u.status === 'בתיקון' ? 'סיום תיקון ✓' : 'סיום ניקוי ✓'}
                                  </button>
                                )}
                              </span>
                            ))}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {byCategory.length === 0 && (
        <p className="admin-sub">אין דגמים במלאי עדיין.</p>
      )}
    </>
  )
}
