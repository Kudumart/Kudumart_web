import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/apiFactory";
import { useParams } from "react-router-dom";
import type { Product } from "../../types";
import ProductInfo from "./new_components/Carousel";
import PricingVariants from "./new_components/PricingVariants";
export default function ViewDropShipProducts() {
  const { id } = useParams();
  const query = useQuery<{ data: Product }>({
    queryKey: ["dropship-product-details", id],
    queryFn: async () => {
      let resp = await apiClient.get(`/product?productId=${id}`);
      return resp.data;
    },
    enabled: !!id, // Only run the query if `id` is available
  });
  if (query.isLoading) {
    return (
      <div
        data-theme="kudu"
        className="flex min-h-screen pt-28 px-3 container mx-auto justify-center items-center"
      >
        <div>
          <span className="loading loading-ball"></span>
          <span>...Loading</span>
        </div>
      </div>
    );
  }
  if (query.isError) {
    return (
      <div
        data-theme="kudu"
        className="flex min-h-screen pt-28 px-3 container mx-auto justify-center items-center flex-col"
      >
        <div className="text-error text-lg mb-4">
          Error loading product: {query.error?.message || "Unknown error"}
        </div>
        <button className="btn btn-primary" onClick={() => query.refetch()}>
          Try Again
        </button>
      </div>
    );
  }
  // Ensure product data exists before rendering components that expect it
  if (!query.data?.data) {
    return (
      <div
        data-theme="kudu"
        className="flex min-h-screen pt-28 px-3  container mx-auto justify-center items-center flex-col"
      >
        <div className="text-warning text-lg mb-4">
          Product not found or data is empty.
        </div>
        <button className="btn btn-primary" onClick={() => query.refetch()}>
          Refetch Product
        </button>
      </div>
    );
  }
  return (
    <div data-theme="kudu" className="  flex px-4 max-w-7xl mx-auto pt-32">
      <section className="flex-1 md:p-4 ">
        <ProductInfo product={query.data.data} />
        {/*{JSON.stringify(query.data, null, 2)}*/}
      </section>
      <div className="flex-1 max-w-md bg-base-200 hidden md:block">
        <PricingVariants product={query.data.data} />
      </div>
    </div>
  );
}
