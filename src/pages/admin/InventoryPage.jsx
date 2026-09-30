import { Fragment, useMemo, useRef, useState } from 'react'
import { CATEGORIES, PLAN_NAME } from '../../lib/site.js'
import { salePriceFor, unitsAvailable, unitsCleaning, unitsOut, unitsTotal, useAdminDb } from '../../lib/useAdminDb.js'
import Art from '../../components/Art.jsx'
import PrintLabels, { SkuLabel } from '../../components/PrintLabels.jsx'

function skuLabelsFor(p, units) {
  const sku = p.sku || p.id
  const details = [p.metal, p.stone].filter(Boolean).join(' · ')
  if (!units.length) return [{ key: sku, name: p.name, sku, details }]
  return units.map((u) => ({ key: u.serial, name: p.name, sku, serial: u.serial, details }))
}

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

const METALS = ['כסף 925', 'כסף', 'כסף מצופה זהב', 'זהב 14K', 'זהב 18K', 'זהב צהוב', 'זהב רוזה']
const STONES = ['מויסנייט', 'יהלום מעבדה', 'ללא אבן']

const MATERIALS = [
  { id: 'all', label: 'הכול' },
  { id: 'silver', label: 'כסף' },
  { id: 'gold', label: 'זהב' },
  { id: 'diamond', label: 'יהלום' },
]

function matchesMaterial(p, material) {
  const metal = String(p.metal || '')
  const stone = String(p.stone || '')
  if (material === 'silver') return metal.includes('כסף')
  if (material === 'gold') return metal.includes('זהב')
  if (material === 'diamond') return stone.includes('יהלום') || Boolean(p.large)
  return true
}

function matchesQuery(p, q) {
  if (!q) return true
  const code = q.replace(/[\s\-_.]/g, '')
  const fields = [p.name, p.sku, p.id, ...(p.units || []).map((u) => u.serial)]
  return fields.some((v) => {
    const s = String(v || '').toLowerCase()
    return s.includes(q) || (code && s.replace(/[\s\-_.]/g, '').includes(code))
  })
}

function withCurrent(options, value) {
  return value && !options.includes(value) ? [value, ...options] : options
}

