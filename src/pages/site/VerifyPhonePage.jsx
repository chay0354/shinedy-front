import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { applySessionFromResponse } from '../../lib/auth';
import { homePathForRole } from '../../lib/roles';
import { toLocalIl } from '../../lib/phone';

export default function VerifyPhonePage() {
  const { state, refresh } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const phone = toLocalIl(
    location.state?.phone ||
      state?.registration?.phone ||
      sessionStorage.getItem('shinedy_verify_phone') ||
      '',
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api.verifyPhone({ phone, code });
      applySessionFromResponse(data);
      await refresh();
      sessionStorage.removeItem('shinedy_verify_phone');
      navigate(homePathForRole(data.auth?.role, data.subscribed, data.planId), { replace: true });
    } catch (err) {
      setError(err.message || 'האימות נכשל');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError('');
    setInfo('');
    setBusy(true);
    try {
      await api.resendPhoneVerification({ phone });
      setInfo('שלחנו קוד חדש ב-SMS');
    } catch (err) {
      setError(err.message || 'לא ניתן לשלוח שוב');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-form-side">
        <div className="form-card">
          <h1>אימות טלפון</h1>
          <p className="sub">שלחנו קוד ב-SMS אל {phone || 'המספר שלך'}</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="p-code">קוד אימות</label>
              <input
                id="p-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                placeholder="000000"
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            {error && <p className="form-err">{error}</p>}
            {info && <p className="msg-ok">{info}</p>}
            <button type="submit" className="btn btn-wide" disabled={busy || code.length !== 6}>
              {busy ? 'מאמתת…' : 'אימות'}
            </button>
          </form>
          <p className="form-note">
            <button type="button" className="link-gold" disabled={busy} onClick={resend}>
              שלחי קוד שוב
            </button>
          </p>
          <p className="form-note">
            <Link to="/login" className="link-gold">
              חזרה להתחברות
            </Link>
          </p>
        </div>
      </div>
      <div
        className="auth-photo"
        style={{ backgroundImage: 'url(/photos/bag.jpg)' }}
        role="img"
        aria-label="שקית מתנה של Shinedy"
      />
    </div>
  );
}
