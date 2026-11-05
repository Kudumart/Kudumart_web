export const getEffectiveProductPrice = (product: {
  price?: string | number | null;
  discount_price?: string | number | null;
}) => {
  const regularPrice = Number(product?.price ?? 0);
  const discountPrice = Number(product?.discount_price ?? 0);

  if (
    Number.isFinite(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < regularPrice
  ) {
    return discountPrice;
  }

  return Number.isFinite(regularPrice) ? regularPrice : 0;
};

