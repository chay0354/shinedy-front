import { DEFAULT_RATES } from './kpiSupport.js';
import { enrichPlan } from './plans.js';

const META_KEY = 'shinedy-admin-meta';

const STATUS_TO_UNIT = {
  זמין: 'זמין',
  'אצל לקוחה': 'מושכר',
  'בדרך ללקוחה': 'מושכר',
  'בדרך חזרה': 'מושכר',
  בניקוי: 'בניקוי',
  'בתיקון': 'בניקוי',
};

export function loadAdminMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return { expenses: [], rates: { ...DEFAULT_RATES }, expSeq: 0 };
    const parsed = JSON.parse(raw);
    return {
      expenses: parsed.expenses || [],
      rates: { ...DEFAULT_RATES, ...(parsed.rates || {}) },
      expSeq: parsed.expSeq || 0,
    };
  } catch {
    return { expenses: [], rates: { ...DEFAULT_RATES }, expSeq: 0 };
  }
}

export function saveAdminMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function mapOrder(o, idx) {
  const items = (o.items || []).map((uid, i) => ({
    pid: typeof uid === 'string' ? uid.split('-')[0] : uid,
    serial: typeof uid === 'string' ? uid : `UNIT-${idx}-${i}`,
    since: o.date,
    returned: o.status === 'הוחזרה',
    returnedAt: o.status === 'הוחזרה' ? o.date : null,
  }));
  return {
    id: o.id,
    userId: o.customerName || o.userId || `user-${idx}`,
    customerName: o.customerName,
    type: o.type || 'הזמנה',
    status: o.status,
    date: o.date,
    createdAt: o.createdAt || o.date || new Date().toISOString(),
    items,
  };
}

function mapReturns(state) {
  return (state.activeReturnPouches || state.returnPouches || []).map((p) => ({
    id: p.id,
    userId: p.customerName || 'unknown',
    orderId: p.orderId,
    status: p.status === 'completed' ? 'הושלמה' : 'ממתינה להחזרה',
    createdAt: p.createdAt || new Date().toISOString(),
    completedAt: p.status === 'completed' ? new Date().toISOString() : null,
    deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    items: (p.returnItems || []).map((uid) => ({
      serial: uid,
      received: p.status === 'completed' || p.scanned,
      receivedAt: p.scanned ? new Date().toISOString() : null,
    })),
  }));
}

export function buildDbFromState(state) {
  const meta = loadAdminMeta();
  const plans = (state?.plans || []).map(enrichPlan);

  const products = (state?.inventory || state?.products || []).map((g) => {
    const base = (state.products || []).find((p) => p.id === g.id) || g;
    const units = (g.units || []).map((u) => ({
      serial: u.id,
      status: STATUS_TO_UNIT[u.status] || u.status,
      addedAt: u.addedAt || new Date().toISOString(),
      availableSince: u.availableSince || u.addedAt || new Date().toISOString(),
    }));
    return {
      ...base,
      available: base.inStock !== false,
      cost: base.price || 0,
      units: units.length ? units : [],
    };
  });

  if (products.length === 0 && state?.products) {
    for (const p of state.products) {
      products.push({ ...p, available: p.inStock !== false, cost: p.price || 0, units: [] });
    }
  }

  const users = (state?.customers || []).map((c, i) => ({
    id: `seed-${i}`,
    name: c.name,
    plan: plans.find((pl) => pl.name === c.plan || pl.latin === c.plan)?.id || plans[0]?.id,
    joinedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    creditsUsed: 0,
    creditsBalance: 0,
  }));

  if (state?.auth?.userId && state?.registration?.name) {
    users.unshift({
      id: state.auth.userId,
      name: state.registration.name,
      plan: state.planId || plans[0]?.id,
      joinedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      creditsUsed: 0,
      creditsBalance: state.credits || 0,
    });
  }

  return {
    plans,
    products,
    users,
    orders: (state?.orders || []).map(mapOrder),
    shipments: [],
    returns: mapReturns(state || {}),
    purchases: [],
    expenses: meta.expenses,
    rates: meta.rates,
    expSeq: meta.expSeq,
    returnMarks: {},
    box: {},
    notifications: [],
    audit: [],
  };
}

export function adminApiFromState(state, setMeta) {
  const meta = loadAdminMeta();

  return {
    addExpense(exp) {
      meta.expSeq += 1;
      meta.expenses.push({
        id: `EXP-${String(meta.expSeq).padStart(4, '0')}`,
        ...exp,
      });
      saveAdminMeta(meta);
      setMeta?.({ ...meta });
      return meta;
    },
    setRates(patch) {
      meta.rates = { ...meta.rates, ...patch };
      saveAdminMeta(meta);
      setMeta?.({ ...meta });
      return meta;
    },
    getMeta: () => meta,
  };
}
