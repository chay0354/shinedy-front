import { Link } from 'react-router-dom';
import Art from './Art';
import { IconHeart } from './icons';
import { useFavorites } from '../lib/favorites';

export default function ProductCard({ product, products = [], showRelated = false }) {
  const { has, toggle } = useFavorites();
  const liked = has(product.id);
  const options = showRelated
    ? products.filter((x) => x.id !== product.id && x.category === product.category).slice(0, 4)
    : [];

  return (
    <article className="product-card">
      <Link to={`/catalog/${product.id}`}>
        <div className="art">
          <button
            type="button"
            className={`fav-btn${liked ? ' on' : ''}`}
            aria-label={liked ? 'הסירי ממועדפים' : 'הוסיפי למועדפים'}
            aria-pressed={liked}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product.id);
            }}
          >
            <IconHeart size={18} filled={liked} />
          </button>
          <Art product={product} />
        </div>
        <div className="info">
          <div className="name">{product.name}</div>
          <div className="meta">
            {product.metal} · {product.stone}
          </div>
          <div className="row">
            <span className="points-badge">{product.points} נק׳</span>
            {product.price ? (
              <span className="price-tag">₪{Number(product.price).toLocaleString()} לקנייה</span>
            ) : null}
            {product.inStock === false && <span className="oos">אזל מהמלאי</span>}
          </div>
        </div>
      </Link>
      {options.length > 0 && (
        <div className="product-options" aria-label="אופציות למוצרים נוספים">
          <span className="product-options-label">אופציות נוספות</span>
          <div className="product-options-row">
            {options.map((o) => (
              <Link key={o.id} to={`/catalog/${o.id}`} className="product-option" title={o.name}>
                <Art product={o} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
