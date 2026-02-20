import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Range } from "react-range";
import { Button } from "@material-tailwind/react";
import { useGeoLocatorCurrency } from "../../../hooks/geoLocatorProduct";
import Loader from "../../../components/Loader";
import useFilteredProducts from "../../../hooks/filteredProducts";
import { formatNumberWithCommas } from "../../../helpers/helperFactory";

const ProductListing = ({
  data,
  categories,
  pagination,
  onPageChange,
  subCategoriesArr,
  selectedCategory,
}) => {
  const [subCategories, setSubCategories] = useState(subCategoriesArr || []);

  const currency = useGeoLocatorCurrency();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    filteredProducts,
    isLoading,
    applyFilter,
    clearFilter,
    values,
    setValues,
    subCategoriesId,
    setSubCategoriesId,
  } = useFilteredProducts(data, id);

  const capitalizeEachWord = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSelectedSubId = (category) => {
    setSubCategoriesId(category);
  };

  const handleNavigation = (id, name) => {
    navigate(`/products/categories/${id}/${name}`);
  };

  const handleMin = (value) => {
    values[0] = value;
  };

  const handleMax = (value) => {
    values[1] = value;
  };

  // return <>{JSON.stringify(subCategories)}ss</>;

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-(--breakpoint-xl) mx-auto">
      <aside className="lg:w-1/5 p-4 rounded-lg shadow-md bg-white mb-6 h-fit -mt-8 md:mt-0 lg:mb-0 lg:top-1">
        <h2 className="text-base font-semibold mb-4">Category</h2>
        {categories && categories.length > 0 && (
          <div>
            <ul>
              {[...categories]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => (
                  <li
                    key={category.id}
                    className="mb-4"
                    onClick={() => handleNavigation(category.id, category.name)}
                  >
                    <label
                      htmlFor={category.id}
                      className="text-base cursor-pointer w-full"
                    >
                      {category.name}
                    </label>
                  </li>
                ))}
            </ul>
          </div>
        )}
        {selectedCategory && <p className="text-base">{selectedCategory}</p>}

        {subCategories.length > 0 && (
          <div className="my-6">
            <h3 className="font-semibold mb-4">Sub Category</h3>
            <ul>
              {subCategories
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => (
                  <li key={category.id} className="mb-4">
                    <input
                      type="radio"
                      id={category.id}
                      name="subcategory"
                      onChange={() => handleSelectedSubId(category.name)}
                      checked={subCategoriesId === category.name}
                    />
                    <label htmlFor={category.id} className="ml-2">
                      {category.name}
                    </label>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <h3 className="font-semibold mb-4">Price ({currency[0].symbol})</h3>
          <Range
            step={1}
            min={0}
            max={10000000}
            values={values}
            onChange={(values) => setValues(values)}
            renderTrack={({ props, children }) => (
              <div {...props} className="h-1.5 bg-gray-200 rounded-full">
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div {...props} className="h-5 w-5 bg-kudu-orange rounded-full" />
            )}
          />
          <div className="flex justify-between mt-2">
            <span>{values[0]}</span>
            <span>{values[1]}</span>
          </div>
          <div className="mt-4 flex justify-between gap-3 w-full">
            <div className="flex">
              <input
                type="text"
                id="title"
                placeholder="Min"
                onChange={(e) => handleMin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
              />
            </div>
            <div className="flex">
              <input
                type="text"
                id="title"
                onChange={(e) => handleMax(e.target.value)}
                placeholder="Max"
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={applyFilter}
              className="bg-kudu-orange shadow-md w-full"
            >
              APPLY
            </Button>
            <Button
              onClick={clearFilter}
              className="bg-white shadow-md border w-full text-black"
            >
              Clear
            </Button>
          </div>
        </div>
      </aside>

      <main className="lg:w-4/5 lg:pl-6 sm:pl-0">
        <div className="flex justify-between border items-center mb-6 bg-white p-5 rounded-md">
          <h1 className="text-xl font-bold">Products</h1>
          {/* <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border p-2 rounded-sm">
                        <option value="popularity">Sort by Popularity</option>
                        <option value="priceLow">Price: Low to High</option>
                        <option value="priceHigh">Price: High to Low</option>
                    </select> */}
        </div>

        {isLoading ? (
          <div className="w-full h-screen flex items-center justify-center">
            <Loader />
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const isSoldOut = product.quantity === 0;
                const price = parseFloat(product?.price);
                const discountPrice = parseFloat(product?.discount_price);
                const currencySymbol = product?.store?.currency?.symbol || "₦";
                const hasValidDiscount =
                  discountPrice > 0 && discountPrice < price;

                const content = (
                  <div
                    key={product.id}
                    className={`bg-white shadow-lg p-1 border rounded-lg relative flex flex-col h-full ${
                      isSoldOut ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <div className="flex justify-center relative h-[200px]">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-md">
                          <span className="text-white font-semibold text-lg">
                            Sold Out
                          </span>
                        </div>
                      )}
                      <div className="absolute w-full mt-3">
                        <button
                          className={`absolute top-0 right-0 px-2 py-1 text-xs rounded font-medium text-white ${
                            product?.vendor?.isVerified || product.admin
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {product?.vendor?.isVerified || product.admin
                            ? "Verified"
                            : "Not Verified"}
                        </button>
                        <span
                          className={`absolute top-0 left-0 px-2 py-1 text-xs rounded font-medium text-white ${
                            product.condition === "brand_new"
                              ? "bg-[#34A853]"
                              : "bg-orange-500"
                          }`}
                        >
                          {capitalizeEachWord(
                            product.condition.replace(/_/g, " "),
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col justify-between grow">
                      <div>
                        <h3 className="text-base font-medium mt-1 leading-loose truncate whitespace-nowrap overflow-hidden w-full">
                          {product.name}
                        </h3>
                        {hasValidDiscount ? (
                          <div className="flex flex-col mt-2">
                            <p className="text-sm font-semibold leading-loose text-red-500 line-through">
                              {currencySymbol} {formatNumberWithCommas(price)}
                            </p>
                            <p className="text-sm font-semibold leading-loose">
                              {currencySymbol}{" "}
                              {formatNumberWithCommas(discountPrice)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-semibold leading-loose">
                            {currencySymbol} {formatNumberWithCommas(price)}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <p className="text-sm text-kudu-roman-silver">
                            Qty Available: {product.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return isSoldOut ? (
                  <div key={product.id} className="h-full">
                    {content}
                  </div>
                ) : (
                  <Link
                    to={`/product/${product.id}`}
                    key={product.id}
                    className="h-full"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
            <div className="flex justify-center mt-4 md:mt-10 space-x-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  onPageChange(pagination.page - 1);
                }}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-200 rounded-sm disabled:opacity-50"
              >
                Previous
              </button>

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  onPageChange(pagination.page + 1);
                }}
                disabled={pagination.page === pagination.total}
                className="px-4 py-2 bg-kudu-orange text-white rounded-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="w-full">
            <div className="empty-store">
              <div className="text-center">
                <img
                  src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
                  alt="Empty Store Illustration"
                  className="w-80 h-80 mx-auto"
                />
              </div>
              <h1 className="text-center text-lg font-bold mb-4">
                No Product Found
              </h1>
              <div className="text-center text-black-100 mb-6 leading-loose text-sm">
                Oops! It looks like we don’t have products available in your
                region at the moment. <br></br>Please check back later or try
                browsing other categories.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductListing;