export default function Inventory() {
  const { db, api } = useAdminDb()
  const [edit, setEdit] = useState(null)
  const [saved, setSaved] = useState('')
  const [closedUnits, setClosedUnits] = useState(() => new Set())
  const [material, setMaterial] = useState('all')
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [skuLabels, setSkuLabels] = useState(null)
  const [unitFor, setUnitFor] = useState(null)
  const [unitCode, setUnitCode] = useState('')
  const fileRef = useRef(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (db.products || []).filter((p) =>
      matchesMaterial(p, material)
      && (category === 'all' || p.category === category)
      && matchesQuery(p, q),
    )
  }, [db.products, material, category, query])

  const byCategory = useMemo(() => {
    const groups = CATEGORIES.map((cat) => ({
      category: cat,
      items: filtered.filter((p) => p.category === cat),
    })).filter((g) => g.items.length > 0)
    const known = new Set(CATEGORIES)
    const extra = filtered.filter((p) => !known.has(p.category))
    if (extra.length) groups.push({ category: 'אחר', items: extra })
    return groups
  }, [filtered])

  const totalModels = (db.products || []).length

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
    const isNew = !edit.id
    const code = String(edit.sku || '').trim().toUpperCase().replace(/\s+/g, '')
    setSaved(isNew ? `הדגם נוסף. הברקוד הוא ${code}` : 'התכשיט עודכן ✓')
    if (isNew) setSkuLabels(skuLabelsFor({ ...edit, sku: code, id: code }, [{ serial: code }]))
    setEdit(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function startAddUnit(pid) {
    setUnitFor(pid)
    setUnitCode('')
    setClosedUnits((prev) => {
      const next = new Set(prev)
      next.delete(pid)
      return next
    })
  }

  async function submitUnit(p, e) {
    e.preventDefault()
    const code = unitCode.trim().toUpperCase().replace(/\s+/g, '')
    if (!code) return
    const ok = await api.addUnit(p.id, code)
    if (!ok) return
    setUnitFor(null)
    setUnitCode('')
    setSkuLabels(skuLabelsFor(p, [{ serial: code }]))
  }

  return (
    <>
      <div className="admin-head-row">
        <h1>ניהול מלאי</h1>
        <button className="btn btn-sm" onClick={() => startEdit(EMPTY)}>+ דגם חדש</button>
      </div>
      <p className="admin-sub">
        כשמוסיפים דגם בוחרים לו קוד. הקוד הזה הוא מספר הדגם, וגם הברקוד שנוצר למדבקה. יחידה נוספת מקבלת קוד משלה, והוא הברקוד שלה.
      </p>

      {saved && <p className="msg-ok">{saved}</p>}

      {edit && (
        <div className="admin-section" style={{ marginTop: 18 }}>
          <h2>{edit.id ? `עריכת דגם — ${edit.name}` : 'דגם חדש'}</h2>
          <form className="admin-form" onSubmit={saveEdit}>
            <div className="field"><label>שם</label>
              <input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div className="field"><label>מספר דגם (מק״ט)</label>
              <input
                dir="ltr"
                required={!edit.id}
                value={edit.sku || ''}
                onChange={(e) => setEdit({ ...edit, sku: e.target.value })}
                placeholder="למשל E08"
              />
              {!edit.id && <span className="cell-sub">הקוד שתבחרי הוא הברקוד. אותיות באנגלית, ספרות ומקף</span>}
            </div>
            <div className="field"><label>קטגוריה</label>
              <select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select></div>
            <div className="field"><label>מתכת</label>
              <select value={edit.metal} onChange={(e) => setEdit({ ...edit, metal: e.target.value })}>
                {withCurrent(METALS, edit.metal).map((m) => <option key={m}>{m}</option>)}
              </select></div>
            <div className="field"><label>אבן</label>
              <select value={edit.stone} onChange={(e) => setEdit({ ...edit, stone: e.target.value })}>
                {withCurrent(STONES, edit.stone).map((s) => <option key={s}>{s}</option>)}
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

      <div className="admin-section inv-filters" style={{ marginTop: 18 }}>
        <div className="subtabs" role="group" aria-label="סינון לפי חומר">
          {MATERIALS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`subtab${material === m.id ? ' on' : ''}`}
              onClick={() => setMaterial(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="kpi-filters" style={{ marginBottom: 0 }}>
          <div className="filter-group">
            <label>סוג תכשיט</label>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">כל הסוגים</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group" style={{ flex: 1 }}>
            <label>חיפוש</label>
            <input
              className="select admin-search"
              style={{ width: '100%' }}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="שם, מספר דגם או מספר מוצר (למשל E08 או E08-3)"
            />
          </div>
          <span className="cell-sub" style={{ alignSelf: 'end' }}>{filtered.length} מתוך {totalModels} דגמים</span>
        </div>
      </div>

      {byCategory.map((group) => (
        <div className="admin-section" key={group.category} style={{ marginTop: 18 }}>
          <h2 className="inv-cat-title">{group.category}</h2>
          <div className="table-wrap">
            <table className="admin-table inv-table">
              <thead>
                <tr>
                  <th>דגם</th>
                  <th>מספר דגם</th>
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
                            <button type="button" className="qty-btn" title="הוספת יחידה לפי קוד" onClick={() => startAddUnit(p.id)}>+</button>
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
                          <div className="btn-stack">
                            <button type="button" className="btn-mini" onClick={() => startEdit(p)}>עריכה</button>
                            <button type="button" className="btn-mini" onClick={() => setSkuLabels(skuLabelsFor(p, units))}>
                              {units.length > 1 ? `מדבקות מק״ט (${units.length})` : 'מדבקת מק״ט'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {!closedUnits.has(p.id) && (units.length > 0 || unitFor === p.id) && (
                        <tr>
                          <td colSpan="7" className="units-cell">
                            {unitFor === p.id && (
                              <form className="unit-add" onSubmit={(e) => submitUnit(p, e)}>
                                <input
                                  dir="ltr"
                                  required
                                  autoFocus
                                  value={unitCode}
                                  onChange={(e) => setUnitCode(e.target.value)}
                                  placeholder="קוד לברקוד"
                                  aria-label="קוד לברקוד"
                                />
                                <button type="submit" className="btn-mini">יצירת ברקוד</button>
                                <button type="button" className="btn-mini" onClick={() => setUnitFor(null)}>ביטול</button>
                              </form>
                            )}
                            {units.map((u) => (
                              <span key={u.serial} className={`unit-chip ${u.status === 'זמין' ? 'ok' : u.status === 'מושכר' || u.status === 'אצל לקוחה' ? 'out' : 'clean'}`}>
                                <span dir="ltr">{u.serial}</span> · {u.status}
                                <button type="button" className="link-btn" title="הדפסת מדבקת מק״ט ליחידה" onClick={() => setSkuLabels(skuLabelsFor(p, [u]))}>מדבקה</button>
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
        <p className="admin-sub">{totalModels ? 'לא נמצאו דגמים לפי הסינון.' : 'אין דגמים במלאי עדיין.'}</p>
      )}

      {skuLabels && (
        <PrintLabels
          title={skuLabels.length > 1 ? `מדבקות מק״ט (${skuLabels.length})` : 'מדבקת מק״ט'}
          width={50}
          height={30}
          onClose={() => setSkuLabels(null)}
        >
          {skuLabels.map(({ key, ...l }) => <SkuLabel key={key} {...l} />)}
        </PrintLabels>
      )}
    </>
  )
}
