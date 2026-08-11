import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { CATEGORIES } from '../../lib/site';
import Art from '../../components/Art';

const STONES = ['מויסנייט', 'יהלום', 'ללא אבן'];
const SORTS = [
  { id: 'default', label: 'מומלץ' },
  { id: 'points-asc', label: 'נקודות: מהנמוכות לגבוהות' },
  { id: 'points-desc', label: 'נקודות: מהגבוהות לנמוכות' },
  { id: 'name', label: 'לפי שם' },
];

export default function CatalogPage() {
  const { state } = useApp();
  const [cat, setCat] = useState('הכל');
  const [stone, setStone] = useState('הכל');
  const [sort, setSort] = useState('default');

  const items = useMemo(() => {
    const products = state?.products || [];
    let list = products.filter(
      (p) =>
        (cat === 'הכל' || p.category === cat) &&
        (stone === 'הכל' ||
          p.stone?.includes(stone) ||
          (stone === 'ללא אבן' && p.stone === 'ללא אבן')),
    );
    if (sort === 'points-asc') list = [...list].sort((a, b) => a.points - b.points);
    if (sort === 'points-desc') list = [...list].sort((a, b) => b.points - a.points);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'he'));
    return list;
  }, [state?.products, cat, stone, sort]);

  return (
    <>
      <div className="page-head container">
        <h1>קטלוג תכשיטים</h1>
      </div>

      <section className="section" style={{ paddingTop: 36 }}>
        <div className="container">
          <div className="catalog-toolbar">
            <div className="tabs">
              {['הכל', ...CATEGORIES].map((c) => (
                <button key={c} type="button" className={`tab${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="toolbar-selects">
              <select
                className="select"
                value={stone}
                onChange={(e) => setStone(e.target.value)}
                aria-label="סינון לפי אבן"
              >
                <option value="הכל">כל האבנים</option>
                {STONES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="מיון">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="products-grid">
            {items.map((p) => (
              <Link to={`/catalog/${p.id}`} key={p.id} className="product-card">
                <div className="art">
                  <Art product={p} />
                </div>
                <div className="info">
                  <div className="name">{p.name}</div>
                  <div className="meta">
                    {p.metal} · {p.stone}
                  </div>
                  <div className="row">
                    <span className="points-badge">{p.points} נק׳</span>
                    {!p.inStock && <span className="oos">אזל מהמלאי</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {items.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--muted)' }}>אין פריטים תואמים כרגע.</p>
          )}
        </div>
      </section>
    </>
  );
}
