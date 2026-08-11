import { Link } from 'react-router-dom';
import { IconBox, IconDiamond, IconList, IconNecklace } from '../../components/icons';

const STEPS = [
  { icon: IconList, t: 'בחרי מסלול', d: 'מצאי את המסלול שמתאים לך ולסגנון שלך' },
  { icon: IconDiamond, t: 'בחרי תכשיטים', d: 'בחרי מהקטלוג עד מכסת הנקודות שלך' },
  { icon: IconNecklace, t: 'ענדי ותהני', d: 'משלוח עד הבית — עונדות בלי דאגות, בלאי סביר עלינו' },
  { icon: IconBox, t: 'החזירי והחליפי', d: 'ללא הגבלת החלפות — משלוח דו-חודשי כלול, נוסף ב-₪65' },
];

const JOIN = [
  { t: 'פתיחת חשבון', d: 'שם, דוא"ל וסיסמה' },
  { t: 'אימות טלפון ודוא"ל', d: 'קוד חד-פעמי וקישור אימות' },
  { t: 'אימות זהות', d: 'העלאה מאובטחת של תעודת זהות' },
  { t: 'חתימה דיגיטלית', d: 'על הסכם המנוי' },
  { t: 'אמצעי תשלום', d: 'כרטיס אשראי לחיוב חודשי' },
  { t: 'בחירת מסלול', d: 'ומתחילות לבחור תכשיטים!' },
];

export default function HowPage() {
  return (
    <>
      <div className="page-head container">
        <h1>איך זה עובד?</h1>
        <p>פשוט. גמיש. מותאם לך.</p>
      </div>

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
            <Link to="/plans" className="btn btn-tan">
              מתחילות
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="section-head">
            <h2>והקרדיטים?</h2>
            <p>
              לאורך המנוי נצברים לזכותך קרדיטים. התאהבת בתכשיט מסוים? אפשר להשתמש בקרדיטים להנחה ברכישתו — והוא
              נשאר אצלך לתמיד.
            </p>
          </div>
          <div className="section-head" style={{ marginBottom: 20 }}>
            <h2>תהליך ההצטרפות</h2>
            <p>כדי לשמור על התכשיטים ועל הלקוחות שלנו, ההצטרפות כוללת אימות קצר:</p>
          </div>
          <div className="stepper" style={{ maxWidth: 520, margin: '0 auto' }}>
            {JOIN.map((s, i) => (
              <div className="s" key={s.t}>
                <div className="dot">{i + 1}</div>
                <div>
                  <strong>{s.t}</strong>
                  <p>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
