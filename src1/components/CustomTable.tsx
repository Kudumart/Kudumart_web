import { MenuIcon } from "lucide-react";
import { nanoid } from "nanoid";
import PopUp from "./table-pop/pop-button";
import { useState } from "react";
// import CaryBinApi from "../services/CarybinBaseUrl";
// import { Link } from "react-router-dom";

export type columnType<T> = {
  key: string;
  label: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
};

export type Actions<T> = {
  key: string;
  label: string;
  action: (item?: T) => any;
  render: (item: T) => React.ReactNode | any;
};
interface CustomTableProps<T> {
  data?: T[];
  columns?: columnType<T>[];
  actions?: Actions<T>[];
  user?: any;
}

export default function CustomTable<T>(props: CustomTableProps<T>) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  return (
    <div data-theme="kudu" className="" id="root">
      <div className=" relative overflow-x-auto">
        <div className="overflow-visible">
          <table className="table   w-full text-xs">
            <thead className="">
              <tr className=" rounded-2xl bg-base-200/50">
                {props.columns &&
                  props.columns.map((column, idx) => (
                    <th
                      key={idx}
                      className="capitalize text-left   text-xs font-semibold text-base-content/70 "
                    >
                      {column.label}
                    </th>
                  ))}
                {!props.columns?.find((item) => item.key == "action") && (
                  <>
                    <th className="font-semibold text-xs text-base-content/70 ">
                      Action
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {props.data &&
                props.data.map((item, rowIdx) => {
                  const popoverId = `popover-${nanoid()}`;
                  const anchorName = `--anchor-${nanoid()}`;
                  return (
                    <tr
                      key={rowIdx}
                      className="hover:bg-base-300 border-base-300"
                    >
                      {props.columns?.map((col, colIdx) => (
                        <td
                          className={`py-3 px-4 text-base-content ${
                            col.key === "action"
                              ? "relative overflow-visible"
                              : "text-ellipsis overflow-hidden max-w-xs"
                          }`}
                          key={colIdx}
                        >
                          {col.render
                            ? col.render(item[col.key], item)
                            : item[col.key]}
                        </td>
                      ))}
                      {!props.columns?.find(
                        (item, index) => item.key == "action",
                      ) && (
                        <>
                          <td className="relative overflow-visible">
                            <PopUp
                              itemIndex={rowIdx}
                              setIndex={setSelectedItem}
                              currentIndex={selectedItem}
                              key={rowIdx + "menu"}
                              actions={props?.actions || []}
                              item={item}
                            />
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
