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
          if (fields.price != null) {
            const data = await run(() => live.updatePlan(id, 'price', fields.price));
            if (!data) return false;
          }
          if (fields.points != null) {
            const data = await run(() => live.updatePlan(id, 'points', fields.points));
            if (!data) return false;
          }
          return true;
        }
        return false;
      },
      async saveProduct(p) {
        const prefix = { טבעות: 'R', עגילים: 'E', שרשראות: 'N', צמידים: 'B' }[p.category] || 'J';
        let id =
          String(p.id || p.sku || '')
            .trim()
            .replace(/[^A-Za-z0-9]/g, '')
            .toUpperCase() || `${prefix}${Date.now().toString(36).toUpperCase()}`;
        if (!p.id) {
          const created = await run(() => live.createProduct({ ...p, id }));
          if (!created) return false;
        } else {
          const fields = ['name', 'category', 'metal', 'stone', 'points', 'price'];
          for (const field of fields) {
            if (p[field] != null) {
              try {
                await run(() => live.updateProduct(id, field, p[field]));
              } catch {
                /* local patch still saved */
              }
            }
          }
        }
        local.saveProductPatch(id, { ...p, id });
        return true;
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
      markPurchaseShipped(id) {
        return run(() => live.markPurchaseShipped(id));
      },
      async scanReturnSerial(code) {
        try {
          await run(() => live.scanPouch(code));
          return { ok: true, msg: 'הפריט נסרק ✓' };
        } catch (e) {
          return { ok: false, msg: e.message };
        }
      },
      runReturnCheck() {
        local.applyReturnCheck(buildDbFromState(state));
      },
      investigateReturn(returnId, outcome) {
        local.investigateReturn(returnId, outcome);
      },
      simulateOverdue(returnId) {
        local.simulateOverdue(returnId);
      },
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
