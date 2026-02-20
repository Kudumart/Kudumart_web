import { useQuery } from "@tanstack/react-query";
import { useCountrySelect } from "../../../../store/clientStore";
import apiClient from "../../../../api/apiFactory";
import { Link } from "react-router-dom";
import ProductListing from "../../../../components/ProductsList";
import { useModal } from "../../../../hooks/modal";
import Loader from "../../../../components/Loader";
import AdsComp from "./AdsComp";
import NewCard from "./Card";

export default function NewProductSection() {
  const { country } = useCountrySelect();
  const { data, isLoading } = useQuery({
    queryKey: ["products-homepage", country.value],
    queryFn: async () => {
      let resp = await apiClient.get("/products", {
        params: {
          country: country.value,
        },
      });
      return resp.data;
    },
  });

  if (isLoading) {
    return (
      <>
        <Loader />
      </>
    );
  }
  const new_products = data?.data || [];
  // return <>{JSON.stringify(country.value)}</>;
  return (
    <div className="w-full">
      <div className="w-full">
        <div className="bg-[#C1FFA5] flex justify-between p-6 rounded-md mb-10 cursor-pointer">
          <h2 className="text-lg font-semibold">All Products</h2>
          <Link to={"/see-all"} className="text-black font-semibold">
            See All
          </Link>
        </div>
        {/*<div
          className={`grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4`}
        >
          {new_products?.slice(0, 12).map((item) => (
            <NewCard key={item.id} item={item} />
          ))}
        </div>*/}
        <ProductListing productsArr={new_products?.slice(0, 12)} displayError />
        <AdsComp />
        <ProductListing
          productsArr={new_products
            ?.filter((item) => item.condition == "brand_new")
            .slice(12, 24)}
        />
      </div>
    </div>
  );
}
