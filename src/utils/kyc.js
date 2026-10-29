const APPROVED = 'approved';
const CHANGES_REQUESTED = 'changes_requested';

export function isKycRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value)
    && (value.id || value.kycId || (value.businessName && value.idVerification?.number)));
}

export function kycStatus(record) {
  if (!isKycRecord(record)) return 'not-started';
  const reviewStatus = String(record.reviewStatus || record.status || '').toLowerCase();
  if (record.isVerified === true || reviewStatus === APPROVED) return APPROVED;
  if (reviewStatus === CHANGES_REQUESTED || reviewStatus === 'rejected') return CHANGES_REQUESTED;
  return 'pending';
}

export function fieldReview(record, field) {
  const review = record?.fieldReviews?.[field];
  return review && typeof review === 'object' ? review : null;
}

export function fieldReason(record, field) {
  const review = fieldReview(record, field);
  return review?.status === 'rejected' ? String(review.reason || 'Please correct this detail.') : '';
}

export function fieldLocked(record, field) {
  return kycStatus(record) === CHANGES_REQUESTED && fieldReview(record, field)?.status === APPROVED;
}
