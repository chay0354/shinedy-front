// איורי קו עדינים לפי קטגוריה — ממלאי מקום עד שיהיו צילומי מוצר אמיתיים
const GOLD = '#b08d3e'
const SOFT = '#d9c48f'

function Ring() {
  return (
    <svg viewBox="0 0 100 100" fill="none" role="img" aria-label="טבעת">
      <circle cx="50" cy="60" r="26" stroke={GOLD} strokeWidth="3" />
      <circle cx="50" cy="60" r="20" stroke={SOFT} strokeWidth="1" />
      <path d="M42 30 L50 18 L58 30 L50 38 Z" stroke={GOLD} strokeWidth="2.5" fill="none" />
      <path d="M46 30 L54 30 M50 18 L50 38" stroke={SOFT} strokeWidth="1" />
    </svg>
  )
}

function Earrings() {
  return (
    <svg viewBox="0 0 100 100" fill="none" role="img" aria-label="עגילים">
      <circle cx="32" cy="38" r="4" fill={GOLD} />
      <circle cx="68" cy="38" r="4" fill={GOLD} />
      <circle cx="32" cy="62" r="15" stroke={GOLD} strokeWidth="3" />
      <circle cx="68" cy="62" r="15" stroke={GOLD} strokeWidth="3" />
      <circle cx="32" cy="62" r="10" stroke={SOFT} strokeWidth="1" />
      <circle cx="68" cy="62" r="10" stroke={SOFT} strokeWidth="1" />
    </svg>
  )
}

function Necklace() {
  return (
    <svg viewBox="0 0 100 100" fill="none" role="img" aria-label="שרשרת">
      <path d="M20 24 Q50 66 80 24" stroke={GOLD} strokeWidth="3" fill="none" />
      <path d="M24 24 Q50 58 76 24" stroke={SOFT} strokeWidth="1" fill="none" />
      <path d="M44 52 L50 44 L56 52 L50 64 Z" stroke={GOLD} strokeWidth="2.5" fill="none" />
      <path d="M44 52 L56 52" stroke={SOFT} strokeWidth="1" />
    </svg>
  )
}

function Bracelet() {
  return (
    <svg viewBox="0 0 100 100" fill="none" role="img" aria-label="צמיד">
      <ellipse cx="50" cy="52" rx="30" ry="24" stroke={GOLD} strokeWidth="3" />
      <ellipse cx="50" cy="52" rx="24" ry="18" stroke={SOFT} strokeWidth="1" />
      <circle cx="50" cy="28" r="5" stroke={GOLD} strokeWidth="2.5" fill="#fff" />
    </svg>
  )
}

const ART = { טבעות: Ring, עגילים: Earrings, שרשראות: Necklace, צמידים: Bracelet }

export default function JewelArt({ category }) {
  const Art = ART[category] || Ring
  return <Art />
}
