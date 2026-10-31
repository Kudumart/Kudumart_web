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

async function adminPageRequest(path, options) {
  try {
    return await adminRequest(path, options);
  } catch (error) {
    if (error.status === 404) return { data: [], pagination: { total: 0, page: 1, pages: 0 } };
    throw error;
  }
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
  categories: signal => adminRequest('/admin/categories', { signal }),
  categoryTree: signal => adminRequest('/admin/categories/sub/categories', { signal }),
  saveCategory: body => adminRequest('/admin/categories', { method: body.categoryId ? 'PUT' : 'POST', body }),
  deleteCategory: categoryId => adminRequest('/admin/categories', { method: 'DELETE', params: { categoryId } }),
  saveSubcategory: body => adminRequest('/admin/sub/categories', { method: body.subCategoryId ? 'PUT' : 'POST', body }),
  deleteSubcategory: subCategoryId => adminRequest('/admin/sub/categories', { method: 'DELETE', params: { subCategoryId } }),
  stores: (page = 1, signal, filters = {}) => adminPageRequest('/admin/general/stores', { params: { page, limit: 20, ...filters }, signal }),
  store: (storeId, signal) => adminRequest('/admin/general/store/view', { params: { storeId }, signal }),
  auctions: (page = 1, signal, filters = {}) => adminPageRequest('/admin/general/auction/products', { params: { page, limit: 20, ...filters }, signal }),
  auction: (auctionProductId, signal) => adminRequest('/admin/general/auction/product/view', { params: { auctionProductId }, signal }),
  auctionBidders: (auctionProductId, signal) => adminRequest('/admin/general/auction/product/bidders', { params: { auctionProductId }, signal }),
  setAuctionStatus: (auctionProductId, status) => adminRequest('/admin/general/auction/product/status', { method: 'PUT', params: { auctionProductId, status } }),
  deleteAuction: auctionProductId => adminRequest('/admin/general/auction/product/delete', { method: 'DELETE', params: { auctionProductId } }),
  adverts: (page = 1, signal, filters = {}) => adminPageRequest('/admin/general/adverts', { params: { page, limit: 20, ...filters }, signal }),
  advert: (advertId, signal) => adminRequest('/admin/general/advert/view', { params: { advertId }, signal }),
  reviewAdvert: (advertId, status, adminNote = '') => adminRequest('/admin/approved-reject/advert', { method: 'POST', body: { advertId, status, ...(adminNote ? { adminNote } : {}) } }),
  deleteAdvert: advertId => adminRequest('/admin/adverts', { method: 'DELETE', params: { advertId } }),
  services: (page = 1, signal, filters = {}) => adminRequest('/admin/services', { params: { page, limit: 20, ...filters }, signal }),
  service: (serviceId, signal) => adminRequest(`/admin/services/${serviceId}`, { signal }),
  setServiceStatus: (serviceId, active) => adminRequest(`/admin/service/${serviceId}/${active ? 'activate' : 'suspend'}`, { method: 'POST' }),
  serviceCategories: signal => adminRequest('/admin/service/categories', { signal }),
  serviceSubcategories: (categoryId, signal) => adminRequest(`/admin/service/subcategories/${categoryId}`, { signal }),
  saveServiceCategory: (body, id) => adminRequest(`/admin/service/categories${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body }),
  deleteServiceCategory: id => adminRequest(`/admin/service/categories/${id}`, { method: 'DELETE' }),
  saveServiceSubcategory: (body, id) => adminRequest(`/admin/service/subcategories${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body }),
  deleteServiceSubcategory: id => adminRequest(`/admin/service/subcategories/${id}`, { method: 'DELETE' }),
  roles: signal => adminRequest('/admin/roles', { signal }),
  permissions: signal => adminRequest('/admin/permissions', { signal }),
  rolePermissions: (roleId, signal) => adminRequest('/admin/role/view/permissions', { params: { roleId }, signal }),
  saveRole: (name, roleId) => adminRequest(`/admin/role/${roleId ? 'update' : 'create'}`, { method: roleId ? 'PUT' : 'POST', body: { name, ...(roleId ? { roleId } : {}) } }),
  assignPermission: (roleId, permissionId) => adminRequest('/admin/role/assign/permission', { method: 'POST', body: { roleId, permissionId } }),
  removePermission: (roleId, permissionId) => adminRequest('/admin/role/delete/permission', { method: 'DELETE', params: { roleId, permissionId } }),
  subAdmins: (signal, filters = {}) => adminPageRequest('/admin/sub-admins', { params: filters, signal }),
  saveSubAdmin: body => adminRequest(`/admin/sub-admin/${body.subAdminId ? 'update' : 'create'}`, { method: body.subAdminId ? 'PUT' : 'POST', body }),
  toggleSubAdmin: subAdminId => adminRequest('/admin/sub-admin/status', { method: 'PATCH', body: { subAdminId } }),
  deleteSubAdmin: subAdminId => adminRequest('/admin/sub-admin/delete', { method: 'DELETE', params: { subAdminId } }),
  resendSubAdminLogin: subAdminId => adminRequest('/admin/sub-admin/resend-login', { method: 'POST', body: { subAdminId } }),
  products: (page = 1, signal, filters = {}) => adminRequest('/admin/general/products', { params: { page, ...filters }, signal }),
  product: (productId, signal) => adminRequest('/admin/general/product/view', { params: { productId }, signal }),
  publishProduct: productId => adminRequest('/admin/general/product/publish', { method: 'PUT', params: { productId } }),
  unpublishProduct: productId => adminRequest('/admin/general/product/unpublished', { method: 'PUT', params: { productId } }),
  setProductTrending: (productId, isTrending) => adminRequest('/admin/general/product/trending', { method: 'PATCH', body: { productId, isTrending } }),
  deleteProduct: productId => adminRequest('/admin/general/product/delete', { method: 'DELETE', params: { productId } }),
  orders: (page = 1, signal, filters = {}) => adminRequest('/admin/general/orders', { params: { page, ...filters }, signal }),
  orderItems: (orderId, signal) => adminRequest('/admin/general/order/items', { params: { orderId, limit: 100 }, signal }),
  orderDetails: (orderId, signal) => adminRequest('/admin/order/item/details', { params: { orderId }, signal }),
  orderPayments: (orderId, signal) => adminRequest('/admin/general/order/payment', { params: { orderId, limit: 100 }, signal }),
  dropshipOrderDetails: (orderItemId, signal) => adminRequest('/admin/order/dropship/items', { params: { orderItemId }, signal }),
  dropshipTracking: (orderItemId, signal) => adminRequest('/admin/order/dropship/tracking/info', { params: { orderItemId }, signal }),
  updateOrderStatus: (orderItemId, status, deliveryCode) => adminRequest('/admin/order/item/update/status', { method: 'POST', body: { orderItemId, status, ...(deliveryCode ? { deliveryCode } : {}) } }),
  transactions: (page = 1, signal, filters = {}) => adminRequest('/admin/transactions', { params: { page, ...filters }, signal }),
  withdrawals: (signal, filters = {}) => adminRequest('/admin/payout/reports', { params: filters, signal }),
  payoutStats: signal => adminRequest('/admin/payout/stats', { signal }),
  earningsReports: (signal, filters = {}) => adminRequest('/admin/earnings/reports', { params: filters, signal }),
  notifications: (page = 1, signal) => adminRequest('/admin/notifications', { params: { page, limit: 20 }, signal }),
  markNotificationRead: id => adminRequest(`/admin/notifications/${id}/read`, { method: 'PATCH' }),
  updateWithdrawal: (id, status, details = {}) => adminRequest('/admin/withdrawal/update/status', {
    method: 'POST',
    body: { id, status, ...details },
  }),
  kyc: signal => adminRequest('/admin/kyc', { signal }),
  reviewKyc: (kycId, fieldReviews) => adminRequest('/admin/kyc/approve-reject', {
    method: 'POST',
    body: { kycId, fieldReviews },
  }),
  banners: signal => adminRequest('/admin/banners', { signal }),
  saveBanner: body => adminRequest('/admin/banner', { method: body.id ? 'PUT' : 'POST', body }),
  deleteBanner: id => adminRequest('/admin/banner', { method: 'DELETE', params: { id } }),
  testimonials: signal => adminRequest('/admin/testimonials', { signal }),
  saveTestimonial: body => adminRequest('/admin/testimonial', { method: body.id ? 'PUT' : 'POST', body }),
  deleteTestimonial: id => adminRequest('/admin/testimonial', { method: 'DELETE', params: { id } }),
  faqCategories: signal => adminRequest('/admin/faq/categories', { signal }),
  faqs: signal => adminRequest('/admin/faqs', { signal }),
  saveFaqCategory: body => adminRequest('/admin/faq/category', { method: body.id ? 'PUT' : 'POST', body }),
  deleteFaqCategory: id => adminRequest('/admin/faq/category', { method: 'DELETE', params: { id } }),
  saveFaq: body => adminRequest('/admin/faq', { method: body.id ? 'PUT' : 'POST', body }),
  deleteFaq: id => adminRequest('/admin/faq', { method: 'DELETE', params: { id } }),
  contacts: signal => adminRequest('/admin/contact/us/forms', { signal }),
  deleteContact: id => adminRequest('/admin/contact/us/form', { method: 'DELETE', params: { id } }),
  jobs: signal => adminRequest('/admin/jobs', { signal }),
  saveJob: body => adminRequest(body.id ? '/admin/job/update' : '/admin/job/post', { method: body.id ? 'PUT' : 'POST', body }),
  closeJob: jobId => adminRequest('/admin/job/close', { method: 'PATCH', params: { jobId } }),
  repostJob: jobId => adminRequest('/admin/job/repost', { method: 'POST', params: { jobId } }),
  deleteJob: jobId => adminRequest('/admin/job/delete', { method: 'DELETE', params: { jobId } }),
  jobApplicants: (jobId, signal) => adminRequest('/admin/job/applicants', { params: { jobId }, signal }),
  productCharges: signal => adminRequest('/admin/product/charges', { signal }),
  saveProductCharge: body => adminRequest(`/admin/product/charges${body.id ? `/${body.id}` : ''}`, { method: body.id ? 'PUT' : 'POST', body }),
  deleteProductCharge: id => adminRequest(`/admin/product/charges/${id}`, { method: 'DELETE' }),
  setProductChargeStatus: (id, active) => adminRequest(`/admin/product/charges/${id}/status/${active ? 'activate' : 'deactivate'}`, { method: 'PATCH' }),
  serviceAttributes: signal => adminRequest('/admin/service/attributes', { params: { page: 1, limit: 50 }, signal }),
  saveServiceAttributes: attributes => adminRequest('/admin/service/attributes', { method: 'POST', body: { attributes } }),
  deleteServiceAttribute: id => adminRequest(`/admin/service/attributes/${id}`, { method: 'DELETE' }),
  addServiceAttributeOptions: (id, options) => adminRequest(`/admin/service/attributes/${id}/options`, { method: 'POST', body: { options } }),
  deleteServiceAttributeOption: id => adminRequest(`/admin/service/attributes/options/${id}`, { method: 'DELETE' }),
  categoryAttributes: (categoryId, signal) => adminRequest(`/admin/service/categories/${categoryId}/attributes`, { params: { page: 1, limit: 50 }, signal }),
  assignCategoryAttributes: (categoryId, attributeIds) => adminRequest(`/admin/service/categories/${categoryId}/attributes`, { method: 'POST', body: { attributeIds } }),
  removeCategoryAttribute: (categoryId, attributeId) => adminRequest(`/admin/service/categories/${categoryId}/attributes`, { method: 'DELETE', body: { attributeId } }),
};
