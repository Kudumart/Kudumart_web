import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Imgix from "react-imgix";
import apiClient from "../../api/apiFactory";
import Loader from "../../components/Loader";
import NewProductListing from "../Home/components/new-comps/NewProductListings";
import SimplePaginator from "../Home/components/new-comps/SimplePaginator";
import { getDateDifference } from "../../helpers/dateHelper";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/do2kojulq/image/upload/v1735426601/kudu_mart/profile_icon_yq3gnr.png";

const VendorStorefront = () => {
  const { vendorId } = useParams();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: productList, isLoading } = useQuery({
    queryKey: ["vendor-products", vendorId, page],
    queryFn: async () => {
      const resp = await apiClient.get("/products", {
        params: { vendorId, page, limit },
      });
      return resp.data;
    },
    enabled: !!vendorId,
  });

  const products = productList?.data || [];
  const firstProduct = products[0];
  const vendor = location.state?.vendor || firstProduct?.vendor;
  const store = location.state?.store || firstProduct?.store;

  const handleNextPage = (nextPageNumber) => {
    setPage(nextPageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full flex flex-col bg-[#f1f1f2]">
      <section
        className="breadcrumb"
        style={{
          backgroundImage: `url(https://res.cloudinary.com/greenmouse-tech/image/upload/v1738015034/image_5_vbukr9.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-12 gap-5">
          {vendor ? (
            <div className="flex items-center gap-4">
              <Imgix
                sizes="100vw"
                src={store?.logo || DEFAULT_AVATAR}
                alt="vendor avatar"
                width={72}
                height={72}
                className="w-[72px] h-[72px] rounded-full object-cover border-4 border-white"
              />
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold">
                  {store?.name || `${vendor.firstName} ${vendor.lastName}`}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">
                    {vendor.firstName} {vendor.lastName}
                  </span>
                  {vendor.isVerified ? (
                    <span className="py-1 px-3 rounded-full bg-[rgba(52,168,83,1)] text-white text-xs">
                      Verified
                    </span>
                  ) : (
                    <span className="py-1 px-3 rounded-full bg-red-500 text-white text-xs">
                      Unverified
                    </span>
                  )}
                  {vendor.createdAt && (
                    <span className="text-xs font-semibold">
                      {getDateDifference(vendor.createdAt)} on Kudu
                    </span>
                  )}
                </div>
                {store?.location && (
                  <span className="text-sm text-gray-600">
                    {store.location.address}, {store.location.city},{" "}
                    {store.location.state}, {store.location.country}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <h1 className="text-3xl font-bold">Vendor Store</h1>
          )}
        </div>
      </section>

      <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-20 md:px-20 px-5 py-6 gap-5">
        {isLoading ? (
          <div className="w-full h-96 flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              {productList?.pagination?.totalCount ?? products.length} product
              {(productList?.pagination?.totalCount ?? products.length) === 1
                ? ""
                : "s"}{" "}
              from this vendor
            </p>
            <NewProductListing data={products} />
            {productList?.pagination && (
              <SimplePaginator
                {...productList.pagination}
                handleNextPage={handleNextPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VendorStorefront;
