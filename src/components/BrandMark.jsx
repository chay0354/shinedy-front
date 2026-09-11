export default function BrandMark({ className = '' }) {
  return (
    <div className={`brand-mark${className ? ` ${className}` : ''}`} aria-hidden="true">
      <span className="ln" />
      <img src="/brand/symbol-black@2x.png" alt="" />
      <span className="ln" />
    </div>
  );
}
