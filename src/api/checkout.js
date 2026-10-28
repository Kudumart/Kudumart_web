import { request, unwrap } from './client';

/** The endpoints and payloads match the existing KuduMart buyer flow. */
export const checkoutApi = {
  charges: async signal => unwrap(await request('/user/cart/charges', { authenticated: true, signal })),
  deliveryFees: async (countryCode, signal) => unwrap(await request('/user/delivery-fees', { authenticated: true, params: { shipToCountryCode: countryCode }, signal })),
  shippingRegions: async (countryCode, signal) => unwrap(await request('/user/shipping/addresses', { authenticated: true, params: { shipToCountryCode: countryCode }, signal })),
  updateAddress: async (user, location) => unwrap(await request('/user/profile/update', { method: 'PUT', authenticated: true, body: { firstName: user.firstName, lastName: user.lastName, email: user.email, location } })),
  prepareNaira: async (deliveryMethod = 'delivery', cartItemIds) => unwrap(await request('/user/checkout/naira/prepare', { method: 'POST', authenticated: true, body: { deliveryMethod, ...(cartItemIds?.length ? { cartItemIds } : {}) } })),
  prepareDollar: async (shippingAddress, cartItemIds) => unwrap(await request('/user/checkout/dollar/prepare', { method: 'POST', authenticated: true, body: { shippingAddress, ...(cartItemIds?.length ? { cartItemIds } : {}) } })),
  confirmNaira: async ({ refId, shippingAddress, shippingAddressZipCode, deliveryMethod = 'delivery', cartItemIds }) => unwrap(await request('/user/checkout', { method: 'POST', authenticated: true, body: { refId, shippingAddress, shippingAddressZipCode, deliveryMethod, ...(cartItemIds?.length ? { cartItemIds } : {}) } })),
  confirmDollar: async ({ refId, shippingAddress, shippingAddressZipCode, cartItemIds }) => unwrap(await request('/user/checkout/dollar', { method: 'POST', authenticated: true, body: { refId, shippingAddress, shippingAddressZipCode, ...(cartItemIds?.length ? { cartItemIds } : {}) } })),
  orders: async signal => {
    try { return unwrap(await request('/user/orders', { authenticated: true, signal })); }
    catch (error) { if (error.status === 404) return []; throw error; }
  },
  orderItems: async (orderId, signal) => unwrap(await request('/user/order/items', { authenticated: true, params: { orderId, limit: 100 }, signal })),
  updateOrderStatus: async (orderItemId, status, deliveryCode = '') => unwrap(await request('/user/order/item/update/status', { method: 'POST', authenticated: true, body: { orderItemId, status, ...(deliveryCode ? { deliveryCode } : {}) } })),
  reviews: async signal => unwrap(await request('/user/get/review', { authenticated: true, signal })),
  addReview: async ({ orderId, productId, rating, comment }) => unwrap(await request('/user/add/review', { method: 'POST', authenticated: true, body: { orderId, productId, rating, comment } })),
};
