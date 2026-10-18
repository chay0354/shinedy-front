export const PENDING_ORDER_STATUSES = ['חדשה', 'בליקוט', 'ליקוט', 'נארזה', 'בקרה', 'אריזה'];
const IN_TRANSIT_STATUSES = ['נשלח', 'נשלחה'];
export function computeOrderStats(orders = []) {
  const pending = orders.filter((o) => PENDING_ORDER_STATUSES.includes(o.status)).length;
  const inTransit = orders.filter((o) => IN_TRANSIT_STATUSES.includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === 'נמסרה').length;
  const total = orders.length;
  const open = pending + inTransit;
  return { total, open, pending, inTransit, delivered };
}

export function computeAdminOverview(db) {
  const pendingOrders = computeOrderStats(db.orders).pending;
  const cleaningUnits = db.products.reduce(
    (sum, prod) => sum + prod.units.filter((u) => u.status === 'בניקוי').length,
    0,
  );
  const ordersInTransit = db.orders.filter((o) => ['נשלח', 'נשלחה'].includes(o.status)).length;
  const ordersDelivered = db.orders.filter((o) => o.status === 'נמסרה').length;
  const openReturns = db.returns.filter((r) => r.status !== 'הושלמה').length;
  const overdueReturns = db.returns.filter(
    (r) => r.status !== 'הושלמה' && Date.now() > new Date(r.deadline).getTime(),
  ).length;

  return {
    pendingOrders,
    cleaningUnits,
    ordersInTransit,
    ordersDelivered,
    openReturns,
    overdueReturns,
  };
}
