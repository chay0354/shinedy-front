import { PLANS } from './site.js';

const PLAN_LATIN = Object.fromEntries(PLANS.map((p) => [p.id, p.latin]));

export function planLatin(plan) {
  if (!plan) return '';
  return plan.latin || PLAN_LATIN[plan.id] || plan.name || '';
}

export function enrichPlan(plan, index = 0) {
  const featuredIds = ['combined', 'signature'];
  return {
    ...plan,
    latin: planLatin(plan),
    featured: plan.featured ?? (featuredIds.includes(plan.id) || index === 1),
    materials: plan.materials || plan.tagline || '',
    perks: plan.perks || [
      `${plan.points} נקודות לבחירת תכשיטים`,
      plan.exchanges ? `${plan.exchanges} החלפות בחודש` : 'החלפות ללא הגבלה',
      plan.shipping ? 'משלוח דו-חודשי כלול' : 'משלוח בתשלום',
    ],
  };
}
