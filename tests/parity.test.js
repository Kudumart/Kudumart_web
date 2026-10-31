import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('public parity routes include content, careers, download, and a real 404', () => {
  const routes = source('src/main.jsx');
  for (const route of ['about', 'contact', 'faqs', 'privacy', 'terms-condition', 'cookie-policy', 'return-policy', 'testimonials', 'download-app', 'careers']) {
    assert.match(routes, new RegExp(`path=["']${route}["']`), `missing /${route}`);
  }
  assert.match(routes, /path=["']\*["'][\s\S]{0,80}element={<NotFound\s*\/>}/);
});

test('homepage parity includes adverts and careers backed by live APIs', () => {
  const home = source('src/pages/Home.jsx');
  const api = source('src/api/content.js');
  assert.match(home, /contentApi\.adverts/);
  assert.match(home, /contentApi\.jobs/);
  assert.match(api, /showOnHomePage: true/);
  assert.match(api, /fetch\/jobs/);
  assert.match(api, /apply\/job/);
});

test('admin parity exposes content, configuration, auction, and dropship controls', () => {
  const routes = source('src/main.jsx');
  const adminApi = source('src/api/admin.js');
  const orders = source('src/pages/admin/Admin.jsx');
  const operations = source('src/pages/admin/AdminOperations.jsx');
  for (const route of ['content', 'configuration', 'payment-gateways', 'dropshipping', 'auctions/:auctionId']) {
    assert.match(routes, new RegExp(`path=["']${route.replace('/', '\\/')}["']`), `missing admin ${route} route`);
  }
  for (const contract of ['productCharges', 'serviceAttributes', 'banners', 'contacts', 'jobApplicants', 'paymentGateways', 'dropshipProducts', 'dropshipOrderDetails', 'dropshipTracking']) {
    assert.match(adminApi, new RegExp(`${contract}:`), `missing ${contract} API contract`);
  }
  assert.match(orders, /DropshipMonitor/);
  assert.match(operations, /AdminAuctionMonitor/);
  assert.match(operations, /auctionBidders/);
});
