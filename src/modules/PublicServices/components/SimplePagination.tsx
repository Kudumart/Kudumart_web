import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { usePagination } from "./simple-hooks";
import React from "react";

export default function SimplePaginator(props: { limit?: number }) {
  const { totalPages, handlePageChange, currentPage } = usePagination(
    props?.limit || 10,
  );

  const { register, handleSubmit, setValue } = useForm<{ page: number }>({
    defaultValues: { page: currentPage },
  });
  useEffect(() => {
    if (currentPage) setValue("page", currentPage);
  }, [currentPage, setValue]);

  const onSubmit = (data: { page: number }) => {
    let page = Number(data.page);
    if (isNaN(page)) page = 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    handlePageChange(page);
    setValue("page", page);
  };

  // Generate page buttons dynamically (show only 3 number buttons at once)
  const pageButtons: React.ReactNode[] = [];
  const maxButtons = 3;
  let start = Math.max(1, currentPage - 1);
  let end = Math.min(totalPages, start + maxButtons - 1);

  // Adjust start if we're at the end
  if (end - start < maxButtons - 1) {
    start = Math.max(1, end - maxButtons + 1);
  }

  // Show first page button and ellipsis if needed
  if (start > 1) {
    pageButtons.push(
      <button
        key={1}
        className={`btn btn-sm ${currentPage === 1 ? "btn-primary" : "btn-outline"}`}
        onClick={() => handlePageChange(1)}
      >
        1
      </button>,
    );
    if (start > 2) {
      pageButtons.push(
        <span key="start-ellipsis" className="px-2 text-base-content">
          ...
        </span>,
      );
    }
  }

  // Render the 3 visible page buttons
  for (let i = start; i <= end; i++) {
    pageButtons.push(
      <button
        key={i}
        className={`btn btn-sm ${currentPage === i ? "btn-primary" : "btn-outline"}`}
        onClick={() => handlePageChange(i)}
      >
        {i}
      </button>,
    );
  }

  // Show last page button and ellipsis if needed
  if (end < totalPages) {
    if (end < totalPages - 1) {
      pageButtons.push(
        <span key="end-ellipsis" className="px-2 text-base-content">
          ...
        </span>,
      );
    }
    pageButtons.push(
      <button
        key={totalPages}
        className={`btn btn-sm ${currentPage === totalPages ? "btn-primary" : "btn-outline"}`}
        onClick={() => handlePageChange(totalPages)}
      >
        {totalPages}
      </button>,
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
      <button
        className="btn btn-sm btn-outline"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        «
      </button>
      <div className="flex flex-wrap items-center gap-1">{pageButtons}</div>
      <button
        className="btn btn-sm btn-outline"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        »
      </button>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-wrap items-center gap-1 mt-2 sm:mt-0"
      >
        <input
          type="number"
          min={1}
          max={totalPages}
          {...register("page", { valueAsNumber: true, max: totalPages })}
          className="input input-sm input-bordered w-16"
          aria-label="Go to page"
        />
        <button type="submit" className="btn btn-sm btn-outline">
          Go
        </button>

        <div className="label ml-2 whitespace-nowrap">Limit: {totalPages}</div>
      </form>
    </div>
  );
}
