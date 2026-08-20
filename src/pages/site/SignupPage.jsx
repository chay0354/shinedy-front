import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { useApp } from '../../state/AppContext';
import { applySessionFromResponse } from '../../lib/auth';
import { publicCatalogPlans, subscribePlanId } from '../../lib/plans';
import { PRIVACY, TERMS } from '../../lib/legal';
import LegalDoc from '../../components/LegalDoc';
import SignaturePad from '../../components/SignaturePad';

const STEPS = ['פרטים', 'מסלול', 'תקנון', 'פרטיות', 'חתימה', 'תשלום'];
const STEP = {
  details: 0,
  plan: 1,
  terms: 2,
  privacy: 3,
  sign: 4,
  pay: 5,
};

function validIsraeliId(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length < 5 || digits.length > 9) return false;
  const s = digits.padStart(9, '0');
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    let n = Number(s[i]) * ((i % 2) + 1);
    if (n > 9) n -= 9;
    sum += n;
  }
  return sum % 10 === 0;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('לא ניתן לקרוא את הקובץ'));
    reader.readAsDataURL(file);
  });
}

function compressImage(file) {
  if (file.type === 'application/pdf') {
    if (file.size > 2 * 1024 * 1024) {
      return Promise.reject(new Error('קובץ ה-PDF גדול מדי (עד 2MB)'));
    }
    return readFileAsDataUrl(file);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1400;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('לא ניתן לקרוא את התמונה'));
    };
    img.src = url;
  });
}

function signatureHasInk(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:image')) return false;
  return dataUrl.length > 4000;
}

