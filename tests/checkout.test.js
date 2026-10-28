import test from 'node:test';
import assert from 'node:assert/strict';
import { availableStock, calculateNairaQuote, formatAddress, hasDeliveryAddress, linePrice, parseLocation, paymentMode } from '../src/utils/checkout.js';

test('cart quote applies fixed and percentage charges per unit, then delivery', () => {
  const items = [
    { quantity: 2, product: { price: '10000', discount_price: '8000' } },
    { quantity: 1, product: { price: '20000', discount_price: '0' } },
  ];
  const charges = [
    { minimum_product_amount: '0', maximum_product_amount: '10000', calculation_type: 'fixed', charge_amount: '500' },
    { minimum_product_amount: '10001', maximum_product_amount: null, calculation_type: 'percentage', charge_percentage: '5' },
  ];
  assert.deepEqual(calculateNairaQuote(items, charges, 1500), { subtotal: 36000, charges: 2000, delivery: 1500, total: 39500 });
});

test('dropship cart line uses selected variant price', () => {
  const item = { productType: 'dropship', quantity: 3, dropshipProductSkuId: 'sku-2', product: { price: '999', variants: [{ sku_id: 'sku-2', offer_sale_price: '250' }] } };
  assert.deepEqual(linePrice(item), { unit: 250, quantity: 3, subtotal: 750 });
});

test('stock limit uses the selected variant for dropship items', () => {
  const item = { productType: 'dropship', dropshipProductSkuId: 'sku-2', product: { quantity: 20, variants: [{ sku_id: 'sku-2', sku_available_stock: 3 }] } };
  assert.equal(availableStock(item), 3);
  assert.equal(availableStock({ product: { quantity: 0 } }), 0);
  assert.equal(availableStock({ product: {} }), null);
});

test('invalid monetary values block a quote', () => {
  assert.throws(() => calculateNairaQuote([{ quantity: 1, product: { price: '-1' } }], []), /invalid price/);
  assert.throws(() => calculateNairaQuote([], [], -5), /Delivery fee is invalid/);
});

test('saved user addresses parse into a usable checkout address', () => {
  const location = parseLocation('{"street":"12 Market Road","city":"Abeokuta","state":"Ogun","country":"Nigeria","zipCode":"110001"}');
  assert.equal(formatAddress(location), '12 Market Road, Abeokuta, Ogun, Nigeria');
  assert.equal(formatAddress({ address: '39 Sawmill Street', city: 'Lagos', state: 'Lagos', country: 'Nigeria' }), '39 Sawmill Street, Lagos, Lagos, Nigeria');
  assert.equal(paymentMode(location), 'NGN');
  assert.equal(paymentMode({ country: 'United States' }), 'USD');
  assert.equal(paymentMode({ items: [{ product: { store: { currency: { symbol: '$' } } } }], country: 'Nigeria' }), 'USD');
  assert.equal(paymentMode({ items: [{ product: { store: { currency: { name: 'Naira' } } } }], country: 'United States' }), 'NGN');
  assert.equal(hasDeliveryAddress(location), true);
  assert.equal(hasDeliveryAddress({ country: 'Nigeria', street: '12 Market Road', zipCode: '110001' }), false);
  assert.equal(hasDeliveryAddress(null), false);
});
