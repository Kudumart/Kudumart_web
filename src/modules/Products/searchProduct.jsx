import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductListing from "../../components/ProductsList";
import { useSearchParams } from "react-router-dom";
import Loader from "../../components/Loader";
import ShoppingExperience from "../Home/components/ShoppingExperience";
import apiClient from "../../api/apiFactory";
import SearchServices from "./new_components/SearchServices";

const tab_list = ["product", "service"];
const SearchProduct = () => {
  const [activeTab, setActiveTab] = useState("product");
  const [searchParams] = useSearchParams();

  // Get single parameter
  const searchQuery = searchParams.get("q") || "";

  const { data: groups = [], isLoading: loading } = useQuery({
    queryKey: ["search-grouped", searchQuery],
    queryFn: async () => {
      const resp = await apiClient.get("/products/search-grouped", {
        params: { q: searchQuery },
      });
      return resp.data?.data || [];
    },
    enabled: activeTab === "product" && !!searchQuery,
  });

  const scrollToSection = (subCategoryId) => {
    const el = document.getElementById(`search-section-${subCategoryId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
            groups.length > 0 ? (
              <div className="w-full flex flex-col md:flex-row gap-6 mt-0">
                {/* Left sidebar: matching categories, clicking scrolls to its section */}
                <div className="md:w-64 w-full shrink-0">
                  <div className="md:sticky md:top-24 flex flex-col gap-1 bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                    <h2 className="text-sm font-bold uppercase text-gray-500 mb-2">
                      Matching Categories
                    </h2>
                    {groups.map(({ subCategory }) => (
                      <button
                        key={subCategory.id}
                        type="button"
                        onClick={() => scrollToSection(subCategory.id)}
                        className="text-left text-sm py-2 px-2 rounded-md hover:bg-kudu-light-blue hover:text-kudu-orange transition-colors"
                      >
                        {subCategory.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right side: every matching category's products, sectioned */}
                <div className="flex-1 flex flex-col gap-10">
                  {groups.map(({ subCategory, products: sectionProducts }) => (
                    <div
                      key={subCategory.id}
                      id={`search-section-${subCategory.id}`}
                      className="scroll-mt-24"
                    >
                      <h3 className="text-lg font-bold mb-3">
                        {subCategory.name}
                      </h3>
                      <ProductListing productsArr={sectionProducts} />
                    </div>
                  ))}
                </div>
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
