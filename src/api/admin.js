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
  vendor: (userId, signal) => adminRequest('/admin/user/details', { params: { userId }, signal }),
  toggleUserStatus: userId => adminRequest('/admin/toggle/user/status', { method: 'PATCH', params: { userId } }),
  subscriptionPlans: signal => adminRequest('/admin/subscription/plans', { signal }),
  vendorOffers: (vendorId, signal) => adminRequest(`/admin/vendors/${vendorId}/subscription-offers`, { signal }),
  saveVendorOffer: (vendorId, body) => adminRequest(`/admin/vendors/${vendorId}/subscription-offers`, { method: 'POST', body }),
  revokeVendorOffer: offerId => adminRequest(`/admin/subscription-offers/${offerId}/revoke`, { method: 'PATCH' }),
  setPlanWaiver: (planId, waived) => adminRequest(`/admin/subscription/plans/${planId}/fee-waiver`, { method: 'PATCH', body: { waived } }),
  products: (page = 1, signal, filters = {}) => adminRequest('/admin/general/products', { params: { page, ...filters }, signal }),
  product: (productId, signal) => adminRequest('/admin/general/product/view', { params: { productId }, signal }),
  publishProduct: productId => adminRequest('/admin/general/product/publish', { method: 'PUT', params: { productId } }),
  unpublishProduct: productId => adminRequest('/admin/general/product/unpublished', { method: 'PUT', params: { productId } }),
  deleteProduct: productId => adminRequest('/admin/general/product/delete', { method: 'DELETE', params: { productId } }),
  orders: (page = 1, signal, filters = {}) => adminRequest('/admin/general/orders', { params: { page, ...filters }, signal }),
  orderItems: (orderId, signal) => adminRequest('/admin/general/order/items', { params: { orderId, limit: 100 }, signal }),
  orderDetails: (orderId, signal) => adminRequest('/admin/order/item/details', { params: { orderId }, signal }),
  orderPayments: (orderId, signal) => adminRequest('/admin/general/order/payment', { params: { orderId, limit: 100 }, signal }),
  updateOrderStatus: (orderItemId, status, deliveryCode) => adminRequest('/admin/order/item/update/status', { method: 'POST', body: { orderItemId, status, ...(deliveryCode ? { deliveryCode } : {}) } }),
  transactions: (page = 1, signal, filters = {}) => adminRequest('/admin/transactions', { params: { page, ...filters }, signal }),
  withdrawals: (signal, filters = {}) => adminRequest('/admin/payout/reports', { params: filters, signal }),
  payoutStats: signal => adminRequest('/admin/payout/stats', { signal }),
  updateWithdrawal: (id, status, details = {}) => adminRequest('/admin/withdrawal/update/status', {
    method: 'POST',
    body: { id, status, ...details },
  }),
  kyc: signal => adminRequest('/admin/kyc', { signal }),
  reviewKyc: (kycId, fieldReviews) => adminRequest('/admin/kyc/approve-reject', {
    method: 'POST',
    body: { kycId, fieldReviews },
  }),
};
