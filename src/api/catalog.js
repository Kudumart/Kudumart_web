import { request, unwrap } from './client';
const asList = (value) => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : Array.isArray(value?.products) ? value.products : [];
export const catalogApi = {
  products: async ({ country = 'Nigeria', categoryId, vendorId, q, popular, condition, page = 1, limit = 12, signal } = {}) => asList(unwrap(await request('/products', { params: { country, categoryId, vendorId, search: q, popular: popular || undefined, condition, page, limit }, signal }))),
  product: async (id, signal) => { const response = await request('/product', { params: { productId: id }, signal }); const product = unwrap(response); return { ...product, recommendedProducts: response?.recommendedProducts || product?.recommendedProducts || [] }; },
  categories: async (signal) => asList(unwrap(await request('/categories', { params: { activeOnly: true }, signal }))),
  searchGrouped: async (q, signal) => asList(unwrap(await request('/products/search-grouped', { params: { q }, signal }))),
  search: async (q, signal) => { const groups = await catalogApi.searchGrouped(q, signal); return groups.flatMap(group => Array.isArray(group.products) ? group.products : Array.isArray(group.items) ? group.items : group.id && group.price ? [group] : []); },
  autocomplete: async (q, signal) => asList(unwrap(await request('/products/autocomplete', { params: { q }, signal }))),
  searchServices: async (q, page = 1, signal) => asList(unwrap(await request('/services', { params: { search: q, page }, signal }))),
  auction: async (id, signal) => unwrap(await request('/auction/product', { params: { auctionproductId: id }, signal })),
  service: async (id, signal) => unwrap(await request(`/service/${id}`, { signal })),
  serviceReviews: async (id, signal) => unwrap(await request(`/services/${id}/reviews`, { params: { page: 1, limit: 20 }, signal })),
  activeAuctions: async (country, signal) => asList(unwrap(await request('/auction/products', { params: { country, limit: 100 }, signal }))).filter(item => ['ongoing', 'upcoming'].includes(item.auctionStatus)),
  auctions: async (country, signal) => (await catalogApi.activeAuctions(country, signal)).slice(0, 12),
  services: async (signal) => asList(unwrap(await request('/services', { params: { limit: 4 }, signal }))),
};
