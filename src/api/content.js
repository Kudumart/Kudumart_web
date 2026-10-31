import { request, unwrap } from './client';

const asList = value => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : Array.isArray(value?.rows) ? value.rows : Array.isArray(value?.jobs) ? value.jobs : [];

export const contentApi = {
  adverts: async signal => asList(unwrap(await request('/adverts', { params: { showOnHomePage: true, limit: 8 }, signal }))),
  banners: async signal => asList(unwrap(await request('/banners', { signal }))),
  testimonials: async signal => asList(unwrap(await request('/testimonials', { signal }))),
  faqGroups: async signal => asList(unwrap(await request('/faq/categories/with/faqs', { signal }))),
  jobs: async (search = '', signal) => asList(unwrap(await request('/fetch/jobs', { params: { search }, signal }))),
  job: async (jobId, signal) => unwrap(await request('/view/job', { params: { jobId }, signal })),
  apply: values => request('/apply/job', { method: 'POST', body: values }),
  contact: values => request('/submit/contact/form', { method: 'POST', body: values }),
};
