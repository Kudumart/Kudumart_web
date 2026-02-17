import { useEffect, useState } from "react";
import "../Home/components/style.css";
import ProductListing from "./components/ProductListing";
import ShoppingExperience from "./components/ShoppingExperience";
import useApiMutation from "../../api/hooks/useApiMutation";
import Loader from "../../components/Loader";
import { useGeoLocatorCurrency } from "../../hooks/geoLocatorProduct";
import { useQuery } from "@tanstack/react-query";
import { useCountrySelect } from "../../store/clientStore";
import apiClient from "../../api/apiFactory";
import { useNewFilters } from "../../hooks/new_hooks";
import NewFilters from "./components/new-comps/NewFilters";
import NewProductListing from "./components/new-comps/NewProductListings";
import CategoryList from "./components/new-comps/CategoryList";
import SimplePaginator from "./components/new-comps/SimplePaginator";

const About = () => {
  const { filters } = useNewFilters();
  const [paginate, setPaginate] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const { country } = useCountrySelect();
  const currency = useGeoLocatorCurrency();
  const { mutateAsync } = useApiMutation(); // Use mutateAsync for useQuery

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useQuery({
    queryKey: [
      "products",
      paginate.page,
      paginate.limit,
      country.value,
      filters,
    ],
    queryFn: async () => {
      let resp = await apiClient.get("/products", {
        params: {
          page: paginate.page,
          limit: paginate.limit,
          country: country.value,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        },
      });
      return resp.data;
    },
    keepPreviousData: true,
  });

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      let resp = await apiClient.get("/categories");
      return resp.data;
    },
    enabled: !!currency[0]?.symbol, // Only fetch when currency symbol is available
  });
  const handlePagination = (page) => {
    setPaginate((prev) => ({ ...prev, page: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const products = productsData?.data || [];
  const categoriesArr = categoriesData?.data || [];
  const productsPagination = productsData?.productsPagination;

  if (isProductsError || isCategoriesError) {
    console.error(
      "Error fetching data:",
      isProductsError ? productsError : categoriesError,
    );
    return <div>Error loading products and categories.</div>;
  }

  // return <div className="min-h-screen" data-theme="kudu"></div>;
  return (
    <>
      <div className="w-full flex flex-col">
        <section
          className="breadcrumb"
          style={{
            backgroundImage: `url(https://res.cloudinary.com/greenmouse-tech/image/upload/v1738015034/image_5_vbukr9.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col">
            <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
              <h1 className="text-4xl font-bold">Products</h1>
            </div>
          </div>
        </section>
      </div>
      <div className="w-full flex flex-col bg-white items-center">
        {/* Hero Section */}
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-20 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 bg-white h-full">
          <div className="w-full flex mt-10">
            {isProductsLoading || isCategoriesLoading ? (
              <div className="w-full flex my-20">
                <Loader />
              </div>
            ) : (
              <div className="flex w-full flex-col md:flex-row">
                <div className="flex flex-col gap-2">
                  <CategoryList data={categoriesArr} />
                  <NewFilters />
                </div>
                <div className="flex-1 ">
                  <NewProductListing data={products} />
                  <SimplePaginator
                    {...productsData.pagination}
                    handleNextPage={handlePagination}
                  />
                </div>
                {/* <ProductListing
                  data={products}
                  pagination={paginate}
                  categories={categoriesArr}
                  onPageChange={handlePagination}
                  isLoading={isProductsLoading && isCategoriesLoading}
                />*/}
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 bg-white h-full">
          <div className="w-full flex mt-3">
            <ShoppingExperience />
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
