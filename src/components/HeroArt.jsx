export default function HeroArt({ label = 'דוגמנית עונדת שרשרת יוקרתית' }) {
  return (
    <div className="hero-art" role="img" aria-label={label}>
      <div className="hero-art-portrait" aria-hidden="true" />
      <div className="hero-art-dress" aria-hidden="true" />
      <div className="hero-art-chain" aria-hidden="true" />
      <div className="hero-art-jewel" aria-hidden="true" />
      <span className="hb-kicker" dir="ltr">
        NEW LOOK. SAME YOU.
      </span>
    </div>
  );
}
