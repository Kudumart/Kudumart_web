import { useSearchParams } from "react-router-dom";

export const usePagination = (totalPages: number) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = (page: number) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev.toString());
        params.set("page", page.toString());
        return params;
      },
      {
        preventScrollReset: true,
      },
    );
  };

  return {
    currentPage,
    totalPages,
    handlePageChange,
  };
};
