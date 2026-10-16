export function productAction(product) {
  if (Number(product?.quantity) === 0) return 'sold-out';
  if (product?.variants?.length > 0 || product?.type === 'dropship') return 'details';
  const verified = product?.vendor?.isVerified || product?.admin || product?.isVerified;
  if (!verified) return 'contact';
  if (product?.purchaseType === 'offer') return 'offer';
  return 'cart';
}

export const productActionLabel = {
  'sold-out': 'Sold out',
  details: 'View details',
  contact: 'Contact seller',
  offer: 'Request an offer',
  cart: 'Add to cart',
};
