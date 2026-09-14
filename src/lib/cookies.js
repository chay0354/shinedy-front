const KEY = 'shinedy_cookie_consent';

export function getCookieConsent() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCookieConsent(choice) {
  const all = choice === 'all';
  const value = {
    necessary: true,
    analytics: all,
    marketing: all,
    choice,
    at: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(value));
  return value;
}

export function clearCookieConsent() {
  localStorage.removeItem(KEY);
}