export default function SignupPage() {
  const { state, run } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [params] = useSearchParams();
  const fromUrl = params.get('plan');
  const livePlans = Array.isArray(state?.plans) ? state.plans : [];
  const plans = publicCatalogPlans(livePlans);
  const defaultPlan = plans.some((p) => p.id === fromUrl)
    ? fromUrl
    : plans.find((p) => p.featured)?.id || plans[0]?.id;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    pass: '',
    pass2: '',
    plan: '',
    nationalId: '',
    agreeLegal: false,
    agreeNotices: false,
    signature: '',
    idFileName: '',
    idDocument: '',
    cardHolder: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  useEffect(() => {
    setStep(0);
  }, [fromUrl]);

  useEffect(() => {
    if (defaultPlan) {
      setForm((prev) => (prev.plan ? prev : { ...prev, plan: defaultPlan }));
    }
  }, [defaultPlan]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateDetails() {
    if (!form.name.trim()) return 'יש למלא שם מלא';
    if (!form.phone.trim()) return 'יש למלא טלפון';
    if (!form.email.trim()) return 'יש למלא אימייל';
    if (form.pass.length < 8) return 'הסיסמה חייבת לפחות 8 תווים';
    if (form.pass !== form.pass2) return 'הסיסמאות אינן תואמות — נסי שוב';
    if (!validIsraeliId(form.nationalId)) return 'מספר תעודת הזהות אינו תקין';
    return '';
  }

  function validatePlan() {
    if (!form.plan) return 'יש לבחור מסלול';
    return '';
  }

  function validateLegal() {
    if (!form.agreeLegal) return 'יש לאשר את התקנון ואת מדיניות הפרטיות';
    if (!form.agreeNotices) return 'יש לאשר קבלת הודעות תפעוליות על המנוי';
    if (!form.idDocument) return 'יש להעלות צילום או סריקה של תעודת הזהות';
    if (!signatureHasInk(form.signature)) return 'יש לחתום בשדה החתימה';
    return '';
  }

  function validatePayment() {
    if (!form.cardHolder.trim() || !form.cardNumber.trim() || !form.cardExpiry.trim() || !form.cardCvv.trim()) {
      return 'יש למלא את פרטי הכרטיס';
    }
    return '';
  }

  function goNext() {
    setError('');
    if (step === STEP.details) {
      const err = validateDetails();
      if (err) {
        setError(err);
        return;
      }
    }
    if (step === STEP.plan) {
      const err = validatePlan();
      if (err) {
        setError(err);
        return;
      }
    }
    if (step === STEP.sign) {
      const err = validateLegal();
      if (err) {
        setError(err);
        return;
      }
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  async function onIdFile(file) {
    if (!file) return;
    const okTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!okTypes.includes(file.type)) {
      setError('יש להעלות תמונה או קובץ PDF של תעודת הזהות');
      return;
    }
    try {
      const data = await compressImage(file);
      setField('idDocument', data);
      setField('idFileName', file.name);
      setError('');
    } catch (e) {
      setError(e.message || 'העלאת תעודת הזהות נכשלה');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }
    const detailsErr = validateDetails();
    if (detailsErr) {
      setError(detailsErr);
      setStep(STEP.details);
      return;
    }
    const planErr = validatePlan();
    if (planErr) {
      setError(planErr);
      setStep(STEP.plan);
      return;
    }
    const legalErr = validateLegal();
    if (legalErr) {
      setError(legalErr);
      setStep(STEP.sign);
      return;
    }
    const payErr = validatePayment();
    if (payErr) {
      setError(payErr);
      return;
    }
    setError('');
    const last4 = form.cardNumber.replace(/\D/g, '').slice(-4);
    const data = await run(() =>
      api.register({
        fullName: form.name.trim(),
        email: form.email.trim(),
        password: form.pass,
        phone: form.phone.trim(),
        nationalId: form.nationalId.replace(/\D/g, ''),
        termsAccepted: true,
        privacyAccepted: true,
        noticesAccepted: true,
        signatureCompleted: true,
        signatureData: form.signature,
        idDocumentUrl: form.idDocument,
        planId: subscribePlanId(form.plan, livePlans),
        payment: {
          holder: form.cardHolder.trim(),
          last4,
          expiry: form.cardExpiry.trim(),
        },
      }),
    );
    if (!data) {
      setError('לא ניתן להירשם — בדקי את הפרטים');
      return;
    }
    applySessionFromResponse(data);
    navigate('/catalog');
  }

  const selectedPlan = plans.find((p) => p.id === form.plan);
  const wide = step !== STEP.details;

  return (
    <div className={wide ? 'signup-flow' : 'auth-split'}>
      {step === STEP.details && (
        <div
          className="auth-photo"
          style={{ backgroundImage: 'url(/photos/bag.jpg)' }}
          role="img"
          aria-label="שקית מתנה של Shinedy"
        />
      )}
      <div className={wide ? 'container signup-wide' : 'auth-form-side'}>
        <div className={wide ? 'signup-card' : 'form-card'}>
          <h1>יצירת חשבון</h1>
          <p className="sub">הצטרפי לעולם של תכשיטים יוקרתיים</p>

          <ol className="signup-steps" aria-label="שלבי הרשמה">
            {STEPS.map((label, i) => (
              <li key={label} className={i === step ? 'on' : i < step ? 'done' : ''}>
                <span>{i + 1}</span>
                {label}
              </li>
            ))}
          </ol>

          <form onSubmit={handleSubmit}>
            {step === STEP.details && (
              <>
                <div className="field">
                  <label htmlFor="s-name">שם מלא</label>
                  <input
                    id="s-name"
                    required
                    placeholder="השם שלך"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="s-id">מספר תעודת זהות</label>
                  <input
                    id="s-id"
                    required
                    inputMode="numeric"
                    placeholder="000000018"
                    dir="ltr"
                    value={form.nationalId}
                    onChange={(e) => setField('nationalId', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="s-phone">טלפון נייד</label>
                  <input
                    id="s-phone"
                    type="tel"
                    required
                    placeholder="050-0000000"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="s-email">אימייל</label>
                  <input
                    id="s-email"
                    type="email"
                    required
                    placeholder="name@email.com"
                    dir="ltr"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="s-pass">סיסמה</label>
                  <input
                    id="s-pass"
                    type="password"
                    required
                    minLength={8}
                    placeholder="לפחות 8 תווים"
                    dir="ltr"
                    value={form.pass}
                    onChange={(e) => setField('pass', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="s-pass2">אימות סיסמה</label>
                  <input
                    id="s-pass2"
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    dir="ltr"
                    value={form.pass2}
                    onChange={(e) => setField('pass2', e.target.value)}
                  />
                </div>
              </>
            )}

            {step === STEP.plan && (
              <>
                <p className="signup-pay-note">בחרי את חבילת המנוי. אפשר לשנות מסלול אחר כך מהאזור האישי.</p>
                <div className="plans-grid signup-plan-grid">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      role="button"
                      tabIndex={0}
                      className={`plan-card${plan.featured ? ' featured' : ''}${form.plan === plan.id ? ' mine' : ''}`}
                      onClick={() => setField('plan', plan.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setField('plan', plan.id);
                        }
                      }}
                    >
                      {plan.featured ? (
                        <div className="flag">הכי פופולרי</div>
                      ) : null}
                      <div className="plan-name">{plan.latin}</div>
                      <div className="price">
                        ₪{plan.price}
                        <small> לחודש</small>
                      </div>
                      <div className="materials">{plan.materials}</div>
                      <ul>
                        {plan.perks.map((perk) => (
                          <li key={perk}>{perk}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === STEP.terms && (
              <div className="legal-scroll">
                <LegalDoc data={TERMS} />
              </div>
            )}

            {step === STEP.privacy && (
              <div className="legal-scroll">
                <LegalDoc data={PRIVACY} />
              </div>
            )}

            {step === STEP.sign && (
              <>
                <p className="signup-confirm-lead">
                  סימון התיבות והחתימה מהווים אישור אלקטרוני מחייב, בהתאם לתקנון.
                </p>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={form.agreeLegal}
                    onChange={(e) => setField('agreeLegal', e.target.checked)}
                  />
                  <span>
                    קראתי, הבנתי ואני מסכימה ל
                    <Link to="/terms" target="_blank" className="link-gold">
                      תקנון ולהסכם המנוי
                    </Link>
                    {' '}ול
                    <Link to="/privacy" target="_blank" className="link-gold">
                      מדיניות הפרטיות
                    </Link>
                    , על כל סעיפיהם ונספחיהם.
                  </span>
                </label>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={form.agreeNotices}
                    onChange={(e) => setField('agreeNotices', e.target.checked)}
                  />
                  <span>אני מאשרת קבלת הודעות ועדכונים הנוגעים למנוי בדוא״ל וב-SMS.</span>
                </label>

                <div className="field" style={{ marginTop: 18 }}>
                  <label htmlFor="s-id-file">העלאת תעודת זהות</label>
                  <input
                    id="s-id-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => onIdFile(e.target.files?.[0])}
                  />
                  {form.idFileName && (
                    <p className="cell-sub" style={{ marginTop: 6 }}>
                      הועלה: {form.idFileName}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label>חתימה</label>
                  <SignaturePad value={form.signature} onChange={(v) => setField('signature', v)} />
                </div>
              </>
            )}

            {step === STEP.pay && (
              <>
                <p className="signup-pay-note">
                  {selectedPlan
                    ? `חיוב חודשי: ₪${selectedPlan.price} למסלול ${selectedPlan.latin}. הסליקה תופעל בהמשך — כרגע כל פרטי כרטיס יתקבלו.`
                    : 'הסליקה תופעל בהמשך — כרגע כל פרטי כרטיס יתקבלו.'}
                </p>
                <div className="field">
                  <label htmlFor="s-card-holder">שם בעל הכרטיס</label>
                  <input
                    id="s-card-holder"
                    placeholder="כפי שמופיע על הכרטיס"
                    value={form.cardHolder}
                    onChange={(e) => setField('cardHolder', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="s-card-number">מספר כרטיס</label>
                  <input
                    id="s-card-number"
                    dir="ltr"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={form.cardNumber}
                    onChange={(e) => setField('cardNumber', e.target.value)}
                  />
                </div>
                <div className="pay-row">
                  <div className="field">
                    <label htmlFor="s-card-exp">תוקף</label>
                    <input
                      id="s-card-exp"
                      dir="ltr"
                      placeholder="MM/YY"
                      value={form.cardExpiry}
                      onChange={(e) => setField('cardExpiry', e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="s-card-cvv">CVV</label>
                    <input
                      id="s-card-cvv"
                      dir="ltr"
                      inputMode="numeric"
                      placeholder="123"
                      value={form.cardCvv}
                      onChange={(e) => setField('cardCvv', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {error && <p className="form-err">{error}</p>}

            <div className="signup-nav">
              {step > 0 && (
                <button type="button" className="btn btn-outline" onClick={() => setStep((s) => s - 1)}>
                  חזרה
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="btn btn-wide" onClick={goNext}>
                  המשך
                </button>
              ) : (
                <button type="submit" className="btn btn-wide">
                  אישור והרשמה
                </button>
              )}
            </div>
          </form>
          <p className="form-note">
            כבר יש לך חשבון?{' '}
            <Link to="/login" className="link-gold">
              התחברי כאן
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
