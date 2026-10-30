import { request, unwrap } from './client';
import { uploadImage } from './upload';

const optionalList = async (path, options = {}) => {
  try { return unwrap(await request(path, { authenticated: true, ...options })); }
  catch (error) { if (error.status === 404) return []; throw error; }
};

export const sellerApi = {
  kyc: async signal => unwrap(await request('/vendor/kyc', { authenticated: true, signal })),
  submitKyc: async values => unwrap(await request('/vendor/kyc', { method: 'POST', authenticated: true, body: values })),
  stats: async signal => unwrap(await request('/vendor/dashboard/stats', { authenticated: true, signal })),
  products: signal => optionalList('/vendor/vendors/products', { signal }),
  auctionProducts: signal => optionalList('/vendor/auction/products', { signal }),
  stores: signal => optionalList('/vendor/store', { signal }),
  orders: signal => optionalList('/vendor/order/items', { signal }),
  order: async (orderId, signal) => unwrap(await request('/vendor/order/item/details', { authenticated: true, params: { orderId }, signal })),
  updateOrderStatus: async (orderItemId, status, deliveryCode = '') => unwrap(await request('/user/order/item/update/status', { method: 'POST', authenticated: true, body: { orderItemId, status, ...(deliveryCode ? { deliveryCode } : {}) } })),
  wallet: async signal => unwrap(await request('/vendor/wallet/stats', { authenticated: true, signal })),
  transactions: (page = 1, signal) => request('/vendor/wallet/transactions', { authenticated: true, params: { page, limit: 10 }, signal }),
  banks: signal => optionalList('/vendor/bank/informations', { signal }),
  supportedBanks: signal => optionalList('/vendor/banks', { signal }),
  resolveBank: async (bankCode, accountNumber) => unwrap(await request('/vendor/bank/resolve', { authenticated: true, params: { bankCode, accountNumber } })),
  addBank: async values => unwrap(await request('/vendor/bank/informations/v2', { method: 'POST', authenticated: true, body: values })),
  deleteBank: async bankId => unwrap(await request('/vendor/bank/information', { method: 'DELETE', authenticated: true, params: { bankId } })),
  withdrawals: signal => optionalList('/vendor/withdrawals', { signal }),
  requestWithdrawal: async values => unwrap(await request('/vendor/withdrawal', { method: 'POST', authenticated: true, body: values })),
  subscriptionPlans: async signal => unwrap(await request('/vendor/subscription/plans', { authenticated: true, signal })),
  paymentGateways: async signal => unwrap(await request('/user/payment/gateway', { authenticated: true, signal })),
  subscribe: async (subscriptionPlanId, refId) => unwrap(await request('/vendor/subscribe', { method: 'POST', authenticated: true, body: { subscriptionPlanId, refId, isWallet: false } })),
  cancelSubscription: async () => unwrap(await request('/vendor/subscription/cancel', { method: 'DELETE', authenticated: true })),
  offers: (page = 1, status = '', signal) => request('/vendor/offers', { authenticated: true, params: { page, limit: 10, status }, signal }),
  respondToOffer: async (offerId, status, counterPrice) => unwrap(await request(`/vendor/offers/${offerId}`, { method: 'PUT', authenticated: true, body: { status, ...(status === 'countered' ? { counterPrice } : {}) } })),
  currencies: async signal => unwrap(await request('/vendor/currencies', { authenticated: true, signal })),
  createStore: async values => unwrap(await request('/vendor/store', { method: 'POST', authenticated: true, body: values })),
  updateStore: async values => unwrap(await request('/vendor/store', { method: 'PUT', authenticated: true, body: values })),
  deleteStore: async storeId => unwrap(await request('/vendor/store', { method: 'DELETE', authenticated: true, params: { storeId } })),
  createProduct: async values => unwrap(await request('/vendor/products', { method: 'POST', authenticated: true, body: values })),
  updateProduct: async values => unwrap(await request('/vendor/products', { method: 'PUT', authenticated: true, body: values })),
  deleteProduct: async productId => unwrap(await request('/vendor/products', { method: 'DELETE', authenticated: true, params: { productId } })),
  changeProductStatus: async (productId, status) => unwrap(await request('/vendor/products/change-status', { method: 'PATCH', authenticated: true, body: { productId, status } })),
  product: async (productId, signal) => unwrap(await request('/vendor/product', { authenticated: true, params: { productId }, signal })),
  categories: async signal => unwrap(await request('/categories', { signal })),
  subCategories: async (categoryId, signal) => unwrap(await request('/category/sub-categories', { params: { categoryId }, signal })),
  services: (page = 1, signal) => optionalList('/vendor/services', { params: { page, limit: 50 }, signal }),
  service: async (serviceId, signal) => unwrap(await request(`/vendor/services/${serviceId}`, { authenticated: true, signal })),
  createService: async values => unwrap(await request('/vendor/services', { method: 'POST', authenticated: true, body: values })),
  updateService: async (serviceId, values) => unwrap(await request(`/vendor/services/${serviceId}`, { method: 'PUT', authenticated: true, body: values })),
  deleteService: async serviceId => request(`/vendor/services/${serviceId}`, { method: 'DELETE', authenticated: true }),
  publishService: async serviceId => request(`/vendor/services/${serviceId}/publish`, { method: 'PATCH', authenticated: true }),
  unpublishService: async serviceId => request(`/vendor/services/${serviceId}/unpublish`, { method: 'PATCH', authenticated: true }),
  serviceBookings: (page = 1, status = '', signal) => request('/vendor/service/bookings', { authenticated: true, params: { page, limit: 10, status }, signal }),
  confirmServiceBooking: async bookingId => unwrap(await request(`/vendor/service/bookings/${bookingId}/confirm`, { method: 'PATCH', authenticated: true })),
  cancelServiceBooking: async bookingId => unwrap(await request(`/vendor/service/bookings/${bookingId}/cancel`, { method: 'PATCH', authenticated: true })),
  serviceCategories: async signal => unwrap(await request('/service/categories', { params: { page: 1, limit: 50 }, signal })),
  serviceSubCategories: async (categoryId, signal) => unwrap(await request(`/service/subcategories/${categoryId}`, { params: { page: 1, limit: 50 }, signal })),
  serviceAttributes: async (categoryId, signal) => unwrap(await request(`/services/categories/${categoryId}/attributes`, { params: { page: 1, limit: 50 }, signal })),
};

export async function uploadSellerImage(file) {
  return uploadImage(file);
}

export function sellerList(result) { return Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : Array.isArray(result?.items) ? result.items : []; }
