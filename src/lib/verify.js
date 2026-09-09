import { api } from '../api';
import { clearSession } from './auth';

export async function leaveVerification({ refresh, navigate }) {
  try {
    await api.logout();
  } catch {
    /* already signed out */
  }
  clearSession();
  sessionStorage.removeItem('shinedy_verify_email');
  sessionStorage.removeItem('shinedy_verify_phone');
  if (refresh) await refresh();
  navigate('/login', { replace: true });
}

export function nextAfterAuth(data, navigate, { email, phone } = {}) {
  const mail = email || data?.registration?.email || '';
  const tel = phone || data?.registration?.phone || '';
  if (mail) sessionStorage.setItem('shinedy_verify_email', mail);
  if (tel) sessionStorage.setItem('shinedy_verify_phone', tel);
  if (data?.needsEmailVerification) {
    navigate('/verify-email', {
      state: { email: mail, phone: tel, sendError: data.emailSendError || '' },
    });
    return true;
  }
  if (data?.needsPhoneVerification) {
    navigate('/verify-phone', { state: { email: mail, phone: tel, sendError: data.smsSendError || '' } });
    return true;
  }
  return false;
}
