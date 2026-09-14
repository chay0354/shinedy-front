import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCookieConsent, saveCookieConsent } from '../lib/cookies';

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!getCookieConsent());
  }, []);

  function choose(choice) {
    saveCookieConsent(choice);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="cookie-bar" role="dialog" aria-label="הסכמת עוגיות">
      <p>
        האתר משתמש בעוגיות הכרחיות להפעלה, להתחברות ולשמירת הקופסה.
        עוגיות נוספות — רק אם תאשרי.{' '}
        <Link to="/cookies" className="link-gold">
          מדיניות עוגיות
        </Link>
      </p>
      <div className="cookie-bar-actions">
        <button type="button" className="btn btn-sm" onClick={() => choose('all')}>
          אישור הכל
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => choose('necessary')}>
          הכרחיות בלבד
        </button>
      </div>
    </div>
  );
}
