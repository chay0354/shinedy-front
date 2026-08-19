import { enrichPlan } from './plans.js';

export function planLatin(plan) {
  return enrichPlan(plan || {}).latin;
}

export function isTopPlan(state) {
  const plans = state?.plans || [];
  if (!plans.length || !state?.planId) return true;
  const top = plans[plans.length - 1];
  return state.planId === top.id;
}

export function activeUnits(state) {
  const products = state?.products || [];
  const items = state?.myItems || [];
  const marked = state?.exchangeReturns || [];

  return items.map((item) => {
    const product = products.find((p) => p.id === item.productId || p.name === item.name) || {
      id: item.productId,
      name: item.name,
      category: item.category,
      metal: item.metal || '',
      stone: item.stone || '',
      points: item.points || 0,
      price: item.price || 0,
    };
    return {
      serial: item.unitId,
      pid: item.productId || product.id,
      product: {
        ...product,
        metal: product.metal || item.metal || '',
        stone: product.stone || item.stone || '',
        points: product.points || item.points || 0,
        price: product.price || item.price || 0,
      },
      marked: marked.includes(item.unitId),
    };
  });
}

export function pointsUsed(state) {
  const inBox = state?.cartTotal || 0;
  const remaining = state?.remaining ?? 0;
  const total = state?.pointsTotal || 0;
  return Math.max(0, total - remaining - inBox);
}

export function exchangeBlocked(state) {
  return (state?.myReturnPouches || []).some((p) => p.status !== 'completed');
}

export function openReturns(state) {
  return (state?.myReturnPouches || []).filter((p) => p.status !== 'completed');
}

export function heDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('he-IL');
}
