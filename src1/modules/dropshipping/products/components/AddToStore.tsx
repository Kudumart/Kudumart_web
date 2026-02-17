import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../../api/apiFactory";
import QueryCage from "../../../../components/query/QueryCage";
import DropshipHeader from "./Header";
import StoreCard from "./StoreCard";
import { useCountrySelect } from "../../../../store/clientStore";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  NewPaginator,
  use_new_paginate,
} from "../../../../components/paginate/NewPaginator";

interface Store {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
    address: string;
    country: string;
  };
  businessHours: {
    sunday: string;
    saturday: string;
    monday_friday: string;
  };
  tipsOnFinding: string;
  logo: string;
  isVerified: boolean;
  currency: {
    symbol: string;
  };
}

interface SearchForm {
  search: string;
}

export default function AddToStore() {
  const currency = useCountrySelect();
  const paginate = use_new_paginate();
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit } = useForm<SearchForm>();

  const query = useQuery({
    queryKey: ["store-list", currency.country, paginate.page, searchTerm],
    queryFn: async () => {
      let resp = await apiClient.get("/stores", {
        params: {
          country: currency.country,
          limit: 30,
          search: searchTerm,
          name: searchTerm,
          page: paginate.page,
        },
      });
      return resp.data;
    },
  });

  const onSearch = (data: SearchForm) => {
    setSearchTerm(data.search);
    paginate.set_page(1);
  };

  const { itemId } = useParams();
  return (
    <div className="" data-theme="kudu">
      <DropshipHeader showTitle={true} />
      <div className="p-4 text-xl font-bold">
        Import Item To Store: #{itemId}
      </div>

      <div className="px-4 pb-2">
        <form onSubmit={handleSubmit(onSearch)} className="flex gap-2">
          <input
            {...register("search")}
            type="text"
            placeholder="Search stores..."
            className="input input-bordered w-full max-w-xs"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      <div className="p-4">
        <QueryCage query={query}>
          {(data: any) => {
            let stores: Store[] = data.data;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stores.map((item: Store) => {
                  return <StoreCard item={item} key={item.id} />;
                })}
              </div>
            );
          }}
        </QueryCage>
        <div className="my-3">
          <NewPaginator paginate={paginate} />
        </div>
      </div>
    </div>
  );
}
