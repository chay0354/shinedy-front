import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import { hasActivePlan } from '../../lib/roles';
import { FAQ } from '../../lib/site';
import PageHead from '../../components/PageHead';
import { IconBox, IconDiamond, IconList, IconNecklace } from '../../components/icons';

export const STEPS = [
  { icon: IconList, t: 'בחרי מסלול', d: 'מצאי את המסלול שמתאים לך ולסגנון שלך' },
  { icon: IconDiamond, t: 'בחרי תכשיטים', d: 'בחרי מהקטלוג עד מכסת הנקודות שלך' },
  { icon: IconNecklace, t: 'ענדי ותהני', d: 'משלוח עד הבית. עונדות בלי דאגות, בלאי סביר עלינו' },
  { icon: IconBox, t: 'החזירי והחליפי', d: 'ללא הגבלת החלפות. משלוח דו-חודשי כלול, נוסף ב-₪65' },
];

const JOIN = [
  { t: 'פתיחת חשבון', d: 'שם, דוא"ל וסיסמה' },
  { t: 'אימות זהות', d: 'העלאה מאובטחת של תעודת זהות' },
  { t: 'חתימה דיגיטלית', d: 'על הסכם המנוי' },
  { t: 'אמצעי תשלום', d: 'כרטיס אשראי לחיוב חודשי' },
  { t: 'בחירת מסלול', d: 'ומתחילות לבחור תכשיטים!' },
  { t: 'אימות טלפון', d: 'קוד חד-פעמי ב-SMS' },
];

export default function HowPage() {
  const { state } = useApp();
  const loggedIn = Boolean(getToken() && state?.auth);
  const subscribed = hasActivePlan(state);

  return (
    <>
      <PageHead eyebrow="HOW IT WORKS" title="איך זה עובד?">
        <p>פשוט. גמיש. מותאם לך.</p>
      </PageHead>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <div className="how-steps">
            {STEPS.map((s, i) => (
              <div className="how-step" key={s.t}>
                <div className="circle">
                  <s.icon size={38} />
                  <span className="n">{i + 1}</span>
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link
              to={loggedIn ? (subscribed ? '/catalog' : '/account/plans') : '/plans'}
              className="btn btn-tan"
            >
              {loggedIn && subscribed ? 'לקטלוג התכשיטים' : 'לבחירת מסלול'}
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow" dir="ltr">CREDITS</div>
            <h2>מגיע לך קרדיט</h2>
            <p>קרדיט הוא לא נקודות. אלה שני דברים נפרדים:</p>
          </div>
          <div className="credit-split">
            <div>
              <h3>נקודות</h3>
              <p>המכסה החודשית לבחירת תכשיטים להשאלה. כל תכשיט שווה נקודות, ובוחרים עד המכסה של המסלול.</p>
            </div>
            <div>
              <h3>קרדיטים</h3>
              <p>10% מדמי המנוי נצברים בכל חודש כהנחה. אם מתאהבים בתכשיט, הקרדיט מוזיל את הרכישה והוא נשאר אצלך.</p>
            </div>
          </div>
          <div className="section-head" style={{ marginBottom: 8 }}>
            <div className="section-eyebrow" dir="ltr">JOIN</div>
            <h2>תהליך ההצטרפות</h2>
            <p>כדי לשמור על התכשיטים ועל הלקוחות שלנו, ההצטרפות כוללת אימות קצר:</p>
          </div>
          <div className="join-steps">
            {JOIN.map((s, i) => (
              <div className="join-step" key={s.t}>
                <span className="n">{i + 1}</span>
                <strong>{s.t}</strong>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
          {!loggedIn && (
            <div className="section-action">
              <Link to="/signup" className="btn btn-tan">להצטרפות</Link>
            </div>
          )}
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow" dir="ltr">FAQ</div>
            <h2>שאלות נפוצות</h2>
          </div>
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
            <Link to="/contact" className="btn btn-tan">יצירת קשר</Link>
          </div>
        </div>
      </section>
    </>
  );
}
