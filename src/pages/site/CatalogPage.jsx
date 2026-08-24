import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import ProductCard from '../../components/ProductCard';

const CATALOG_TABS = [
  { id: 'הכל', label: 'כל הקולקציות' },
  { id: 'טבעות', label: 'טבעות' },
  { id: 'עגילים', label: 'עגילים' },
  { id: 'שרשראות', label: 'שרשראות ותליונים' },
  { id: 'צמידים', label: 'צמידים' },
  { id: 'new', label: 'NEW IN', latin: true },
];

const TYPE_OPTIONS = [
  'כסף 925',
  'כסף מצופה זהב',
  'זהב 14K',
  'מויסנייט',
  'יהלום מעבדה',
  'ללא אבן',
];

const SORTS = [
  { id: 'default', label: 'מומלץ' },
  { id: 'type', label: 'לפי סוג' },
  { id: 'name', label: 'לפי שם' },
  { id: 'points-asc', label: 'נקודות: מהנמוכות לגבוהות' },
  { id: 'points-desc', label: 'נקודות: מהגבוהות לנמוכות' },
];

const NEW_IN_COUNT = 6;

function matchesType(product, type) {
  if (type === 'הכל') return true;
  if (product.metal === type || product.category === type) return true;
  const stone = product.stone || '';
  if (type === 'ללא אבן') return stone === 'ללא אבן';
  return stone.includes(type);
}

export default function CatalogPage() {
  const { state } = useApp();
  const [params] = useSearchParams();
  const searchQ = (params.get('q') || '').trim();
  const [cat, setCat] = useState('הכל');
  const [type, setType] = useState('הכל');
  const [sort, setSort] = useState('default');
  const products = state?.products || [];

  const items = useMemo(() => {
    const newInIds = new Set(products.slice(0, NEW_IN_COUNT).map((p) => p.id));
    let list = products.filter((p) => {
      const byCat = cat === 'הכל' || (cat === 'new' ? newInIds.has(p.id) : p.category === cat);
      const byType = matchesType(p, type);
      const bySearch =
        !searchQ ||
        [p.name, p.metal, p.stone, p.category].some((v) =>
          String(v || '').includes(searchQ),
        );
      return byCat && byType && bySearch;
    });
    if (sort === 'type') {
      list = [...list].sort(
        (a, b) =>
          String(a.category || '').localeCompare(String(b.category || ''), 'he') ||
          String(a.name || '').localeCompare(String(b.name || ''), 'he'),
      );
    }
    if (sort === 'points-asc') list = [...list].sort((a, b) => a.points - b.points);
    if (sort === 'points-desc') list = [...list].sort((a, b) => b.points - a.points);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'he'));
    return list;
  }, [products, cat, type, sort, searchQ]);

  return (
    <>
      <div className="page-head container">
        <h1>תכשיטים</h1>
        {searchQ ? <p>תוצאות עבור «{searchQ}»</p> : null}
      </div>

      <section className="section" style={{ paddingTop: 36 }}>
        <div className="container">
          <div className="catalog-toolbar">
            <div className="tabs">
              {CATALOG_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`tab${cat === tab.id ? ' on' : ''}${tab.latin ? ' tab-latin' : ''}`}
                  onClick={() => setCat(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="toolbar-selects">
              <select
                className="select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                aria-label="סינון לפי סוג"
              >
                <option value="הכל">כל הסוגים</option>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                className="select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="מיון לפי סוג"
              >
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
              <ProductCard key={p.id} product={p} products={products} />
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
