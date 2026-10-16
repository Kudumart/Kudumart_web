import test from 'node:test';
import assert from 'node:assert/strict';
import { internationalPhone, nationalPhoneInput } from '../src/utils/phone.js';

test('adds the selected country code without requiring it in the field', () => {
  assert.equal(internationalPhone('0803 123 4567', 'NG'), '+2348031234567');
  assert.equal(internationalPhone('202 555 0123', 'US'), '+12025550123');
  assert.equal(internationalPhone('07700 900123', 'GB'), '+447700900123');
});

test('pasted international numbers do not duplicate the country code', () => {
  assert.equal(nationalPhoneInput('+2348031234567', 'NG'), '8031234567');
  assert.equal(internationalPhone('+2348031234567', 'NG'), '+2348031234567');
  assert.equal(internationalPhone('2348031234567', 'NG'), '+2348031234567');
  assert.equal(internationalPhone('123', 'NG'), null);
});
