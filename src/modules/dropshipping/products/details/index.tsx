import { useParams } from "react-router-dom";
import DropshipHeader from "../components/Header";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../../api/apiFactory";
import QueryCage from "../../../../components/query/QueryCage";
import { AliResponse } from "../../ali";
interface AeopSKUProperty {
  sku_property_value: string;
  sku_image: string;
  sku_property_name: string;
  property_value_definition_name: string;
  property_value_id: number;
  sku_property_id: number;
}

interface AeItemSkuInfoDto {
  sku_attr: string;
  offer_sale_price: string;
  sku_id: string;
  price_include_tax: boolean;
  currency_code: string;
  sku_price: string;
  offer_bulk_sale_price: string;
  sku_available_stock: number;
  id: string;
  aeop_s_k_u_propertys: AeopSKUProperty[];
}

interface AeMultimediaInfoDto {
  image_urls: string;
}

interface PackageInfoDto {
  package_width: number;
  package_height: number;
  package_length: number;
  gross_weight: string;
  package_type: boolean;
  product_unit: number;
}

interface LogisticsInfoDto {
  delivery_time: number;
  ship_to_country: string;
}

interface ProductIdConverterResult {
  main_product_id: number;
  sub_product_id: string;
}

interface AeItemBaseInfoDto {
  mobile_detail: string;
  subject: string;
  evaluation_count: string;
  sales_count: string;
  product_status_type: string;
  avg_evaluation_rating: string;
  currency_code: string;
  category_id: number;
  product_id: number;
  detail: string;
}

interface AeItemProperty {
  attr_name_id: number;
  attr_value_id: number;
  attr_name: string;
  attr_value: string;
}

interface AeStoreInfo {
  store_id: number;
  shipping_speed_rating: string;
  communication_rating: string;
  store_name: string;
  store_country_code: string;
  item_as_described_rating: string;
}

export interface AliProductDetailsResponse {
  ae_item_sku_info_dtos: AeItemSkuInfoDto[];
  ae_multimedia_info_dto: AeMultimediaInfoDto;
  package_info_dto: PackageInfoDto;
  logistics_info_dto: LogisticsInfoDto;
  product_id_converter_result: ProductIdConverterResult;
  ae_item_base_info_dto: AeItemBaseInfoDto;
  has_whole_sale: boolean;
  ae_item_properties: AeItemProperty[];
  ae_store_info: AeStoreInfo;
}
export default function AliProductDetails() {
  const { itemId } = useParams();
  const query = useQuery<AliResponse<AliProductDetailsResponse>>({
    queryKey: ["ali-product-details", itemId],
    queryFn: async () => {
      const resp = await apiClient.get(
        `/admin/aliexpress/products/${itemId}/details?shippingCountry=UK&currency=USD`,
      );
      return resp.data;
    },
  });
  return (
    <section data-theme="kudu">
      <DropshipHeader />
      <div className="container mx-auto px-4">
        <QueryCage query={query}>
          {(data) => {
            return (
              <div className="grid grid-cols-2 gap-4 min-h-screen">
                <div>
                  {/*{data.data.ae_multimedia_info_dto.image_urls.map((url) => (
                    <img key={url} src={url} alt="Product" className="mb-4" />
                  ))}*/}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {data.data.ae_item_base_info_dto.subject}
                  </h2>
                  <p className="text-gray-600">
                    {data.data.ae_item_base_info_dto.detail}
                  </p>
                  <p>
                    Price: {data.data.ae_item_sku_info_dtos[0].sku_price}{" "}
                    {data.data.ae_item_base_info_dto.currency_code}
                  </p>
                  <p>
                    Sales Count: {data.data.ae_item_base_info_dto.sales_count}
                  </p>
                </div>
              </div>
            );
          }}
        </QueryCage>
      </div>
    </section>
  );
}
