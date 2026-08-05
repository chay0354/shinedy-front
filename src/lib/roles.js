export function getUserRole(state) {
  return state?.auth?.role || null;
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

export function homePathForRole(role, subscribed = true) {
  if (role === 'admin') return '/admin/products';
  if (role === 'warehouse') return '/warehouse/orders';
  if (!subscribed) return '/account/plans';
  return '/account/shop';
}
