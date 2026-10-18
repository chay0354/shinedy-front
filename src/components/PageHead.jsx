import BrandMark from './BrandMark';

export default function PageHead({ eyebrow, title, children, mark = true, className = '' }) {
  return (
    <div className={`page-head${className ? ` ${className}` : ''}`}>
      <div className="container">
        {eyebrow ? (
          <div className="section-eyebrow" dir="ltr">
            {eyebrow}
          </div>
        ) : null}
        <h1>{title}</h1>
        {mark ? <BrandMark /> : null}
        {children}
      </div>
    </div>
  );
}
