import { getToken } from './lib/auth.js';

const DEV_API = 'http://127.0.0.1:4000/api';

function apiBase() {
  // Always hit backend directly in dev — avoids flaky Vite proxy / stale .env
  if (import.meta.env.DEV) return DEV_API;
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return DEV_API;
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(path, options = {}) {
  const url = `${apiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: authHeaders(options.headers),
    });
  } catch {
    throw new Error(
      import.meta.env.DEV
        ? 'לא ניתן להתחבר לשרת — ודאי שה-backend רץ (npm run dev בתיקיית backend)'
        : 'לא ניתן להתחבר לשרת כרגע. נסי שוב בעוד רגע.',
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404 && !data.error) {
      throw new Error(
        import.meta.env.DEV
          ? 'נתיב API לא נמצא — ודאי שה-backend רץ על פורט 4000'
          : 'הפעולה לא זמינה כרגע. נסי שוב בעוד רגע.',
      );
    }
    throw new Error(data.error || 'בקשה נכשלה');
  }
  return data;
}

export const api = {
  getState: () => request('/state'),
  clearFlash: () => request('/flash/clear', { method: 'POST', body: '{}' }),
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
  logout: () => request('/auth/logout', { method: 'POST', body: '{}' }),
  updateRegistration: (patch) =>
    request('/auth/registration', { method: 'PATCH', body: JSON.stringify(patch) }),
  subscribe: (planId) =>
    request('/subscribe', { method: 'POST', body: JSON.stringify({ planId }) }),
  cancelSubscription: () => request('/subscribe/cancel', { method: 'POST', body: '{}' }),
  addToCart: (productId) =>
    request('/cart/add', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFromCart: (productId) =>
    request('/cart/remove', { method: 'POST', body: JSON.stringify({ productId }) }),
  confirmOrder: () => request('/cart/confirm', { method: 'POST', body: '{}' }),
  toggleReturn: (unitId) =>
    request('/exchange/toggle-return', {
      method: 'POST',
      body: JSON.stringify({ unitId }),
    }),
  addExchange: (productId) =>
    request('/exchange/add', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeExchange: (productId) =>
    request('/exchange/remove', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
  confirmExchange: () => request('/exchange/confirm', { method: 'POST', body: '{}' }),
  scanPouch: (qr) =>
    request('/warehouse/returns/scan', {
      method: 'POST',
      body: JSON.stringify({ qr }),
    }),
  confirmPouchContents: (pouchId) =>
    request(`/warehouse/returns/${pouchId}/confirm-contents`, {
      method: 'POST',
      body: '{}',
    }),
  pouchItemQC: (pouchId, unitId, result) =>
    request(`/warehouse/returns/${pouchId}/qc`, {
      method: 'POST',
      body: JSON.stringify({ unitId, result }),
    }),
  clearLastPouch: () => request('/returns/last/clear', { method: 'POST', body: '{}' }),
  cancelReturn: (pouchId) =>
    request(`/returns/${pouchId}/cancel`, { method: 'POST', body: '{}' }),
  updatePlan: (id, field, value) =>
    request(`/admin/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ field, value }),
    }),
  updateProduct: (id, field, value) =>
    request(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ field, value }),
    }),
  setUnitStatus: (id, status) =>
    request(`/admin/units/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  advanceOrder: (id) =>
    request(`/warehouse/orders/${id}/advance`, { method: 'POST', body: '{}' }),
  receiveUnit: (modelId) =>
    request('/warehouse/receive', {
      method: 'POST',
      body: JSON.stringify({ modelId }),
    }),
  returnQC: (unitId, result) =>
    request(`/warehouse/returns/${unitId}/qc-unit`, {
      method: 'POST',
      body: JSON.stringify({ result }),
    }),
  markClean: (unitId) =>
    request(`/warehouse/cleaning/${unitId}/available`, {
      method: 'POST',
      body: '{}',
    }),
  reset: () => request('/reset', { method: 'POST', body: '{}' }),
};
