import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { IconBox, IconDiamond, IconNecklace, IconPhone } from '../../components/icons';

const STEPS = [
  {
    n: 1,
    icon: <IconPhone />,
    title: 'בוחרים מסלול',
    text: 'מנוי חודשי שמתאים לך',
  },
  {
    n: 2,
    icon: <IconDiamond />,
    title: 'בוחרים תכשיטים',
    text: 'מכל הקטלוג במסגרת הנקודות שלך',
  },
  {
    n: 3,
    icon: <IconNecklace />,
    title: 'עונדים ונהנים',
    text: 'מחליפים אחת לחודש, בלי התחייבות',
  },
  {
    n: 4,
    icon: <IconBox />,
    title: 'מחזירים ומחליפים',
    text: 'משלוח חינם בשני הכיוונים',
  },
];

export default function HowPage() {
  const navigate = useNavigate();

  return (
    <section className="site-section">
      <div className="shell">
        <div className="section-head">
          <h2 className="section-title">איך זה עובד?</h2>
          <p className="section-sub">פשוט. גמיש. מותאם לך.</p>
        </div>

        <div className="step-grid">
          {STEPS.map((s) => (
            <div key={s.n} className="step-card">
              <span className="step-num">{s.n}</span>
              <div className="step-icon">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-text">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="section-cta">
          <Button type="button" className="btn-gold" onClick={() => navigate('/plans')}>
            למסלולים
          </Button>
        </div>
      </div>
    </section>
  );
}
