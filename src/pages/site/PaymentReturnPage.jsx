import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { getToken } from '../../lib/auth';
import PageHead from '../../components/PageHead';

const NEXT = {
  subscription: { to: '/catalog', label: 'לבחירת תכשיטים' },
  purchase: { to: '/account/me', label: 'לאזור האישי' },
  card: { to: '/account/details', label: 'חזרה לפרטים שלי' },
};

function insideFrame() {
  try {
    return window.top !== window.self;
  } catch {
    return true;
  }
}

// Hyp sends the customer back here after the payment page (success or failure).
export default function PaymentReturnPage() {
  const { refresh } = useApp();
  const [result, setResult] = useState(null);
  const started = useRef(false);
  const framed = insideFrame();

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (framed) {
      window.top.location.replace(window.location.href);
      return;
    }
    const query = window.location.search.replace(/^\?/, '');
    if (!query) {
      setResult({ ok: false, message: 'לא התקבלו פרטי תשלום' });
      return;
    }
    api
      .completePayment(query)
      .then((data) => {
        setResult(data);
        window.history.replaceState(null, '', window.location.pathname);
        return refresh();
      })
      .catch((e) => setResult({ ok: false, message: e.message }));
  }, [refresh, framed]);

  if (framed) return null;

  const loggedIn = Boolean(getToken());
  const next =
    result?.kind === 'purchase' && !loggedIn
      ? { to: '/catalog', label: 'חזרה לקטלוג' }
      : NEXT[result?.kind] || { to: '/', label: 'לדף הבית' };

  return (
    <>
      <PageHead
        eyebrow="PAYMENT"
        title={!result ? 'מאמתים את התשלום…' : result.ok ? 'תודה!' : 'התשלום לא הושלם'}
      />
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
          {!result ? (
            <p>רגע אחד, מוודאים את התשלום מול חברת האשראי.</p>
          ) : (
            <>
              <p className={result.ok ? 'msg-ok' : 'form-err'} style={{ fontSize: '1.1rem' }}>
                {result.message}
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                {result.ok ? (
                  <Link to={next.to} className="btn">
                    {next.label}
                  </Link>
                ) : (
                  <>
                    <Link to={result.kind === 'subscription' ? '/account/plans' : next.to} className="btn">
                      לנסות שוב
                    </Link>
                    <Link to="/contact" className="btn btn-outline">
                      יצירת קשר
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
