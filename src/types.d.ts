interface AeopSKUProperty {
  sku_image: string;
  sku_property_id: number;
  property_value_id: number;
  sku_property_name: string;
  sku_property_value: string;
  property_value_definition_name: string;
}

interface Variant {
  id: string;
  sku_id: string;
  sku_attr: string;
  sku_price: string;
  currency_code: string;
  offer_sale_price: string;
  price_include_tax: boolean;
  sku_available_stock: number;
  aeop_s_k_u_propertys: AeopSKUProperty[];
  offer_bulk_sale_price: string;
}

interface Location {
  city: string;
  state: string;
  address: string;
  country: string;
}

interface BusinessHours {
  sunday: string;
  saturday: string;
  monday_friday: string;
}

interface Currency {
  symbol: string;
}

interface Store {
  location: Location;
  businessHours: BusinessHours;
  deliveryOptions: any[];
  id: string;
  vendorId: string;
  currencyId: string;
  name: string;
  tipsOnFinding: string;
  logo: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  currency: Currency;
}

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface SubCategory {
  id: string;
  name: string;
}

export interface Product {
  additional_images: string[];
  variants: Variant[];
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
  video_url: string;
  warranty: null;
  return_policy: null;
  seo_title: null;
  meta_description: null;
  keywords: null;
  views: number;
  status: string;
  last_synced_at: null;
  createdAt: string;
  updatedAt: string;
  vendor: null;
  admin: Admin;
  store: Store;
  sub_category: SubCategory;
  reviews: any[];
  averageRating: number;
  totalReviews: number;
}
