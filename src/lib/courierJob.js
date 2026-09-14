export const COURIER_JOBS = {
  delivery: 'delivery',
  pickup: 'pickup',
  both: 'both',
};

const LABELS = {
  delivery: 'משלוח',
  pickup: 'איסוף',
  both: 'משלוח ואיסוף',
};

const NO_POD_PLANS = new Set(['silver', 'essentials']);
const POD_PLANS = new Set(['combined', 'signature', 'gold', 'prestige']);

export function planRequiresDeliverySignature(planId) {
  if (!planId) return false;
  if (NO_POD_PLANS.has(planId)) return false;
  if (POD_PLANS.has(planId)) return true;
  return false;
}

export function deliverySignatureLabel(required) {
  return required ? 'חתימת מסירה נדרשת' : 'ללא חתימת מסירה';
}

export function courierJobLabel(job) {
  return LABELS[job] || '';
}

export function resolveCourierJob(order) {
  if (!order) return null;
  if (order.courierJob && LABELS[order.courierJob]) return order.courierJob;
  const type = order.type || 'הזמנה';
  const returns = order.returnItems || order.returns || [];
  const items = order.items || [];
  if (type === 'החזרה' || (!items.length && returns.length)) return COURIER_JOBS.pickup;
  if (type === 'רכישה' || type === 'מכירה' || type === 'הזמנה ראשונה') return COURIER_JOBS.delivery;
  if (type === 'החלפה' || (Array.isArray(returns) && returns.length)) return COURIER_JOBS.both;
  return COURIER_JOBS.delivery;
}

export function resolveDeliverySignature(order, planId) {
  if (typeof order?.deliverySignatureRequired === 'boolean') return order.deliverySignatureRequired;
  return planRequiresDeliverySignature(planId || order?.planId);
}

export function courierActionLabel(job) {
  if (job === COURIER_JOBS.pickup) return 'הזמיני שליח — איסוף';
  if (job === COURIER_JOBS.both) return 'הזמיני שליח — משלוח ואיסוף';
  return 'הזמיני שליח — משלוח';
}
