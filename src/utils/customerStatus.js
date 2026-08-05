/** Status copy for the customer account (first-person). Staff UI keeps original labels. */
const CUSTOMER_STATUS = {
  'אצל לקוחה': 'הפריט אצלי',
  'בדרך ללקוחה': 'בדרך אליי',
  'בדרך חזרה': 'בתהליך החזרה',
  זמין: 'זמין',
  שמור: 'שמור',
  בניקוי: 'בניקוי',
  בתיקון: 'בתיקון',
};

export function customerStatusLabel(status) {
  return CUSTOMER_STATUS[status] || status;
}
