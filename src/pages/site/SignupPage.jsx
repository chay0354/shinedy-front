import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { applySessionFromResponse } from '../../lib/auth';

const STEPS = [
  { key: 'account', label: 'פתיחת חשבון', fields: ['fullName', 'email', 'phone', 'password'] },
  { key: 'phone', label: 'אימות טלפון' },
  { key: 'email', label: 'אימות דוא״ל' },
  { key: 'id', label: 'העלאת תעודת זהות' },
  { key: 'signature', label: 'חתימה דיגיטלית' },
  { key: 'payment', label: 'הזנת אמצעי תשלום' },
  { key: 'plan', label: 'בחירת מסלול' },
];

export default function SignupPage() {
  const { run } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  async function saveStep(patch) {
    await run(() => api.updateRegistration(patch));
  }

  async function createAccount() {
    const data = await run(() =>
      api.register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
      }),
    );
    applySessionFromResponse(data);
    setStep(1);
  }

  async function nextStep() {
    if (step === 0) {
      await createAccount();
      return;
    }
    if (step === 1) {
      await saveStep({ step: 2, phoneVerified: true });
      setStep(2);
      return;
    }
    if (step === 2) {
      await saveStep({ step: 3, emailVerified: true });
      setStep(3);
      return;
    }
    if (step === 3) {
      await saveStep({ step: 4, idDocumentUrl: 'uploaded/mock-id.pdf' });
      setStep(4);
      return;
    }
    if (step === 4) {
      await saveStep({ step: 5, signatureCompleted: true });
      setStep(5);
      return;
    }
    if (step === 5) {
      await saveStep({ step: 6, paymentMethodAdded: true });
      navigate('/plans');
      return;
    }
  }

  const current = STEPS[step];

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="auth-box" style={{ maxWidth: 480 }}>
        <div className="display" style={{ fontSize: 22, marginBottom: 8 }}>
          הרשמה ל-Shinedy
        </div>
        <div className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
          שלב {step + 1} מתוך {STEPS.length}: {current.label}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                opacity: i <= step ? 1 : 0.4,
                fontSize: 13,
              }}
            >
              <span className="accent">{i < step ? '✓' : i === step ? '●' : '○'}</span>
              {s.label}
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <input
              className="field"
              placeholder="שם מלא"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <input
              className="field"
              placeholder="דוא״ל"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="field"
              placeholder="טלפון"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="field"
              placeholder="סיסמה"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </>
        )}

        {step === 1 && (
          <div className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            שלחנו קוד אימות ל-{form.phone || 'הטלפון שלך'}. לדמו — לחצי המשך לאימות.
          </div>
        )}

        {step === 2 && (
          <div className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            שלחנו קישור אימות ל-{form.email}. לדמו — לחצי המשך לאימות.
          </div>
        )}

        {step === 3 && (
          <div className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            העלי צילום תעודת זהות. לדמו — לחצי המשך לסימון שהועלה.
          </div>
        )}

        {step === 4 && (
          <div className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            חתמי על תנאי השירות בחתימה דיגיטלית. לדמו — לחצי המשך.
          </div>
        )}

        {step === 5 && (
          <div className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            הזיני פרטי אמצעי תשלום. לדמו — לחצי המשך לבחירת מסלול.
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', padding: 14, marginTop: 8 }}
          onClick={nextStep}
        >
          {step === 5 ? 'המשך לבחירת מסלול' : 'המשך'}
        </button>

        <button
          type="button"
          className="accent"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 13,
            marginTop: 16,
            width: '100%',
          }}
          onClick={() => navigate('/login')}
        >
          כבר יש לך חשבון? התחברי
        </button>
      </div>
    </div>
  );
}
