export const imageFor = product => product?.image_url || product?.image || product?.additional_images?.[0] || '';
export const priceFor = product => {
  const original = Number(product?.price || 0);
  const discount = Number(product?.discount_price ?? product?.discountPrice ?? 0);
  return { original, current: discount > 0 && discount < original ? discount : original, discounted: discount > 0 && discount < original };
};
export const money = (amount, symbol = '₦') => `${symbol}${Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const plainText = value => { if (!value) return ''; const doc = new DOMParser().parseFromString(String(value), 'text/html'); return doc.body.textContent?.trim() || ''; };
