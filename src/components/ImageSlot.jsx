import { JewelArt } from './icons';

const CATEGORY_VARIANT = {
  טבעות: 'ring',
  שרשראות: 'necklace',
  עגילים: 'earring',
  צמידים: 'bracelet',
};

/**
 * Product imagery placeholder. Swap the inner artwork for a real <img>
 * once photography is available — sizing is driven entirely by the parent.
 */
export default function ImageSlot({
  label = 'תמונה',
  category,
  productId,
  style,
  className = '',
  variant = 'default',
}) {
  const art = CATEGORY_VARIANT[category] || 'ring';
  const classes = [
    'img-slot',
    'jewel-slot',
    variant === 'dark' ? 'jewel-slot-dark' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} role="img" aria-label={label || productId || 'תכשיט'}>
      <JewelArt variant={art} />
    </div>
  );
}
