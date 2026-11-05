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
      <PageHead eyebrow="UNSUBSCRIBE" title={status === 'done' ? 'הוסרת מרשימת הדיוור' : 'הסרה מרשימת הדיוור'} />
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
          {status === 'done' ? (
            <>
              <p className="msg-ok" style={{ fontSize: '1.1rem' }}>
                לא נשלח אלייך יותר דיוור שיווקי במייל וב-SMS.
              </p>
              <p className="cell-sub">הודעות על המנוי עצמו, כמו משלוחים וחיובים, ימשיכו להגיע.</p>
              <div style={{ marginTop: 24 }}>
                <Link to="/" className="btn">לדף הבית</Link>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: '1.05rem' }}>
                לאשר הסרה מרשימת הדיוור של Shinedy? לא נשלח אלייך יותר מבצעים ועדכונים במייל וב-SMS.
              </p>
              {error && <p className="form-err">{error}</p>}
              <div style={{ marginTop: 24 }}>
                <button type="button" className="btn" disabled={status === 'busy'} onClick={confirm}>
                  {status === 'busy' ? 'מסירה…' : 'כן, להסיר אותי'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
