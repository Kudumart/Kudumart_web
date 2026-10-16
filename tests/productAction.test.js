import test from 'node:test';
import assert from 'node:assert/strict';
import { productAction } from '../src/utils/productAction.js';
const base = { quantity: 4, vendor: { isVerified: true }, purchaseType: 'buy' };
test('shows sold out before any purchase option', () => assert.equal(productAction({ ...base, quantity: 0, purchaseType: 'offer' }), 'sold-out'));
test('requires variant selection on dropship items', () => assert.equal(productAction({ ...base, variants: [{ sku_id: 'a' }] }), 'details'));
test('routes unverified sellers to contact', () => assert.equal(productAction({ ...base, vendor: { isVerified: false } }), 'contact'));
test('offers take precedence over cart on verified products', () => assert.equal(productAction({ ...base, purchaseType: 'offer' }), 'offer'));
test('ordinary verified products can be added to cart', () => assert.equal(productAction(base), 'cart'));
