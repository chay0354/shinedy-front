const TOKEN_KEY = 'shinedy_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(session) {
  if (session?.access_token) {
    localStorage.setItem(TOKEN_KEY, session.access_token);
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

export function applySessionFromResponse(data) {
  if (data?.session?.access_token) {
    setSession(data.session);
  }
}
