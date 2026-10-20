const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.kudumart.com/api').replace(/\/$/, '');
const TOKEN_KEY = 'kuduUserToken';

export class ApiError extends Error {
  constructor(message, status, details) { super(message); this.name = 'ApiError'; this.status = status; this.details = details; }
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (value) => localStorage.setItem(TOKEN_KEY, value),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export async function request(path, { method = 'GET', body, params, signal, authenticated = false } = {}) {
  const url = new URL(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
  Object.entries(params || {}).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value)); });
  const token = tokenStore.get();
  if (authenticated && !token) throw new ApiError('Please sign in to continue.', 401);
  const response = await fetch(url, {
    method, signal,
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (response.status === 401 && authenticated && token) {
    tokenStore.clear();
    window.dispatchEvent(new CustomEvent('kudu:session-expired', {
      detail: { returnTo: `${window.location.pathname}${window.location.search}${window.location.hash}` },
    }));
  }
  if (!response.ok) throw new ApiError(payload?.message || `Request failed (${response.status}).`, response.status, payload);
  return payload;
}

export const unwrap = (payload) => payload?.data ?? payload;
