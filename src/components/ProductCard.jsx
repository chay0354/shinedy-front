import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Art from './Art';
import { IconHeart } from './icons';
import { useFavorites } from '../lib/favorites';

const DEMO_WORN = [
  '/catalog/worn/m5.jpg',
  '/catalog/worn/m1.jpg',
  '/hero/look.jpg',
  '/catalog/worn/m6.jpg',
];

function wornPhoto(product) {
  if (product.modelImage) return product.modelImage;
  const extra = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const own = extra.find((src) => src && src !== product.image);
  if (own) return own;
  const key = String(product.id || '');
  let n = 0;
  for (let i = 0; i < key.length; i += 1) n += key.charCodeAt(i);
  return DEMO_WORN[n % DEMO_WORN.length];
}

export default function ProductCard({ product, products = [], showRelated = false }) {
  const { has, toggle } = useFavorites();
  const liked = has(product.id);
  const worn = wornPhoto(product);
  const slidesRef = useRef(null);
  const scrollStart = useRef(0);
  const [slide, setSlide] = useState(0);
  const options = showRelated
    ? products.filter((x) => x.id !== product.id && x.category === product.category).slice(0, 4)
    : [];

  return (
    <article className="product-card">
      <Link to={`/catalog/${product.id}`}>
        <div className="art">
          <div
            className="art-slides"
            ref={slidesRef}
            onTouchStart={() => {
              scrollStart.current = slidesRef.current?.scrollLeft || 0;
            }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const next = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
              setSlide(next);
            }}
            onClick={(e) => {
              if (Math.abs((slidesRef.current?.scrollLeft || 0) - scrollStart.current) > 6) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <div className="art-slide">
              <Art product={product} />
            </div>
            {worn ? (
              <div className="art-slide">
                <img className="art-worn" src={worn} alt="" />
              </div>
            ) : null}
          </div>
          {worn ? (
            <div className="art-bar" aria-hidden="true">
              <span style={{ transform: `translateX(${slide * 100}%)` }} />
            </div>
          ) : null}
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
