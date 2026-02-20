import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import Loader from "../../../components/Loader";
import ServiceCard from "../../PublicServices/components/ServiceCard";
import {
  NewPaginator,
  use_new_paginate,
} from "../../../components/paginate/NewPaginator";

export default function SearchService({ searchTerm }: { searchTerm: string }) {
  const paginate = use_new_paginate(1);

  const query = useQuery({
    queryKey: ["search-service", searchTerm, paginate.page],
    queryFn: async () => {
      const response = await apiClient.get(`/services`, {
        params: {
          search: searchTerm,
          page: paginate.page,
        },
      });
      return response.data;
    },
  });

  if (query.isLoading) {
    return <Loader />;
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <p className="text-error">Error loading services. Please try again.</p>
        <button
          className="btn btn-outline mt-4"
          onClick={() => query.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const items = query.data?.data || [];

  if (items.length === 0) {
    return (
      <div className="empty-store mt-20">
        <div className="text-center">
          <img
            src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
            alt="Empty Store Illustration"
            className="w-80 h-80 mx-auto"
          />
        </div>
        <h1 className="text-center text-lg font-bold mb-4">
          Search Service not found!
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-theme="kudu">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item: any) => (
          <ServiceCard key={item.id} {...item} />
        ))}
      </div>
      <div className="mt-8">
        <NewPaginator paginate={paginate} />
      </div>
    </div>
  );
}
