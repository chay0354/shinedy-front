const CATEGORY_ICONS = {
  טבעות: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="36" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="36" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
      <path
        d="M26 20l3-6h6l3 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M29 20h6v4h-6z" fill="currentColor" opacity="0.35" />
    </svg>
  ),
  שרשראות: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M16 18c6 10 10 22 16 28 6-6 10-18 16-28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="48" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="48" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  ),
  עגילים: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="24" cy="18" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M24 22v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="44" r="5" fill="currentColor" opacity="0.35" />
      <circle cx="40" cy="18" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M40 22v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="44" r="5" fill="currentColor" opacity="0.35" />
    </svg>
  ),
  צמידים: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="32" rx="20" ry="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <ellipse cx="32" cy="32" rx="14" ry="7" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx="48" cy="28" r="3" fill="currentColor" opacity="0.35" />
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="12" y="18" width="40" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="24" cy="30" r="4" fill="currentColor" opacity="0.35" />
    <path d="M12 42l12-10 8 7 6-5 14 12" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const HERO_ICON = (
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
    <path
      d="M30 34c10 16 18 36 30 46 12-10 20-30 30-46"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="60" cy="84" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="60" cy="84" r="4" fill="currentColor" opacity="0.4" />
    <circle cx="38" cy="48" r="3.5" fill="currentColor" opacity="0.28" />
    <circle cx="82" cy="48" r="3.5" fill="currentColor" opacity="0.28" />
    <ellipse cx="60" cy="58" rx="22" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
  </svg>
);

export default function ImageSlot({
  label = 'תמונה',
  category,
  productId,
  style,
  className = '',
  variant = 'default',
}) {
  const isHero = variant === 'hero';
  const icon = isHero ? HERO_ICON : CATEGORY_ICONS[category] || DEFAULT_ICON;
  const caption = label || productId || 'תמונה';

  return (
    <div
      className={`img-slot${isHero ? ' img-slot-hero' : ''}${className ? ` ${className}` : ''}`}
      style={style}
      role="img"
      aria-label={caption}
    >
      <div className="img-slot-inner">
        <div className="img-slot-icon">{icon}</div>
        <div className="img-slot-label">{caption}</div>
        {productId && <div className="img-slot-id">{productId}</div>}
        {isHero && <div className="img-slot-hint">Placeholder · תמונת מוצר</div>}
      </div>
    </div>
  );
}
