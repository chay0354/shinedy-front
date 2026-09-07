export function phoneKey(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('972')) digits = digits.slice(3);
  while (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export function isIsraeliMobile(phone) {
  return /^5\d{8}$/.test(phoneKey(phone));
}

export function toLocalIl(phone) {
  const key = phoneKey(phone);
  return isIsraeliMobile(key) ? `0${key}` : '';
}
