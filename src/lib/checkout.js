import { api } from '../api';

/**
 * Sends the customer to the secure Hyp payment page. When nothing has to be paid
 * (or in demo mode) the server finishes right away and returns the new state.
 * Resolves to the snapshot in that case, or null while the browser navigates away.
 */
export async function goToCheckout(payload, run) {
  const data = await run(async () => {
    const res = await api.startCheckout(payload);
    if (res.url) {
      window.location.assign(res.url);
      return { ...(await api.getState()), redirecting: true };
    }
    return res;
  });
  if (!data || data.redirecting) return null;
  return data;
}

/** Completes a purchase from PurchaseDialog: saved card / credits here, new card on the Hyp page. */
export async function submitPurchase(item, opts, run) {
  const { viaPaymentPage, useSavedCard, saveCard, ...rest } = opts;
  const purchase = { ...item, ...rest };
  if (viaPaymentPage) return goToCheckout({ kind: 'purchase', purchase, saveCard }, run);
  return run(() => api.purchase(purchase));
}
