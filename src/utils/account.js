export function isVendorAccount(user) {
  return String(user?.accountType || '').toLowerCase() === 'vendor';
}
