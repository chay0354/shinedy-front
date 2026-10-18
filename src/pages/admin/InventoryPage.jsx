import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { api as liveApi } from '../../api.js'
import { CATEGORIES, PLAN_NAME } from '../../lib/site.js'
import { salePriceFor, unitsTotal, useAdminDb } from '../../lib/useAdminDb.js'
import Art from '../../components/Art.jsx'
import AdminUserCell from '../../components/AdminUserCell.jsx'
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

function unitCounts(units) {
  const c = { avail: 0, rented: 0, cleaning: 0, ordering: 0 }
  for (const u of units) {
    if (u.status === 'זמין') c.avail += 1
    else if (u.status === 'מושכר' || u.status === 'אצל לקוחה') c.rented += 1
    else if (u.status === 'בניקוי' || u.status === 'בתיקון') c.cleaning += 1
    else if (u.status === 'בדרך ללקוחה' || u.status === 'בדרך חזרה') c.ordering += 1
  }
  return c
}

function unitStatusLabel(status) {
  if (status === 'זמין') return 'זמין במלאי'
  if (status === 'מושכר' || status === 'אצל לקוחה') return 'מושכר אצל לקוחה'
  if (status === 'בניקוי') return 'בניקוי'
  if (status === 'בתיקון') return 'בתיקון'
  if (status === 'בדרך ללקוחה' || status === 'בדרך חזרה') return 'בתהליך הזמנה'
  return status
}

function unitChipClass(status) {
  if (status === 'זמין') return 'ok'
  if (status === 'מושכר' || status === 'אצל לקוחה') return 'out'
  if (status === 'בדרך ללקוחה' || status === 'בדרך חזרה') return 'order'
  return 'clean'
}

function favDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('he-IL')
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
  const [favOnly, setFavOnly] = useState(false)
  const [favRows, setFavRows] = useState([])
  const [favOpen, setFavOpen] = useState(() => new Set())
  const [skuLabels, setSkuLabels] = useState(null)
  const [unitFor, setUnitFor] = useState(null)
  const [unitCode, setUnitCode] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    let alive = true
    liveApi
      .adminFavorites()
      .then((data) => { if (alive) setFavRows(data.favorites || []) })
      .catch(() => { if (alive) setFavRows([]) })
    return () => { alive = false }
  }, [])

  const fansByProduct = useMemo(() => {
    const users = new Map((db.users || []).map((u) => [u.id, u]))
    const groups = new Map()
    for (const r of favRows) {
      if (!groups.has(r.productId)) groups.set(r.productId, [])
      groups.get(r.productId).push({
        ...r,
        user: users.get(r.userId) || { id: r.userId, name: r.name || r.email, phone: r.phone, plan: r.planId },
      })
    }
    for (const fans of groups.values()) {
      fans.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    }
    return groups
  }, [favRows, db.users])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (db.products || []).filter((p) =>
      matchesMaterial(p, material)
      && (category === 'all' || p.category === category)
      && (!favOnly || (fansByProduct.get(p.id) || []).length > 0)
      && matchesQuery(p, q),
    )
  }, [db.products, material, category, query, favOnly, fansByProduct])

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

  function toggleFans(pid) {
    setFavOpen((prev) => {
      const next = new Set(prev)
      if (next.has(pid)) next.delete(pid)
      else next.add(pid)
      return next
    })
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
          <button
            type="button"
            className={`subtab${favOnly ? ' on' : ''}`}
            onClick={() => setFavOnly((v) => !v)}
          >
            מועדפים
          </button>
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
                  <th>מועדפים</th>
                  <th>פעיל</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((p) => {
                  const total = unitsTotal(p) || (p.available ? 1 : 0)
                  const units = p.units || []
                  const counts = unitCounts(units)
                  const fans = fansByProduct.get(p.id) || []
                  const fansOpen = favOpen.has(p.id)
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
                            <i className={counts.avail > 0 ? 'st-ok' : 'st-warn'}>זמין במלאי {counts.avail}</i>
                            {counts.rented > 0 && <> · מושכר אצל לקוחה {counts.rented}</>}
                            {counts.cleaning > 0 && <> · בניקוי {counts.cleaning}</>}
                            {counts.ordering > 0 && <> · בתהליך הזמנה {counts.ordering}</>}
                          </span>
                        </td>
                        <td>
                          {fans.length > 0 ? (
                            <button type="button" className="btn-mini" onClick={() => toggleFans(p.id)}>
                              {fansOpen ? 'הסתרה' : `${fans.length} לקוחות`}
                            </button>
                          ) : (
                            <span className="cell-sub">—</span>
                          )}
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
                      {fansOpen && fans.length > 0 && (
                        <tr>
                          <td colSpan="8" className="units-cell">
                            <div className="cell-sub" style={{ marginBottom: 8 }}>לקוחות ששמרו את הדגם במועדפים</div>
                            <table className="admin-table">
                              <tbody>
                                {fans.map((f) => (
                                  <tr key={f.userId}>
                                    <td><AdminUserCell db={db} user={f.user} name={f.name || f.email} /></td>
                                    <td dir="ltr">{f.email}</td>
                                    <td>{favDate(f.createdAt)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                      {!closedUnits.has(p.id) && (units.length > 0 || unitFor === p.id) && (
                        <tr>
                          <td colSpan="8" className="units-cell">
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
                              <span key={u.serial} className={`unit-chip ${unitChipClass(u.status)}`}>
                                <span dir="ltr">{u.serial}</span> · {unitStatusLabel(u.status)}
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
