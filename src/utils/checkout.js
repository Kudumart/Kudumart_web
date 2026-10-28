export function parseLocation(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' ? parsed : null; } catch { return null; }
}
export function formatAddress(location) {
  if (!location) return '';
  return [(location.street || location.address), location.city, location.state, location.country].filter(Boolean).join(', ');
}
export function hasDeliveryAddress(location) {
  return Boolean((location?.street || location?.address)?.trim?.() && location?.city?.trim?.() && location?.state?.trim?.() && location?.country?.trim?.() && String(location?.zipCode || '').trim());
}
export function isDropship(item) { return item?.productType === 'dropship' || item?.product?.type === 'dropship'; }
export function availableStock(item) {
  const variant = isDropship(item) && item?.product?.variants?.find(value => value.sku_id === item.dropshipProductSkuId);
  const raw = variant?.sku_available_stock ?? item?.product?.quantity;
  if (raw === null || raw === undefined || raw === '') return null;
  const stock = Number(raw);
  return Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : null;
}
export function linePrice(item) {
  const product = item?.product || {};
  const variant = isDropship(item) ? product.variants?.find(v => v.sku_id === item.dropshipProductSkuId) : null;
  const base = Number(product.price || 0); const discount = Number(product.discount_price || 0);
  const unit = variant ? Number(variant.offer_sale_price || 0) : discount > 0 && discount < base ? discount : base;
  const quantity = Number(item?.quantity || 0);
  return { unit, quantity, subtotal: unit * quantity };
}
export function calculateNairaQuote(items, charges = [], deliveryFee = 0) {
  let subtotal = 0; let chargeTotal = 0;
  for (const item of items) {
    const line = linePrice(item);
    if (!Number.isFinite(line.unit) || !Number.isInteger(line.quantity) || line.unit <= 0 || line.quantity <= 0) throw new Error('Cart contains an invalid price or quantity.');
    subtotal += line.subtotal;
    const charge = charges.find(candidate => {
      const min = Number(candidate.minimum_product_amount || 0);
      const max = candidate.maximum_product_amount == null ? Infinity : Number(candidate.maximum_product_amount);
      return line.unit >= min && line.unit <= max;
    });
    if (charge) {
      const perUnit = charge.calculation_type === 'fixed' ? Number(charge.charge_amount || 0) : charge.calculation_type === 'percentage' ? line.unit * Number(charge.charge_percentage || 0) / 100 : 0;
      if (!Number.isFinite(perUnit) || perUnit < 0) throw new Error('Cart charges are invalid.');
      chargeTotal += perUnit * line.quantity;
    }
  }
  const delivery = Number(deliveryFee || 0);
  if (!Number.isFinite(delivery) || delivery < 0) throw new Error('Delivery fee is invalid.');
  const total = Math.round((subtotal + chargeTotal + delivery) * 100) / 100;
  return { subtotal, charges: chargeTotal, delivery, total };
}
export function paymentMode({ items = [], country } = {}) {
  const currency = items[0]?.product?.store?.currency;
  const currencyName = String(currency?.name || '').toLowerCase();
  const currencySymbol = currency?.symbol;
  if (currencyName === 'naira' || currencySymbol === '₦' || currencySymbol === '#') return 'NGN';
  if (currencyName === 'dollar' || currencySymbol === '$') return 'USD';
  return country === 'Nigeria' ? 'NGN' : 'USD';
}
export function testPaymentsConfigured(mode) {
  if (!import.meta.env.DEV && import.meta.env.VITE_ENABLE_TEST_PAYMENTS !== 'true') return false;
  const key = mode === 'NGN' ? import.meta.env.VITE_PAYSTACK_PUBLIC_KEY : import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  return typeof key === 'string' && key.startsWith('pk_test_');
}
