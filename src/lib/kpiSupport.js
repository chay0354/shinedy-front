export const FIXED_CATEGORIES = ['שכר', 'תוכנה', 'מחסן', 'ביטוח', 'מיסים'];
export const CAPEX_CATEGORIES = ['רכש תכשיטים'];
export const ACQUISITION_CATEGORIES = ['שיווק ופרסום'];

export const DEFAULT_RATES = {
  shippingPerOrder: 65,
  packagingPerOrder: 8,
  cleaningPerItem: 12,
  shipInsurancePerOrder: 4,
  paymentPct: 1.9,
  creditPct: 10,
  extraExchangeFee: 65,
};

export const EXPENSE_CATEGORIES = [
  'שיווק ופרסום',
  'רכש תכשיטים',
  'משלוחים',
  'ניקוי ותיקונים',
  'אריזה',
  'שכר',
  'תוכנה',
  'מחסן',
  'ביטוח',
  'מיסים',
  'אחר',
];

const DAY = 86400000;

export function unitsOut(p) {
  return (p.units || []).filter((u) => u.status === 'מושכר' || u.status === 'אצל לקוחה' || u.status === 'בדרך ללקוחה').length;
}

export function creditMonths(user, at) {
  const from = new Date(user.joinedAt || Date.now()).getTime();
  const to = user.canceledAt
    ? Math.min(new Date(user.canceledAt).getTime(), at ? new Date(at).getTime() : Date.now())
    : at
      ? new Date(at).getTime()
      : Date.now();
  if (to <= from) return 0;
  return Math.floor((to - from) / (DAY * 30));
}

export function creditEarned(db, user, at) {
  const price = (db.plans.find((p) => p.id === user.plan) || { price: 0 }).price;
  return creditMonths(user, at) * price * ((db.rates?.creditPct || 10) / 100);
}

export function creditBalance(db, user) {
  if (typeof user.creditsBalance === 'number') return user.creditsBalance;
  return Math.max(0, creditEarned(db, user) - (user.creditsUsed || 0));
}

export function totalCreditLiability(db) {
  return (db.users || []).reduce((s, u) => s + creditBalance(db, u), 0);
}

export function isActiveSubscriber(u, at) {
  const t = at ? new Date(at).getTime() : Date.now();
  const joined = new Date(u.joinedAt || 0).getTime();
  const canceled = u.canceledAt ? new Date(u.canceledAt).getTime() : Infinity;
  return joined <= t && canceled > t;
}
