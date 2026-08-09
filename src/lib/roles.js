export function getUserRole(state) {
  return state?.auth?.role || null;
}

/** User has an active subscription (flag or legacy plan_id in profile). */
export function hasActivePlan(state) {
  return Boolean(state?.subscribed || state?.planId);
}

export function isAdmin(state) {
  return getUserRole(state) === 'admin';
}

export function isWarehouse(state) {
  return getUserRole(state) === 'warehouse';
}

export function isStaff(state) {
  const role = getUserRole(state);
  return role === 'admin' || role === 'warehouse';
}

export function homePathForRole(role, subscribed = true, planId = null) {
  if (role === 'admin') return '/admin/products';
  if (role === 'warehouse') return '/warehouse/orders';
  if (!subscribed && !planId) return '/account/plans';
  return '/account/shop';
}
