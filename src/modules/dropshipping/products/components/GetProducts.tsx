import { useQuery } from "@tanstack/react-query";
import { useSingleSelect } from "../../../../helpers/selectors";
import apiClient from "../../../../api/apiFactory";
import QueryCage from "../../../../components/query/QueryCage";
import { type AliResponse } from "../../ali";
import AliProductCard from "./ProductCard";
import { useCountrySelect } from "../../../../store/clientStore";

interface AliExpressProduct {
  originalPrice: string;
  originalPriceCurrency: string;
  salePrice: string;
  discount: string;
  itemMainPic: string;
  title: string;
  type: string;
  score: string;
  itemId: string;
  targetSalePrice: string;
  targetOriginalPriceCurrency: string;
  evaluateRate: string;
  orders: string;
  targetOriginalPrice: string;
  itemUrl: string;
  salePriceCurrency: string;
}

interface AliExpressProductsResponse {
  aliexpress_ds_text_search_response: {
    code: string | "RECOMMEND_ERROR";
    data: {
      pageIndex: number;
      pageSize: number;
      totalCount: number;
      products: {
        selection_search_product: AliExpressProduct[];
      };
    };
    request_id: string;
    _trace_id_: string;
  };
}

const NoItemsFound = () => (
  <div className="flex flex-col items-center justify-center p-10 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
    <p className="text-lg font-medium text-base-content/70">
      No items for selected category
    </p>
  </div>
);

export default function GetDropShipProducts({
  selectProps,
}: {
  selectProps: ReturnType<typeof useSingleSelect<number>>;
}) {
  const { country, setCountry, countries } = useCountrySelect();

  const currencyMap: Record<string, string> = {
    "United Kingdom": "USD",
    "United States": "USD",
    Nigeria: "NGN",
  };

  const currency = currencyMap[country.value] || "USD";
  const shippingCountry = country.label;

  const query = useQuery({
    queryKey: ["ali-products", selectProps.selectedItem, country],
    queryFn: async () => {
      let resp = await apiClient.get<AliResponse<AliExpressProductsResponse>>(
        `admin/aliexpress/products?shippingCountry=${shippingCountry.replace("A", "")}&currency=${currency}`,
        {
          params: {
            categoryId: selectProps.selectedItem,
          },
        },
      );
      return resp.data;
    },
    enabled:
      selectProps.selectedItem !== undefined &&
      selectProps.selectedItem !== null,
  });

  return (
    <section className="min-h-screen" data-theme="kudu">
      <div className="tabs tabs-boxed mb-4">
        {countries.map((c) => (
          <a
            key={c.value}
            className={`tab ${country.value === c.value ? "tab-active" : ""}`}
            onClick={() => setCountry(c)}
          >
            {c.label}
          </a>
        ))}
      </div>
      <QueryCage query={query}>
        {(data) => {
          const response = data.data.aliexpress_ds_text_search_response;
          const products = response.data?.products?.selection_search_product;

          if (
            response.code === "RECOMMEND_ERROR" ||
            !products ||
            products.length === 0
          ) {
            return <NoItemsFound />;
          }

          return (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2">
              {products.map((item) => {
                return <AliProductCard item={item} key={item.itemId} />;
              })}
            </div>
          );
        }}
      </QueryCage>
    </section>
  );
}
