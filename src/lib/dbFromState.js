import { DEFAULT_RATES } from './kpiSupport.js';
import { enrichPlan } from './plans.js';
import { ROLE_PRESETS } from './staff.js';
import { PRODUCTS } from './site.js';

const META_KEY = 'shinedy-admin-meta';
const DAY = 86400000;

const STATUS_TO_UNIT = {
  זמין: 'זמין',
  'אצל לקוחה': 'מושכר',
  'בדרך ללקוחה': 'מושכר',
  'בדרך חזרה': 'מושכר',
  בניקוי: 'בניקוי',
  בתיקון: 'בניקוי',
};

function nowIso() {
  return new Date().toISOString();
}

function defaultStaff() {
  return [
    {
      id: 'st1',
      name: 'מנהלת ראשית',
      role: 'מנהלת',
      access: null,
      pass: '',
      active: true,
      createdAt: nowIso(),
    },
  ];
}

export function loadAdminMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) {
      return emptyMeta();
    }
    const parsed = JSON.parse(raw);
    return normalizeMeta(parsed);
  } catch {
    return emptyMeta();
  }
}

function emptyMeta() {
  return normalizeMeta({});
}

function normalizeMeta(parsed) {
  const rates = { ...DEFAULT_RATES, ...(parsed.rates || {}) };
  const staff = parsed.staff?.length ? parsed.staff : defaultStaff();
  for (const s of staff) {
    if (s.access === undefined) s.access = s.role === 'מנהלת' ? null : (ROLE_PRESETS[s.role] || []).slice();
  }
  return {
    expenses: parsed.expenses || [],
    rates,
    expSeq: parsed.expSeq || 0,
    cashOpening: parsed.cashOpening ?? null,
    debugMode: typeof parsed.debugMode === 'boolean' ? parsed.debugMode : false,
    staff,
    staffSeq: parsed.staffSeq || staff.length,
    customerPatches: parsed.customerPatches || {},
    productPatches: parsed.productPatches || {},
    purchases: parsed.purchases || [],
    audit: parsed.audit || [],
  };
}

export function saveAdminMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function audit(meta, text, actor) {
  meta.audit = meta.audit || [];
  meta.audit.unshift({ ts: nowIso(), text, actor: actor || 'מערכת' });
  if (meta.audit.length > 300) meta.audit.length = 300;
}

function sampleExpenses(meta) {
  const back = (days) => new Date(Date.now() - days * DAY).toISOString();
  const rows = [];
  const add = (daysAgo, category, amount, note, recurring) => {
    meta.expSeq += 1;
    rows.push({
      id: `EXP-${String(meta.expSeq).padStart(4, '0')}`,
      date: back(daysAgo),
      category,
      amount,
      note,
      recurring: !!recurring,
      endDate: null,
    });
  };
  add(175, 'שכר', 9000, 'משכורת עובד', true);
  add(175, 'מחסן', 1800, 'שכירות ותפעול מחסן', true);
  add(175, 'תוכנה', 420, 'מנויי תוכנה ומערכות', true);
  add(175, 'ביטוח', 650, 'ביטוח תכשיטים ועסק', true);
  add(175, 'שיווק ופרסום', 3200, 'קמפיינים ברשתות', true);
  add(170, 'רכש תכשיטים', 42000, 'רכש מלאי פתיחה', false);
  add(75, 'רכש תכשיטים', 12500, 'הרחבת קולקציה', false);
  return rows;
}

