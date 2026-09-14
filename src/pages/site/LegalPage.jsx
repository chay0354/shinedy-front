import { useState } from 'react';
import LegalDoc from '../../components/LegalDoc';
import { COOKIES, PRIVACY, TERMS } from '../../lib/legal';
import { clearCookieConsent, getCookieConsent, saveCookieConsent } from '../../lib/cookies';
import PageHead from '../../components/PageHead';

const DOCS = { privacy: PRIVACY, terms: TERMS, cookies: COOKIES };

export default function LegalPage({ kind }) {
  const data = DOCS[kind] || TERMS;
  const [consent, setConsent] = useState(() => getCookieConsent());

  function resetCookies(choice) {
    if (choice) saveCookieConsent(choice);
    else clearCookieConsent();
    setConsent(getCookieConsent());
    if (!choice) window.location.reload();
  }

  return (
    <>
      <PageHead eyebrow="LEGAL" title={data.title}>
        <p>עודכן לאחרונה: {data.updated}</p>
      </PageHead>
      <section className="section" style={{ paddingTop: 28 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <LegalDoc data={data} />
          {kind === 'cookies' && (
            <div className="cookie-manage">
              <p>
                הבחירה הנוכחית:{' '}
                <b>{consent?.choice === 'all' ? 'כל העוגיות' : consent ? 'הכרחיות בלבד' : 'טרם נבחר'}</b>
              </p>
              <div className="cookie-bar-actions">
                <button type="button" className="btn btn-sm" onClick={() => resetCookies('all')}>
                  אישור הכל
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => resetCookies('necessary')}>
                  הכרחיות בלבד
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
