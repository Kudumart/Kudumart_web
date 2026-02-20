import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export const NewPaginator = ({
  paginate,
}: {
  paginate: ReturnType<typeof use_new_paginate>;
}) => {
  return (
    <div
      className="flex items-center gap-2  py-2 justify-center mb-2"
      onClick={() => {}}
    >
      <button
        type="button"
        onClick={paginate.prevPage}
        className="btn btn-square btn-primary btn-sm"
      >
        <Minus />
      </button>
      <>{paginate.page}</>
      <button
        type="button"
        onClick={paginate.nextPage}
        className="btn btn-square btn-primary btn-sm"
      >
        <Plus />
      </button>
    </div>
  );
};

export const use_new_paginate = (ini?: number) => {
  const [page, setPage] = useState(ini || 1);
  const nextPage = () => {
    if (page < 100) {
      setPage(page + 1);
    }
  };
  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  return {
    page,
    nextPage,
    prevPage,
  };
};
