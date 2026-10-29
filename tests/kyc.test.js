import test from 'node:test';
import assert from 'node:assert/strict';
import { fieldLocked, fieldReason, isKycRecord, kycStatus } from '../src/utils/kyc.js';

test('uses the backend reviewStatus contract', () => {
  assert.equal(kycStatus(null), 'not-started');
  assert.equal(kycStatus({ id: '1', reviewStatus: 'pending' }), 'pending');
  assert.equal(kycStatus({ id: '1', reviewStatus: 'changes_requested' }), 'changes_requested');
  assert.equal(kycStatus({ id: '1', reviewStatus: 'approved' }), 'approved');
  assert.equal(kycStatus({ id: '1', isVerified: true }), 'approved');
});

test('only approved fields are protected while corrections are requested', () => {
  const record = { id: '1', reviewStatus: 'changes_requested', fieldReviews: {
    businessName: { status: 'approved' },
    businessAddress: { status: 'rejected', reason: 'Use the registered address.' },
  } };
  assert.equal(isKycRecord(record), true);
  assert.equal(fieldLocked(record, 'businessName'), true);
  assert.equal(fieldLocked(record, 'businessAddress'), false);
  assert.equal(fieldReason(record, 'businessAddress'), 'Use the registered address.');
});
