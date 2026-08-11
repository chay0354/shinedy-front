import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { getToken } from '../../lib/auth';
import { useApp } from '../../state/AppContext';
import { SHARED_TERMS } from '../../lib/site';
import { enrichPlan } from '../../lib/plans';

export default function PlansPage() {
  const { state, run } = useApp();
  const navigate = useNavigate();
  const plans = (state?.plans || []).map(enrichPlan);
  const inAccount = window.location.pathname.startsWith('/account');

  async function pickPlan(planId) {
    if (!getToken()) {
      navigate(`/signup?plan=${planId}`);
      return;
    }
    const data = await run(() => api.subscribe(planId));
    if (!data) return;
    navigate(inAccount ? '/account/me' : '/catalog');
  }

  return (
    <>
      <div className="page-head container">
        <h1>מסלולי מנוי</h1>
        <p>בחרי את המסלול שהכי מתאים לך</p>
      </div>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container">
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className={`plan-card${plan.featured ? ' featured' : ''}`}>
                {plan.featured && <div className="flag">הכי פופולרי</div>}
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
                {getToken() ? (
                  <button type="button" className={`btn${plan.featured ? ' btn-tan' : ''}`} onClick={() => pickPlan(plan.id)}>
                    אני בוחרת
                  </button>
                ) : (
                  <Link to={`/signup?plan=${plan.id}`} className={`btn${plan.featured ? ' btn-tan' : ''}`}>
                    אני בוחרת
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="plans-note-line">
            ללא התחייבות<span className="dot">•</span>ניתן לבטל בכל עת
          </div>

          <div className="plans-terms">
            <strong>טוב לדעת:</strong>
            <ul style={{ margin: '10px 0 0 0', paddingInlineStart: 22 }}>
              {SHARED_TERMS.map((t) => (
                <li key={t} style={{ marginBottom: 6 }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
