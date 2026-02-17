export interface Item {
  id: string;
  userId: string;
  productId: string;
  productType: string;
  dropshipProductSkuId: string;
  dropshipProductSkuAttr: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  user: {
    location: {
      city: string;
      state: string;
      street: string;
      country: string;
      zipCode: string;
    };
    isVerified: boolean;
    id: string;
    trackingId: string | null;
    firstName: string;
    lastName: string;
    gender: string | null;
    email: string;
    email_verified_at: string;
    phoneNumber: string;
    dateOfBirth: string;
    photo: string | null;
    fcmToken: string;
    wallet: any | null;
    dollarWallet: string;
    facebookId: string | null;
    googleId: string;
    accountType: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  product: {
    additional_images: string[];
    variants: Array<{
      id: string;
      sku_id: string;
      sku_attr: string;
      sku_price: string;
      currency_code: string;
      offer_sale_price: string;
      price_include_tax: boolean;
      sku_available_stock: number;
      aeop_s_k_u_propertys: Array<{
        sku_image: string;
        sku_property_id: number;
        property_value_id: number;
        sku_property_name: string;
        sku_property_value: string;
        property_value_definition_name: string;
      }>;
      offer_bulk_sale_price: string;
    }>;
    id: string;
    vendorId: string;
    storeId: string;
    categoryId: string;
    name: string;
    sku: string;
    condition: string;
    type: string;
    description: string;
    specification: string;
    quantity: number;
    price: string;
    discount_price: string;
    image_url: string;
    video_url: string | null;
    warranty: string | null;
    return_policy: string | null;
    seo_title: string | null;
    meta_description: string | null;
    keywords: string | null;
    views: number;
    status: string;
    last_synced_at: string | null;
    createdAt: string;
    updatedAt: string;
    store: {
      name: string;
      currency: {
        name: string;
        symbol: string;
      };
    };
  };
}

export const calculate_dropship_price = (item: Item) => {
  const variant = item.product.variants.find(
    (v) => v.sku_id === item.dropshipProductSkuId,
  );

  const unitPrice = variant
    ? parseFloat(variant.offer_sale_price)
    : parseFloat(item.product.discount_price || item.product.price);
  console.log(unitPrice, "unitPrice");
  return unitPrice * item.quantity;
};
