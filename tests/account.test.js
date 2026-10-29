import test from 'node:test';
import assert from 'node:assert/strict';
import { isVendorAccount } from '../src/utils/account.js';

test('recognizes vendor accounts regardless of API casing', () => {
  assert.equal(isVendorAccount({ accountType: 'Vendor' }), true);
  assert.equal(isVendorAccount({ accountType: 'vendor' }), true);
  assert.equal(isVendorAccount({ accountType: 'Customer' }), false);
  assert.equal(isVendorAccount(null), false);
});
