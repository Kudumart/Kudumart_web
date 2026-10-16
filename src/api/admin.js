import { ApiError } from './client';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.kudumart.com/api').replace(/\/$/, '');
const ADMIN_TOKEN = 'kuduAdminToken';

export const adminSession = {
  get: () => sessionStorage.getItem(ADMIN_TOKEN),
  set: token => sessionStorage.setItem(ADMIN_TOKEN, token),
  clear: () => sessionStorage.removeItem(ADMIN_TOKEN),
};

async function adminRequest(path, { method = 'GET', body, params, signal, authenticated = true } = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value)); });
  const token = adminSession.get();
  if (authenticated && !token) throw new ApiError('Please sign in as an administrator.', 401);
  const response = await fetch(url, { method, signal, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(authenticated ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok) throw new ApiError(payload?.message || `Request failed (${response.status}).`, response.status, payload);
  return payload;
}

export const adminApi = {
  login: async credentials => {
    const response = await adminRequest('/auth/admin/login', { method: 'POST', body: credentials, authenticated: false });
    const token = response?.data?.token || response?.token;
    if (!token) throw new ApiError('The admin login response did not include a session token.', 500);
    adminSession.set(token);
    return response?.data?.data || response?.data || {};
  },
  customers: (page = 1, signal) => adminRequest('/admin/customers', { params: { page }, signal }),
  vendors: (page = 1, signal) => adminRequest('/admin/vendors', { params: { page }, signal }),
  products: (page = 1, signal) => adminRequest('/admin/general/products', { params: { page }, signal }),
  orders: (page = 1, signal) => adminRequest('/admin/general/orders', { params: { page }, signal }),
  kyc: signal => adminRequest('/admin/kyc', { signal }),
};