function skuFor(p) {
  if (p.sku) return p.sku;
  const CAT_CODE = { טבעות: 'RNG', עגילים: 'EAR', שרשראות: 'NCK', צמידים: 'BRC' };
  const cat = CAT_CODE[p.category] || 'JWL';
  const tail = String(p.id || 'x').split('-').pop().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${cat}-${(tail.slice(0, 3) || 'X').padEnd(3, '0')}`;
}

function mapOrder(o, idx) {
  const items = (o.items || o.itemIds || []).map((uid, i) => {
    const serial = typeof uid === 'string' ? uid : uid?.serial || `UNIT-${idx}-${i}`;
    const pid = typeof uid === 'string' ? uid.split('-')[0] : uid?.pid || uid?.modelId;
    return {
      pid,
      serial,
      since: o.date || o.createdAt,
      returned: o.status === 'הוחזרה',
      returnedAt: o.status === 'הוחזרה' ? o.date : null,
    };
  });
  return {
    id: o.id,
    userId: o.userId || o.customerId || o.customerName || `user-${idx}`,
    customerName: o.customerName,
    type: o.type || 'הזמנה',
    status: o.status,
    date: o.date,
    createdAt: o.createdAt || o.date || nowIso(),
    items,
    returns: o.returns || [],
  };
}

function mapReturns(state) {
  return (state.activeReturnPouches || state.returnPouches || []).map((p) => ({
    id: p.id,
    userId: p.userId || p.customerName || 'unknown',
    orderId: p.orderId || p.id,
    status: p.status === 'completed' ? 'הושלמה' : p.status === 'scanned' ? 'התקבלה חלקית' : 'ממתינה להחזרה',
    createdAt: p.createdAt || nowIso(),
    completedAt: p.status === 'completed' ? nowIso() : null,
    deadline: new Date(Date.now() + 5 * DAY).toISOString(),
    items: (p.items || p.returnItems || []).map((it) => {
      const serial = typeof it === 'string' ? it : it.unitId || it.serial;
      return {
        serial,
        pid: typeof it === 'string' ? it.split('-')[0] : it.modelId || it.pid,
        received: p.status === 'completed' || p.scanned || it.received,
        receivedAt: p.scanned || it.receivedAt ? nowIso() : null,
      };
    }),
  }));
}

function mapUser(c, i, plans, patch) {
  const id = c.id || `seed-${i}`;
  const plan =
    plans.find((pl) => pl.id === c.planId || pl.name === c.plan || pl.latin === c.plan)?.id || plans[0]?.id;
  const canceledAt = c.status === 'מוקפא' || c.status === 'עזבה' ? nowIso() : null;
  const base = {
    id,
    name: c.name,
    phone: c.phone || '',
    email: c.email || '',
    plan,
    joined: c.joined || new Date(Date.now() - 90 * DAY).toLocaleDateString('he-IL'),
    joinedAt: c.joinedAt || new Date(Date.now() - 90 * DAY).toISOString(),
    creditsUsed: 0,
    creditsBalance: 0,
    exchangeBlocked: Boolean(c.exchangeBlocked),
    canceledAt,
    suspendedAt: c.status === 'מוקפא' ? nowIso() : null,
    address: { street: '', houseNo: '', apt: '', city: '', zip: '', notes: '' },
    nationalId: c.nationalId || '',
    idDocumentUploaded: Boolean(c.idDocumentUploaded || c.idDocumentUrl),
    signatureCompleted: Boolean(c.signatureCompleted),
    termsAcceptedAt: c.termsAcceptedAt || null,
  };
  return { ...base, ...(patch || {}) };
}

export function buildDbFromState(state) {
  const meta = loadAdminMeta();
  const plans = (state?.plans || []).map(enrichPlan);

  const products = (state?.inventory || state?.products || []).map((g) => {
    const base = (state.products || []).find((p) => p.id === g.id) || g;
    const seed = PRODUCTS.find((p) => p.id === g.id) || {};
    const patch = meta.productPatches[g.id] || {};
    const units = (g.units || []).map((u) => ({
      serial: u.id || u.serial,
      status: STATUS_TO_UNIT[u.status] || u.status,
      addedAt: u.addedAt || nowIso(),
      availableSince: u.availableSince || u.addedAt || nowIso(),
    }));
    return {
      ...seed,
      ...base,
      ...patch,
      sku: patch.sku || base.sku || skuFor(base),
      available: patch.available ?? base.inStock !== false,
      cost: patch.cost ?? base.cost ?? Math.round((base.price || seed.price || 0) / 1.77),
      price: patch.price ?? base.price ?? seed.price ?? 0,
      units: units.length ? units : [],
    };
  });

  if (products.length === 0 && state?.products) {
    for (const p of state.products) {
      const seed = PRODUCTS.find((x) => x.id === p.id) || {};
      const patch = meta.productPatches[p.id] || {};
      products.push({
        ...seed,
        ...p,
        ...patch,
        sku: skuFor(p),
        available: p.inStock !== false,
        cost: p.cost || 0,
        units: [],
      });
    }
  }

  for (const [id, patch] of Object.entries(meta.productPatches)) {
    if (!products.some((p) => p.id === id)) {
      products.push({
        id,
        units: [],
        available: true,
        cost: patch.cost || 0,
        ...patch,
        sku: patch.sku || skuFor(patch),
      });
    }
  }

  const users = (state?.customers || []).map((c, i) =>
    mapUser(c, i, plans, meta.customerPatches[c.id || `seed-${i}`]),
  );

  if (state?.auth?.userId && state?.registration?.name) {
    const existing = users.find((u) => u.id === state.auth.userId);
    if (!existing) {
      users.unshift(
        mapUser(
          {
            id: state.auth.userId,
            name: state.registration.name,
            phone: state.registration.phone,
            email: state.registration.email,
            planId: state.planId,
            nationalId: state.registration.nationalId,
            idDocumentUploaded: state.registration.idDocumentUploaded,
            signatureCompleted: state.registration.signatureCompleted,
            termsAcceptedAt: state.registration.termsAcceptedAt,
          },
          0,
          plans,
          meta.customerPatches[state.auth.userId],
        ),
      );
    }
  }

  const orders = (state?.orders || []).map((o, idx) => {
    const mapped = mapOrder(o, idx);
    const match = users.find((u) => u.name === o.customerName);
    if (match) mapped.userId = match.id;
    return mapped;
  });
  const returns = mapReturns(state || {}).map((r) => {
    const match = users.find((u) => u.name === r.userId || u.id === r.userId);
    if (match) r.userId = match.id;
    return r;
  });
  const shipments = orders
    .filter((o) => ['נשלח', 'נשלחה', 'נמסרה'].includes(o.status))
    .map((o) => ({
      id: `SHP-${o.id}`,
      orderId: o.id,
      tracking: `TRK-${o.id}`,
      courier: 'שליח',
      date: o.date,
      status: o.status === 'נמסרה' ? 'נמסר ללקוחה' : 'נאסף מהמחסן',
    }));

  const livePurchases = [
    ...(state?.purchases || []),
    ...(state?.myPurchases || []),
    ...(state?.orders || [])
      .filter((o) => o.type === 'רכישה')
      .map((o) => {
        const metaRow = (o.newItems || []).find((x) => x && x.kind === 'purchase-meta') || {};
        const serial = Array.isArray(o.items) ? o.items[0] : o.items;
        return {
          id: o.id,
          userId: o.userId || null,
          buyer: metaRow.buyer || null,
          recipient: o.customerName,
          pid: metaRow.pid,
          serial,
          name: metaRow.name || o.itemsLabel,
          sku: metaRow.sku,
          date: o.date,
          price: Number(metaRow.price) || 0,
          creditUsed: Number(metaRow.creditUsed) || 0,
          paid: Number(metaRow.paid) || 0,
          address: metaRow.address || {},
          needsShipping: Boolean(metaRow.needsShipping) && !metaRow.shippedAt,
          shippedAt: metaRow.shippedAt || null,
        };
      }),
  ];
  const purchases = [...meta.purchases, ...livePurchases].filter(
    (p, i, arr) => p?.id && arr.findIndex((x) => x.id === p.id) === i,
  );

  return {
    plans,
    products,
    users,
    orders,
    shipments,
    returns,
    purchases,
    expenses: meta.expenses,
    rates: meta.rates,
    expSeq: meta.expSeq,
    cashOpening: meta.cashOpening,
    debugMode: meta.debugMode,
    staff: meta.staff,
    returnMarks: {},
    box: {},
    notifications: [],
    audit: meta.audit,
  };
}

export function adminApiFromState(state, setMeta, actor) {
  const persist = (mutator) => {
    const meta = loadAdminMeta();
    const result = mutator(meta);
    saveAdminMeta(meta);
    setMeta?.({ ...meta });
    return result === undefined ? meta : result;
  };

  return {
    addExpense(exp) {
      return persist((meta) => {
        meta.expSeq += 1;
        meta.expenses.push({
          id: `EXP-${String(meta.expSeq).padStart(4, '0')}`,
          ...exp,
        });
        audit(meta, `נרשמה הוצאה ${exp.category} ₪${exp.amount}`, actor);
      });
    },
    setRates(patch) {
      return persist((meta) => {
        meta.rates = { ...meta.rates, ...patch };
        audit(meta, 'עודכנו תעריפי עלות משתנה', actor);
      });
    },
    stopRecurring(id) {
      return persist((meta) => {
        const e = meta.expenses.find((x) => x.id === id);
        if (e) e.endDate = nowIso();
      });
    },
    resumeRecurring(id) {
      return persist((meta) => {
        const e = meta.expenses.find((x) => x.id === id);
        if (e) e.endDate = null;
      });
    },
    deleteExpense(id) {
      return persist((meta) => {
        meta.expenses = meta.expenses.filter((x) => x.id !== id);
      });
    },
    loadSampleExpenses() {
      return persist((meta) => {
        meta.expenses = [...meta.expenses, ...sampleExpenses(meta)];
        audit(meta, 'נטענו הוצאות לדוגמה', actor);
      });
    },
    setCashOpening(value) {
      return persist((meta) => {
        meta.cashOpening = value === '' || value == null ? null : Number(value);
      });
    },
    setDebugMode(on) {
      return persist((meta) => {
        meta.debugMode = !!on;
      });
    },
    addStaff({ name, role, pass, access }) {
      if (!name?.trim()) return 'חסר שם';
      if (!pass || pass.length < 6) return 'הסיסמה חייבת להיות באורך 6 תווים לפחות';
      return persist((meta) => {
        meta.staffSeq += 1;
        const acc = role === 'מנהלת' ? null : access && access.length ? access.slice() : (ROLE_PRESETS[role] || []).slice();
        meta.staff.push({
          id: `st${meta.staffSeq}`,
          name: name.trim(),
          role,
          pass,
          access: acc,
          active: true,
          createdAt: nowIso(),
        });
        audit(meta, `נוספה משתמשת מערכת ${name.trim()} (${role})`, actor);
        return null;
      });
    },
    setStaffAccess(id, access) {
      return persist((meta) => {
        const s = meta.staff.find((x) => x.id === id);
        if (s && s.role !== 'מנהלת') s.access = access.slice();
      });
    },
    toggleStaff(id) {
      return persist((meta) => {
        const s = meta.staff.find((x) => x.id === id);
        if (s) s.active = !s.active;
      });
    },
    updateCustomer(id, patch) {
      return persist((meta) => {
        meta.customerPatches[id] = { ...(meta.customerPatches[id] || {}), ...patch };
        audit(meta, `עודכנו פרטי לקוחה ${id}`, actor);
      });
    },
    saveProductPatch(id, patch) {
      return persist((meta) => {
        meta.productPatches[id] = { ...(meta.productPatches[id] || {}), ...patch };
      });
    },
    getMeta: () => loadAdminMeta(),
  };
}

export function salePriceFor(cost) {
  return Math.round((Number(cost) || 0) * 1.5 * 1.18);
}

export function unitsTotal(p) {
  return (p.units || []).length;
}
export function unitsOut(p) {
  return (p.units || []).filter((u) => u.status === 'מושכר').length;
}
export function unitsCleaning(p) {
  return (p.units || []).filter((u) => u.status === 'בניקוי').length;
}
export function unitsAvailable(p) {
  return (p.units || []).filter((u) => u.status === 'זמין').length;
}

export function planOf(db, user) {
  return db.plans.find((p) => p.id === (user && user.plan)) || db.plans[0] || {};
}

export function isActiveSubscriber(u) {
  return !u?.canceledAt && !u?.suspendedAt;
}

export function activeUnits(db, userId) {
  const out = [];
  for (const o of db.orders || []) {
    if (o.userId !== userId && o.customerName !== userId) continue;
    for (const it of o.items || []) {
      if (it.returned) continue;
      const product = db.products.find((p) => p.id === it.pid);
      if (product) out.push({ ...it, product });
    }
  }
  return out;
}

export function activeItems(db, userId) {
  return activeUnits(db, userId).map((u) => u.product);
}

export function pointsUsed(db, userId) {
  return activeUnits(db, userId).reduce((s, u) => s + (u.product?.points || 0), 0);
}

export function openReturnsFor(db, userId) {
  return (db.returns || []).filter((r) => r.userId === userId && r.status !== 'הושלמה');
}

export function purchasesOf(db, userId) {
  return (db.purchases || []).filter((p) => p.userId === userId);
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

export function creditBalance(db, user) {
  if (typeof user.creditsBalance === 'number') return user.creditsBalance;
  const price = (db.plans.find((p) => p.id === user.plan) || { price: 0 }).price;
  return Math.max(0, creditMonths(user) * price * ((db.rates?.creditPct || 10) / 100) - (user.creditsUsed || 0));
}

export function shipmentOf(db, orderId) {
  return (db.shipments || []).find((s) => s.orderId === orderId) || null;
}

export const SHIP_FLOW = ['שליח הוזמן', 'נאסף מהמחסן', 'נמסר ללקוחה'];
