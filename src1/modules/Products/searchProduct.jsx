import { useEffect, useState } from "react";
import useApiMutation from "../../api/hooks/useApiMutation";
import ProductListing from "../../components/ProductsList";
import { useSearchParams } from "react-router-dom";
import Loader from "../../components/Loader";
import ShoppingExperience from "../Home/components/ShoppingExperience";
import { useCountrySelect } from "../../store/clientStore";
import SearchServices from "./new_components/SearchServices";

const tab_list = ["product", "service"];
const SearchProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("product");
  const { country } = useCountrySelect();
  const [searchParams] = useSearchParams();

  // Get single parameter
  const searchQuery = searchParams.get("q") || "";

  const { mutate } = useApiMutation();

  useEffect(() => {
    fetchData();
  }, [country.value]);
  // Fetch products from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const productRequest = new Promise((resolve, reject) => {
        mutate({
          url: `/products?name=${searchQuery}&country=${country.value}`,
          method: "GET",
          hideToast: true,
          onSuccess: (response) => resolve(response.data?.data || []),
          onError: reject,
        });
      });

      const [productsData] = await Promise.all([productRequest]);

      if (!productsData || productsData.length === 0) {
        console.warn("No products found.");
        setProducts([]);
        return;
      }

      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  return (
    <>
      <div className="w-full flex flex-col">
        <div className="w-full flex gap-2 md:px-20 py-5 px-5 mt-18">
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2 font-semibold text-sm">
              <span className="flex flex-col pt-1">Home</span>
              <span className="pt-[5px]">{">"}</span>
            </div>
            <div className="flex gap-2 font-semibold text-sm">
              <span className="flex flex-col pt-1">Search</span>
              <span className="pt-[5px]">{">"}</span>
            </div>
            <div className="flex gap-2 font-semibold text-sm">
              <span className="flex flex-col pt-1">{searchQuery}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col bg-white items-center">
        {/* Tab Navigation */}
        <div className="w-full flex justify-center border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            {tab_list.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-6 text-sm font-bold uppercase tracking-wider transition-colors duration-300 border-b-2 ${
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}s
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-20 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 bg-white h-full">
          {loading ? (
            <div className="w-full h-screen flex items-center justify-center">
              <Loader />
            </div>
          ) : activeTab === "product" ? (
            products.length > 0 ? (
              <div className="w-full flex mt-0">
                <ProductListing productsArr={products} />
              </div>
            ) : (
              <div className="empty-store mt-20">
                <div className="text-center">
                  <img
                    src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
                    alt="Empty Store Illustration"
                    className="w-80 h-80 mx-auto"
                  />
                </div>
                <h1 className="text-center text-lg font-bold mb-4">
                  Search Item not found!
                </h1>
              </div>
            )
          ) : (
            <SearchServices query={searchQuery} />
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

export default SearchProduct;
