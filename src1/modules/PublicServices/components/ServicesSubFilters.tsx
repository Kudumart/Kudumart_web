import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import apiClient from "../../../api/apiFactory";
interface SubCategory {
  id: string;
  categoryId: string;
  image: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
interface API_RESPONSE {
  data: SubCategory[];
}
export default function ServicesSubFilters() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useQuery<API_RESPONSE>({
    queryKey: ["public-sub-categories", categoryId],
    queryFn: async () => {
      let resp = await apiClient.get("/category/sub-categories", {
        params: {
          categoryId: categoryId,
        },
      });
      return resp.data;
    },
  });

  const selectedSubCategoryId = searchParams.get("subCategoryId");

  const handleSelect = (subCategoryId: string) => {
    // Set subCategoryId in search params, preserving other params
    const newParams = new URLSearchParams(searchParams);
    newParams.set("subCategoryId", subCategoryId);
    setSearchParams(newParams);
  };

  if (!query.data) return null;
  return (
    <div className="flex flex-col gap-2" data-theme="kudu">
      {query.isLoading && (
        <span className="loading loading-spinner loading-xs"></span>
      )}
      {query.isError && (
        <div className="alert alert-error">Error loading subcategories.</div>
      )}
      {query.data &&
        query.data.data.map((sub: SubCategory) => (
          <button
            key={sub.id}
            className={`btn btn-sm btn-outline ${
              selectedSubCategoryId === sub.id ? "btn-primary" : ""
            }`}
            onClick={() => handleSelect(sub.id)}
            type="button"
          >
            {sub.name}
          </button>
        ))}
    </div>
  );
}
