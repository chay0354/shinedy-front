import { Fragment, useEffect, useMemo, useState } from 'react'
import { api as liveApi } from '../../api.js'
import { CATEGORIES } from '../../lib/site.js'
import { useAdminDb } from '../../lib/useAdminDb.js'
import Art from '../../components/Art.jsx'
import AdminUserCell from '../../components/AdminUserCell.jsx'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('he-IL')
}

export default function AdminFavoritesPage() {
  const { db } = useAdminDb()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(() => new Set())

  useEffect(() => {
    let alive = true
    liveApi
      .adminFavorites()
      .then((data) => { if (alive) setRows(data.favorites || []) })
      .catch((e) => { if (alive) { setError(e.message || 'טעינת המועדפים נכשלה'); setRows([]) } })
    return () => { alive = false }
  }, [])

  const models = useMemo(() => {
    const products = new Map((db.products || []).map((p) => [p.id, p]))
    const users = new Map((db.users || []).map((u) => [u.id, u]))
    const groups = new Map()
    for (const r of rows || []) {
      const product = products.get(r.productId) || { id: r.productId, name: r.productId, category: 'אחר' }
      if (!groups.has(r.productId)) groups.set(r.productId, { product, fans: [] })
      groups.get(r.productId).fans.push({
        ...r,
        user: users.get(r.userId) || { id: r.userId, name: r.name || r.email, phone: r.phone, plan: r.planId },
      })
    }
    return [...groups.values()]
      .map((g) => ({ ...g, fans: g.fans.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) }))
      .sort((a, b) => b.fans.length - a.fans.length || String(a.product.name).localeCompare(String(b.product.name), 'he'))
  }, [rows, db.products, db.users])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const code = q.replace(/[\s\-_.]/g, '')
    return models.filter(({ product: p }) => {
      if (category !== 'all' && p.category !== category) return false
      if (!q) return true
      return [p.name, p.sku, p.id].some((v) => {
        const s = String(v || '').toLowerCase()
        return s.includes(q) || (code && s.replace(/[\s\-_.]/g, '').includes(code))
      })
    })
  }, [models, category, query])

  const totalFans = new Set((rows || []).map((r) => r.userId)).size

  function toggle(id) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      <div className="admin-head-row">
        <h1>מועדפים</h1>
      </div>
      <p className="admin-sub">
        אילו דגמים לקוחות שמרו במועדפים — לפי מספר דגם, מהפופולרי ביותר. {rows ? `${models.length} דגמים · ${totalFans} לקוחות` : ''}
      </p>

      {error && <p className="msg-err">{error}</p>}

      <div className="admin-section inv-filters" style={{ marginTop: 18 }}>
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
              placeholder="שם או מספר דגם (למשל E08)"
            />
          </div>
        </div>
      </div>

      <div className="admin-section" style={{ marginTop: 18 }}>
        {rows === null ? (
          <p className="admin-sub">טוען...</p>
        ) : filtered.length === 0 ? (
          <p className="admin-sub">{models.length ? 'לא נמצאו דגמים לפי הסינון.' : 'עדיין אין תכשיטים במועדפים של לקוחות.'}</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table inv-table">
              <thead>
                <tr>
                  <th>דגם</th>
                  <th>מספר דגם</th>
                  <th>קטגוריה</th>
                  <th>מועדפים</th>
                  <th>זמין במלאי</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ product: p, fans }) => {
                  const avail = (p.units || []).filter((u) => u.status === 'זמין').length
                  const isOpen = open.has(p.id)
                  return (
                    <Fragment key={p.id}>
                      <tr>
                        <td>
                          <div className="inv-name">
                            <div className="mini-art"><Art product={p} /></div>
                            <b>{p.name}</b>
                          </div>
                        </td>
                        <td dir="ltr"><b>{p.sku || p.id}</b></td>
                        <td>{p.category}</td>
                        <td><b>{fans.length}</b></td>
                        <td>{p.units ? avail : '—'}</td>
                        <td>
                          <button type="button" className="btn-mini" onClick={() => toggle(p.id)}>
                            {isOpen ? 'הסתרה' : 'מי שמרה'}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan="6" className="units-cell">
                            <table className="admin-table">
                              <tbody>
                                {fans.map((f) => (
                                  <tr key={f.userId}>
                                    <td><AdminUserCell db={db} user={f.user} name={f.name || f.email} /></td>
                                    <td dir="ltr">{f.email}</td>
                                    <td>{formatDate(f.createdAt)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
