const symbols = { NGN: '₦', USD: '$', GBP: '£' };
export function variantDisplayPrice(product, selectedIndex, fallbackPrice, fallbackSymbol = '₦') {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const selected = selectedIndex === '' ? null : variants[Number(selectedIndex)];
  const prices = variants.map(item => Number(item.sku_price)).filter(value => Number.isFinite(value) && value > 0);
  const selectedPrice = Number(selected?.sku_price);
  const amount = selected && Number.isFinite(selectedPrice) && selectedPrice > 0 ? selectedPrice : prices.length ? Math.min(...prices) : fallbackPrice;
  const currency = selected?.currency_code || variants[0]?.currency_code;
  return { amount, symbol: symbols[currency] || fallbackSymbol, starting: !selected && prices.length > 1 };
}
export function variantLabel(variant) {
  return variant.aeop_s_k_u_propertys?.map(option => option.sku_property_value).filter(Boolean).join(' / ') || variant.name || variant.sku_attr || 'Option';
}
