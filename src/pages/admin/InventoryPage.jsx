import { useMemo, useRef, useState } from 'react'
import { CATEGORIES, PLAN_NAME } from '../../lib/site.js'
import { salePriceFor, useAdminDb } from '../../lib/useAdminDb.js'
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

const STATUS_FILTERS = [
  { id: 'הכל', label: 'הכל' },
  { id: 'זמין', label: 'זמין' },
  { id: 'out', label: 'אצל לקוחה' },
  { id: 'בניקוי', label: 'ניקוי / תיקון' },
]

const OUT_STATUSES = ['מושכר', 'אצל לקוחה', 'בדרך ללקוחה', 'בדרך חזרה']

function pillClass(status) {
  if (status === 'זמין') return 'ok'
  if (OUT_STATUSES.includes(status) || status === 'שמור' || status === 'נמכר') return 'info'
  return 'warn'
}

function matchesFilter(status, filter) {
  if (filter === 'הכל') return true
  if (filter === 'out') return OUT_STATUSES.includes(status)
  if (filter === 'בניקוי') return status === 'בניקוי' || status === 'בתיקון'
  return status === filter
}

export default function Inventory() {
  const { db, api } = useAdminDb()
  const [edit, setEdit] = useState(null)
  const [saved, setSaved] = useState('')
  const [filter, setFilter] = useState('הכל')
  const fileRef = useRef(null)

  const items = useMemo(() => {
    const rows = []
    for (const p of db.products || []) {
      const units = p.units || []
      if (units.length === 0) {
        rows.push({
          key: p.id,
          product: p,
          serial: p.sku || p.id,
          status: p.available ? 'זמין' : 'מושבת',
        })
        continue
      }
      for (const u of units) {
        rows.push({
          key: u.serial,
          product: p,
          serial: u.serial,
          status: u.status,
        })
      }
    }
    return rows
  }, [db.products])

  const visible = items.filter((row) => matchesFilter(row.status, filter))

  function startEdit(p, serial) {
    setEdit({ ...EMPTY, ...p, serial: serial || p.sku || '' })
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
    setSaved(edit.id ? 'התכשיט עודכן ✓' : 'התכשיט נוסף למלאי ✓')
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
        כל שורה היא תכשיט פיזי אחד במלאי — לא דגם עם כמה עותקים. תכשיט חדש נכנס לקטלוג כיחידה זמינה.
      </p>

      {saved && <p className="msg-ok">{saved}</p>}

      {edit && (
        <div className="admin-section" style={{ marginTop: 18 }}>
          <h2>{edit.id ? `עריכת תכשיט — ${edit.name}` : 'תכשיט חדש'}</h2>
          <form className="admin-form" onSubmit={saveEdit}>
            <div className="field"><label>שם</label>
              <input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div className="field"><label>מק״ט</label>
              <input
                dir="ltr"
                value={edit.id ? (edit.serial || edit.sku || edit.id) : (edit.sku || '')}
                onChange={(e) => setEdit({ ...edit, sku: e.target.value })}
                placeholder="נוצר אוטומטית אם נשאר ריק"
                disabled={Boolean(edit.id)}
              />
              {edit.id && <span className="cell-sub">מזהה ייחודי של הפריט</span>}
            </div>
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

      <div className="subtabs" style={{ marginTop: 22 }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`subtab${filter === f.id ? ' on' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="subtab-badge">
              {items.filter((row) => matchesFilter(row.status, f.id)).length}
            </span>
          </button>
        ))}
      </div>

      <div className="admin-section" style={{ marginTop: 8 }}>
        <div className="table-wrap">
          <table className="admin-table inv-table">
            <thead>
              <tr>
                <th>תכשיט</th>
                <th>מק״ט</th>
                <th>פרטים</th>
                <th>מחיר מכירה</th>
                <th>מצב</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const p = row.product
                return (
                  <tr key={row.key}>
                    <td>
                      <div className="inv-name">
                        <div className="mini-art"><Art product={p} /></div>
                        <div>
                          <b>{p.name}</b>
                          <span className="cell-sub">{p.category}</span>
                        </div>
                      </div>
                    </td>
                    <td dir="ltr"><b>{row.serial}</b></td>
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
                      <span className={`pill ${pillClass(row.status)}`}>{row.status}</span>
                      {(row.status === 'בניקוי' || row.status === 'בתיקון') && (
                        <div style={{ marginTop: 8 }}>
                          <button className="btn-mini" onClick={() => api.finishCleaning(p.id, row.serial)}>
                            {row.status === 'בתיקון' ? 'סיום תיקון ✓' : 'סיום ניקוי ✓'}
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <button className="btn-mini" onClick={() => startEdit(p, row.serial)}>עריכה</button>
                    </td>
                  </tr>
                )
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ color: 'var(--muted)', textAlign: 'center' }}>
                    אין תכשיטים במצב הזה.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
