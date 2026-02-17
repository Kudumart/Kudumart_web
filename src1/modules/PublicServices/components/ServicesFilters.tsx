import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import { Link } from "react-router-dom";

interface MainCategory {
  id: string;
  image: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // subCategories?: SubCategory[]; // Not used for this fix
}

interface API_Response {
  data: MainCategory[];
}

export default function ServiceFilters() {
  const query = useQuery<API_Response>({
    queryKey: ["public-categories"],
    queryFn: async () => {
      let resp = await apiClient.get("/service/categories");
      return resp.data;
    },
  });

  if (query.isLoading) {
    return (
      <div className="p-4">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="p-4">
        <div className="alert alert-error">Error loading filters</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Categories</h4>
          <div className="flex flex-col gap-2">
            {query.data?.data.map((category) => (
              <Link
                to={`/services/category/${category.id}`}
                key={category.id}
                className="block"
              >
                <label className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-primary/10 transition cursor-pointer shadow-sm border border-base-300 hover:border-primary">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-base-100 flex items-center justify-center border border-base-300">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base-content/40 text-xl">📁</span>
                    )}
                  </div>
                  <span className="font-medium text-base-content">
                    {category.name}
                  </span>
                </label>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
