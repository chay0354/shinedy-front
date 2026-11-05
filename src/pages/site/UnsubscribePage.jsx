import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import PageHead from '../../components/PageHead';

export default function UnsubscribePage() {
  const { token } = useParams();
  const [status, setStatus] = useState('ask');
  const [error, setError] = useState('');

  async function confirm() {
    setStatus('busy');
    setError('');
    try {
      await api.unsubscribe(token);
      setStatus('done');
    } catch (e) {
      setError(e.message || 'ההסרה נכשלה. נסי שוב');
      setStatus('ask');
    }
  }

  return (
    <>
      <PageHead eyebrow="SHINEDY" title={status === 'done' ? 'הוסרת מרשימת הדיוור' : 'הסרה מרשימת הדיוור'} />
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="form-card" style={{ textAlign: 'center' }}>
            {status === 'done' ? (
              <>
                <p className="sub" style={{ marginBottom: 8 }}>
                  לא נשלח אלייך יותר דיוור שיווקי במייל וב-SMS.
                </p>
                <p className="sub">הודעות על המנוי עצמו, כמו משלוחים וחיובים, ימשיכו להגיע.</p>
                <Link to="/" className="btn">לדף הבית</Link>
              </>
            ) : (
              <>
                <p className="sub">
                  לא נשלח אלייך יותר מבצעים ועדכונים במייל וב-SMS. אפשר לחזור לרשימה בכל עת דרך שירות הלקוחות.
                </p>
                {error && <p className="form-err">{error}</p>}
                <button type="button" className="btn" disabled={status === 'busy'} onClick={confirm}>
                  {status === 'busy' ? 'מסירה…' : 'כן, להסיר אותי'}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
