import { useEffect, useState } from "react";
import "../Home/components/style.css";
import useApiMutation from "../../api/hooks/useApiMutation";
import { useParams, useSearchParams } from "react-router-dom";
import ShoppingExperience from "../Home/components/ShoppingExperience";
import ProductListing from "../Home/components/ProductListing";
import Loader from "../../components/Loader";
import { useGeoLocatorCurrency } from "../../hooks/geoLocatorProduct";
import NewProductListing from "../Home/components/new-comps/NewProductListings";
import SubCategoryList from "../Home/components/new-comps/SubCategoryList";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/apiFactory";
import { useNewFilters } from "../../hooks/new_hooks";
import NewFilters from "../Home/components/new-comps/NewFilters";
import { useCountrySelect } from "../../store/clientStore";
import SimplePaginator from "../Home/components/new-comps/SimplePaginator";

const CategoriesProduct = () => {
  const [products, setProducts] = useState([]);
  const { filters } = useNewFilters();
  const [paginate, setPaginate] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [categoriesArr, setCategoriesArr] = useState([]);
  const [loading, setLoading] = useState(true);

  const currency = useGeoLocatorCurrency();
  const [subCat] = useSearchParams();
  const { id, name } = useParams();
  const { mutate } = useApiMutation();
  const { country } = useCountrySelect();
  useEffect(() => {
    handleNextPage(1);
  }, [subCat.get("subCategory")]);

  const { data: productList, isLoading: productLoading } = useQuery({
    queryKey: [
      "products",
      subCat.get("subCategory"),
      id,
      filters,
      country.value,
      paginate.page,
    ],
    queryFn: async () => {
      const rawParams = {
        categoryId: id,
        page: paginate.page,
        country: country.value,
        limit: paginate.limit,
        symbol: currency[0]?.symbol,
        subCategoryName: subCat.get("subCategory"),
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      };

      const params = Object.fromEntries(
        Object.entries(rawParams).filter(
          ([, value]) => value !== null && value !== "",
        ),
      );

      let resp = await apiClient.get("/products", {
        params,
      });
      return resp.data;
    },
  });
  const handleNextPage = (page) => {
    setPaginate((prev) => ({ ...prev, page: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoriesData = await new Promise((resolve, reject) => {
          mutate({
            url: `/category/sub-categories?categoryId=${id}`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => resolve(response.data?.data || []),
            onError: reject,
          });
        });
        // Update state
        setCategoriesArr(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(paginate);
  }, [id]);

  const handlePagination = (page) => {
    setPaginate((prev) => ({ ...prev, page }));
    fetchData({ ...paginate, page });
  };

  return (
    <>
      <div className="w-full flex flex-col bg-[#f1f1f2]">
        <section
          className="breadcrumb"
          style={{
            backgroundImage: `url(https://res.cloudinary.com/greenmouse-tech/image/upload/v1738015034/image_5_vbukr9.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col py-12">
            <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
              <h1 className="text-4xl font-bold">{name}</h1>
            </div>
          </div>
        </section>
      </div>
      <div className="w-full flex flex-col bg-[#f1f1f2] items-center">
        {/* Hero Section */}
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-20 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
          {loading || productLoading ? (
            <div className="w-full h-screen flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <div
              className="w-full flex-col flex  md:flex-row mt-20 md:mt-10 p-2 gap-2 "
              data-theme="kudu"
            >
              <div className="flex-1 md:max-w-xs max-w-auto  bg-base-200">
                <SubCategoryList data={categoriesArr} />
                <NewFilters />
              </div>
              <div className="flex-1">
                <NewProductListing data={productList?.data || []} />
                <SimplePaginator
                  {...productList.pagination}
                  handleNextPage={handleNextPage}
                />
              </div>
            </div>
          )}
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

export default CategoriesProduct;
