interface SimplePaginatorProps {
  currentPage: number;
  totalPages: number;
  nextPage: string | null;
  prevPage: string | null;
  totalCount: number;
  handleNextPage?: (page: number) => any;
}

export default function SimplePaginator({
  currentPage,
  totalPages,
  nextPage,
  prevPage,
  totalCount,
  handleNextPage,
}: SimplePaginatorProps) {
  const handleNext = () => {
    if (handleNextPage && nextPage) {
      handleNextPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (handleNextPage && prevPage) {
      handleNextPage(currentPage - 1);
    }
  };

  return (
    <div
      className="flex justify-center items-center gap-4 py-4"
      data-theme="kudu"
    >
      <button
        onClick={handlePrev}
        className={`btn btn-primary ${!prevPage ? "btn-disabled" : ""}`}
        aria-disabled={!prevPage}
        disabled={!prevPage}
      >
        Previous
      </button>
      <span className="text-lg font-semibold">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        className={`btn btn-primary ${!nextPage ? "btn-disabled" : ""}`}
        aria-disabled={!nextPage}
        disabled={!nextPage}
      >
        Next
      </button>
    </div>
  );
}
