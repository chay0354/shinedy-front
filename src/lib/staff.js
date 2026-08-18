export const STAFF_ROLES = ['מנהלת', 'מחסן', 'שירות לקוחות'];

export const ADMIN_TABS = [
  { path: '/admin', label: 'דשבורד' },
  { path: '/admin/warehouse', label: 'מחסן' },
  { path: '/admin/rentals', label: 'ניהול השכרות' },
  { path: '/admin/inventory', label: 'ניהול מלאי' },
  { path: '/admin/customers', label: 'ניהול לקוחות' },
  { path: '/admin/subscriptions', label: 'ניהול מסלולים' },
  { path: '/admin/expenses', label: 'כספים' },
  { path: '/admin/reports', label: 'דוחות' },
];

export const ROLE_PRESETS = {
  מנהלת: null,
  מחסן: ['/admin/warehouse', '/admin/rentals', '/admin/inventory'],
  'שירות לקוחות': ['/admin/customers', '/admin/rentals', '/admin/warehouse'],
};

export function staffAccessList(staff) {
  if (!staff) return [];
  if (staff.role === 'מנהלת') return null;
  return staff.access || ROLE_PRESETS[staff.role] || [];
}

export function staffCanAccess(staff, path) {
  if (!staff) return false;
  if (staff.role === 'מנהלת') return true;
  if (path.startsWith('/admin/settings')) return false;
  const list = staffAccessList(staff) || [];
  const expanded = list.includes('/admin/warehouse') ? [...list, '/admin/returns'] : list;
  return expanded.some((p) => (p === '/admin' ? path === '/admin' : path === p || path.startsWith(`${p}/`)));
}

export function staffHome(staff) {
  if (!staff || staff.role === 'מנהלת') return '/admin';
  const list = staffAccessList(staff) || [];
  const first = ADMIN_TABS.find((t) => list.includes(t.path));
  return first ? first.path : '/admin/warehouse';
}

export function liveRoleToStaffRole(role) {
  if (role === 'admin') return 'מנהלת';
  if (role === 'warehouse') return 'מחסן';
  return 'שירות לקוחות';
}

export function currentStaff(state, staffList = []) {
  const role = state?.auth?.role;
  if (role !== 'admin' && role !== 'warehouse') return null;
  const name = state?.registration?.name || (role === 'admin' ? 'מנהלת ראשית' : 'מחסן');
  const match = staffList.find((s) => s.active && s.name === name);
  if (match) return match;
  const mapped = liveRoleToStaffRole(role);
  return {
    id: state?.auth?.userId || 'live-staff',
    name,
    role: mapped,
    access: ROLE_PRESETS[mapped],
    active: true,
    live: true,
  };
}
