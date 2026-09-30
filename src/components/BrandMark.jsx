export default function BrandMark({ className = '' }) {
  return (
    <div className={`brand-mark${className ? ` ${className}` : ''}`} aria-hidden="true">
      <img src="/brand/symbol-black@2x.png" alt="" />
    </div>
  );
}
