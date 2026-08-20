import { PLANS } from './site.js';

const SITE_PLAN_LABELS = Object.fromEntries(PLANS.map((p) => [p.id, p.latin]));

export const PLAN_ALIASES = {
  silver: 'essentials',
  combined: 'signature',
  gold: 'prestige',
};

const ALIAS_BACK = Object.fromEntries(
  Object.entries(PLAN_ALIASES).map(([siteId, liveId]) => [liveId, siteId]),
);

export function planLatin(plan) {
  if (!plan) return '';
  return plan.latin || SITE_PLAN_LABELS[plan.id] || SITE_PLAN_LABELS[ALIAS_BACK[plan.id]] || plan.name || '';
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

export function publicCatalogPlans(livePlans) {
  const live = Array.isArray(livePlans) ? livePlans : [];
  const liveById = Object.fromEntries(live.map((p) => [p.id, p]));
  return PLANS.map((pack) =>
    enrichPlan({
      ...pack,
      ...(liveById[pack.id] || {}),
      latin: pack.latin,
      name: pack.name,
      materials: pack.materials,
      perks: pack.perks,
      featured: pack.featured,
      price: liveById[pack.id]?.price ?? pack.price,
      points: liveById[pack.id]?.points ?? pack.points,
    }),
  );
}

export function matchesPlanId(planId, otherId) {
  if (!planId || !otherId) return false;
  if (planId === otherId) return true;
  return PLAN_ALIASES[planId] === otherId || PLAN_ALIASES[otherId] === planId;
}

export function subscribePlanId(selectedId, livePlans) {
  const live = Array.isArray(livePlans) ? livePlans : [];
  if (live.some((p) => p.id === selectedId)) return selectedId;
  const alias = PLAN_ALIASES[selectedId];
  if (alias && live.some((p) => p.id === alias)) return alias;
  return selectedId;
}

export function signupHref(planId) {
  return planId ? `/signup?plan=${encodeURIComponent(planId)}` : '/signup';
}
