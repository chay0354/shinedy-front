import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import { hasActivePlan } from '../../lib/roles';
import { FAQ } from '../../lib/site';
import PageHead from '../../components/PageHead';
import InfoFlow from '../../components/InfoFlow';
import {
  IconBox,
  IconCard,
  IconDiamond,
  IconList,
  IconNecklace,
  IconPen,
  IconPhone,
  IconSparkle,
  IconUser,
} from '../../components/icons';

export const STEPS = [
  { icon: IconList, t: 'בחרי מסלול', d: 'מצאי את המסלול שמתאים לך ולסגנון שלך' },
  { icon: IconDiamond, t: 'בחרי תכשיטים', d: 'בחרי מהקטלוג עד מכסת הנקודות שלך' },
  { icon: IconNecklace, t: 'ענדי ותהני', d: 'משלוח עד הבית. עונדות בלי דאגות, בלאי סביר עלינו' },
  { icon: IconBox, t: 'החזירי והחליפי', d: 'ללא הגבלת החלפות. משלוח דו-חודשי כלול, נוסף ב-₪65' },
];

const JOIN = [
  { icon: IconUser, t: 'פרטים אישיים', d: 'שם, פרטי קשר וכתובת למשלוח' },
  { icon: IconList, t: 'בחירת מסלול', d: 'המסלול שמתאים לך' },
  { icon: IconPen, t: 'חתימה דיגיטלית', d: 'על הסכם המנוי' },
  { icon: IconPhone, t: 'אימות טלפון', d: 'קוד חד-פעמי ב-SMS' },
  { icon: IconCard, t: 'תשלום מאובטח', d: 'כרטיס אשראי לחיוב חודשי' },
  { icon: IconSparkle, t: 'מתחילות', d: 'בוחרות תכשיטים מהקטלוג' },
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
          <InfoFlow steps={STEPS} />
          <div className="section-action">
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
            <p>נקודות וקרדיטים הם שני דברים נפרדים</p>
          </div>
          <div className="credit-compare">
            <div className="credit-card">
              <span className="info-flow-tile" aria-hidden="true">
                <IconDiamond size={26} />
              </span>
              <h3>נקודות</h3>
              <p>המכסה החודשית שלך לבחירת תכשיטים להשאלה. כל תכשיט שווה נקודות.</p>
              <span className="credit-tag">לבחירה מהקטלוג</span>
            </div>
            <span className="credit-vs" aria-hidden="true">≠</span>
            <div className="credit-card">
              <span className="info-flow-tile" aria-hidden="true">
                <IconSparkle size={26} />
              </span>
              <h3>קרדיטים</h3>
              <p>10% מדמי המנוי נצברים בכל חודש, ומוזילים את הרכישה כשמתאהבים בתכשיט.</p>
              <span className="credit-tag">הנחה ברכישה</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow" dir="ltr">JOIN</div>
            <h2>תהליך ההצטרפות</h2>
            <p>כמה דקות, ואת בפנים</p>
          </div>
          <InfoFlow steps={JOIN} compact />
          {!loggedIn && (
            <div className="section-action">
              <Link to="/signup" className="btn btn-tan">להצטרפות</Link>
            </div>
          )}
        </div>
      </section>

      <section className="section alt" id="faq">
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
