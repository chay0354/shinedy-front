export function nextAfterAuth(data, navigate, { email, phone } = {}) {
  const mail = email || data?.registration?.email || '';
  const tel = phone || data?.registration?.phone || '';
  if (mail) sessionStorage.setItem('shinedy_verify_email', mail);
  if (tel) sessionStorage.setItem('shinedy_verify_phone', tel);
  if (data?.needsEmailVerification) {
    navigate('/verify-email', { state: { email: mail, phone: tel } });
    return true;
  }
  if (data?.needsPhoneVerification) {
    navigate('/verify-phone', { state: { phone: tel } });
    return true;
  }
  return false;
}
