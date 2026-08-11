import { Link } from 'react-router-dom';
import { FAQ } from '../../lib/site';

export default function FaqPage() {
  return (
    <>
      <div className="page-head container">
        <h1>שאלות נפוצות</h1>
      </div>

      <section className="section" style={{ paddingTop: 44 }}>
        <div className="container">
          <div className="faq-list">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>
                  <span className="q-wrap">
                    <img className="faq-sym" src="/brand/symbol-black.png" alt="" />
                    <span>{f.q}</span>
                  </span>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>

          <div className="faq-callout">
            <h3>לא מצאת תשובה?</h3>
            <p>אנחנו כאן בשבילך</p>
            <Link to="/contact" className="btn btn-tan">
              יצירת קשר
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
