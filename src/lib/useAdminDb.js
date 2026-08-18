import { useMemo, useState } from 'react';
import { api as live } from '../api.js';
import { useApp } from '../state/AppContext';
import { heDate } from './accountHelpers.js';
import {
  adminApiFromState,
  buildDbFromState,
  planOf,
  salePriceFor,
  shipmentOf,
  SHIP_FLOW,
  unitsAvailable,
  unitsCleaning,
  unitsOut,
  unitsTotal,
  activeItems,
  activeUnits,
  isActiveSubscriber,
  openReturnsFor,
  pointsUsed,
  purchasesOf,
  creditBalance,
  creditMonths,
} from './dbFromState.js';

export {
  heDate,
  planOf,
  salePriceFor,
  shipmentOf,
  SHIP_FLOW,
  unitsAvailable,
  unitsCleaning,
  unitsOut,
  unitsTotal,
  activeItems,
  activeUnits,
  isActiveSubscriber,
  openReturnsFor,
  pointsUsed,
  purchasesOf,
  creditBalance,
  creditMonths,
};

export function daysSince(iso) {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function useAdminDb() {
  const { state, run, refresh } = useApp();
  const [tick, bump] = useState(0);
  const actor = state?.registration?.name || 'מערכת';
  const db = useMemo(() => buildDbFromState(state), [state, tick]);
  const local = useMemo(
    () => adminApiFromState(state, () => bump((n) => n + 1), actor),
    [state, actor],
  );

  const api = useMemo(
    () => ({
      ...local,
      async updatePlan(id, fields) {
        if (fields && typeof fields === 'object') {
          if (fields.price != null) await run(() => live.updatePlan(id, 'price', fields.price));
          if (fields.points != null) await run(() => live.updatePlan(id, 'points', fields.points));
          return;
        }
      },
      async saveProduct(p) {
        local.saveProductPatch(p.id || `local-${Date.now()}`, p);
        if (p.id) {
          try {
            if (p.points != null) await run(() => live.updateProduct(p.id, 'points', p.points));
            if (p.price != null) await run(() => live.updateProduct(p.id, 'price', p.price));
          } catch {
            /* local patch still saved */
          }
        }
      },
      async addUnit(productId) {
        await run(() => live.receiveUnit(productId));
      },
      async removeUnit(productId) {
        const g = (state.inventory || []).find((x) => x.id === productId);
        const avail = (g?.units || []).find((u) => u.status === 'זמין');
        if (avail) await run(() => live.setUnitStatus(avail.id, 'בניקוי'));
      },
      toggleAvailable(productId) {
        const dbNow = buildDbFromState(state);
        const p = dbNow.products.find((x) => x.id === productId);
        local.saveProductPatch(productId, { available: !(p?.available) });
      },
      async finishCleaning(productId, serial) {
        await run(() => live.markClean(serial));
      },
      async advanceFulfillment(orderId) {
        await run(() => live.advanceOrder(orderId));
      },
      async orderCourier(orderId) {
        await run(() => live.advanceOrder(orderId));
      },
      returnOrder() {
        return null;
      },
      markPurchaseShipped() {
        return null;
      },
      async scanReturnSerial(code) {
        try {
          await run(() => live.scanPouch(code));
          return { ok: true, msg: 'הפריט נסרק ✓' };
        } catch (e) {
          return { ok: false, msg: e.message };
        }
      },
      runReturnCheck() {},
      investigateReturn() {},
      simulateOverdue() {},
      advanceShipment() {},
      setAdminPass() {},
      async resetDemo() {
        await run(() => live.reset());
        await refresh();
      },
      suspendSubscription(id) {
        local.updateCustomer(id, { suspendedAt: new Date().toISOString() });
      },
      resumeSubscription(id) {
        local.updateCustomer(id, { suspendedAt: null });
      },
      cancelSubscription(id) {
        local.updateCustomer(id, { canceledAt: new Date().toISOString() });
      },
      reactivateSubscription(id) {
        local.updateCustomer(id, { canceledAt: null, suspendedAt: null });
      },
    }),
    [local, run, refresh, state],
  );

  return { db, api, state, run, refresh };
}
