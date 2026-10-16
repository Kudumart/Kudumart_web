import test from 'node:test';
import assert from 'node:assert/strict';
import { variantDisplayPrice, variantLabel } from '../src/utils/productVariant.js';
const product = { variants: [{ sku_price: '3500', currency_code: 'NGN', aeop_s_k_u_propertys: [{ sku_property_value: 'Red' }, { sku_property_value: 'Large' }] }, { sku_price: '4200', currency_code: 'NGN' }] };
test('shows lowest option as starting price', () => assert.deepEqual(variantDisplayPrice(product, '', 1000), { amount: 3500, symbol: '₦', starting: true }));
test('updates to the selected option price', () => assert.deepEqual(variantDisplayPrice(product, '1', 1000), { amount: 4200, symbol: '₦', starting: false }));
test('uses fallback product price without variants', () => assert.deepEqual(variantDisplayPrice({}, '', 2800, '$'), { amount: 2800, symbol: '$', starting: false }));
test('labels a variant from its properties', () => assert.equal(variantLabel(product.variants[0]), 'Red / Large'));
