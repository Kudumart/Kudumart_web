import { Minus, Plus } from "lucide-react";

export const SimplePagination = ({
  paginate,
  total,
}: {
  paginate: any;
  total: number;
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
      <>{paginate.params.page}</>
      <button
        type="button"
        onClick={() => {
          console.log("ss");

          paginate.nextPage(100);
        }}
        className="btn btn-square btn-primary btn-sm"
      >
        <Plus />
      </button>
    </div>
  );
};
