import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { PublicServicesResponse } from "./public-services";
import apiClient from "../../api/apiFactory";
import ServiceCard from "./components/ServiceCard";
import SimplePaginator from "./components/SimplePagination";
import ServicesSubFilters from "./components/ServicesSubFilters";

export default function PublicServicesSubcategories() {
  const [searchParams] = useSearchParams();

  // Convert searchParams to an object
  const params: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  const { categoryId } = useParams();
  const { data, isLoading, isError } = useQuery<PublicServicesResponse>({
    queryKey: ["listings", params, categoryId],
    queryFn: async () => {
      let resp = await apiClient.get("/services", {
        params: {
          ...params,
          categoryId,
        },
      });
      return resp.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return <div className="alert alert-error">Error loading services.</div>;
  }

  return (
    <div className="container mx-auto p-4 mt-28" data-theme="kudu">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>
      <div className="flex min-h-screen  gap-2">
        <div className="flex-1 max-w-xs  flex-col md:flex-row shadow-xl h-fit">
          {/*<ServiceFilters />*/}
          <ServicesSubFilters />
        </div>
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {data?.data.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">😕</div>
                <div className="text-xl font-semibold mb-2">
                  No services found
                </div>
                <div className="text-base text-base-content/70">
                  Try adjusting your filters or check back later.
                </div>
              </div>
            ) : (
              data?.data.map((service) => (
                <ServiceCard {...service} key={service.id} />
              ))
            )}
          </div>
          {data?.pagination && (
            <div className="py-4 grid place-items-center">
              {/*{data.pagination.totalPages}*/}
              <SimplePaginator limit={data.pagination.totalPages} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
