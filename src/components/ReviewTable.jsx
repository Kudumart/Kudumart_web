import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
} from "@material-tailwind/react";
import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { exportToCSV } from "../helpers/exportToCSV";
import Loader from "./Loader";
import { useDebounce } from "../hooks/useDebounce";

function Table({
  title,
  subTitle,
  columns,
  allData,
  data,
  actions = [],
  exportData = false,
  isLoading = false,
  hasNumber = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  disableInternalSearch = false,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onAdd,
  addButtonText = "Add New",
}) {
  const [processedColumns, setProcessedColumns] = useState(columns);
  const [internalSearchTerm, setInternalSearchTerm] = useState("");

  // Use external search if provided, otherwise use internal search
  const searchTerm = disableInternalSearch ? searchQuery : internalSearchTerm;

  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 1️⃣ Add numbering column if requested
  useEffect(() => {
    if (hasNumber) {
      setProcessedColumns([{ key: "number", label: "#" }, ...columns]);
    } else {
      setProcessedColumns(columns);
    }
  }, [hasNumber, columns]);

  // 2️⃣ Build a filtered version of the data with debounced search
  const filteredData = useMemo(() => {
    const dataToFilter = allData || data || [];

    // If external search is being used, don't filter here - data is already filtered
    if (disableInternalSearch) {
      return dataToFilter;
    }

    if (!debouncedSearchTerm) return dataToFilter;
    const lower = debouncedSearchTerm.toLowerCase();
    return dataToFilter.filter((row) =>
      Object.values(row).some(
        (value) => value != null && String(value).toLowerCase().includes(lower),
      ),
    );
  }, [allData, data, debouncedSearchTerm, disableInternalSearch]);

  // Reset pagination when searching
  useEffect(() => {
    if (debouncedSearchTerm && onPageChange && currentPage !== 1) {
      onPageChange(1);
    }
  }, [debouncedSearchTerm, onPageChange]);

  // 3️⃣ Export should use filtered data
  const handleExport = () => {
    const exportCols = hasNumber ? columns : processedColumns;
    exportToCSV(exportCols, filteredData, `export-${title || "data"}`);
  };

  return (
    <div className="md:px-5 px-3 pt-6 pb-12 md:rounded-lg overflow-hidden bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          {title && <p className="text-base font-medium mb-2">{title}</p>}
          {subTitle && <h3 className="text-lg font-semibold">{subTitle}</h3>}
        </div>

        {/* wrap search + export together */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* 🔍 Professional Search Input with debouncing */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                if (disableInternalSearch && onSearchChange) {
                  onSearchChange(e.target.value);
                } else {
                  setInternalSearchTerm(e.target.value);
                }
              }}
              placeholder={searchPlaceholder}
              className="border px-3 py-2 pl-10 rounded-md w-full md:w-64 outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* ⬇️ Add Button */}
          {onAdd && (
            <button
              onClick={onAdd}
              className="px-3 py-2 flex gap-2 items-center rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <span className="text-xs">{addButtonText}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          )}

          {/* ⬇️ Export Button */}
          {exportData && (
            <button
              onClick={handleExport}
              className="px-3 py-2 flex gap-2 items-center rounded-md bg-blue-900 text-white hover:bg-blue-800 transition-colors"
            >
              <span className="text-xs">Export</span>
              <svg
                width="10"
                height="12"
                viewBox="0 0 10 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.00122 1V11M0.909424 6.9082L5.00033 10.9991L9.09124 6.9082"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden border rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="table-auto text-left w-full min-w-[600px]">
            <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                {processedColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap ${col.className || ""}`}
                  >
                    {col.label}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={processedColumns.length + 1}
                    className="text-center py-6"
                  >
                    <Loader size={16} />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={processedColumns.length + 1}
                    className="text-center py-6 text-gray-500"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-t border-gray-100 hover:bg-orange-50/30 transition-colors duration-150 group"
                  >
                    {processedColumns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-3 py-4 text-sm text-gray-900 ${col.className || ""}`}
                      >
                        {col.key === "number"
                          ? rowIndex + 1
                          : col.render
                            ? col.render(row[col.key], row)
                            : row[col.key]}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="py-4 px-4">
                        <Menu placement="left">
                          <MenuHandler>
                            <IconButton
                              variant="text"
                              className="text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-150 opacity-0 group-hover:opacity-100"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="9"
                                viewBox="0 0 32 9"
                                fill="none"
                              >
                                <mask
                                  id="path-1-outside-1_6231_8791"
                                  maskUnits="userSpaceOnUse"
                                  x="0"
                                  y="0"
                                  width="25"
                                  height="9"
                                  fill="black"
                                >
                                  <rect fill="white" width="32" height="9" />
                                  <path d="M4.65341 7.26989C3.87689 7.26989 3.20928 6.99527 2.65057 6.44602C2.09186 5.88731 1.8125 5.21496 1.8125 4.42898C1.8125 3.65246 2.09186 2.98958 2.65057 2.44034C3.20928 1.88163 3.87689 1.60227 4.65341 1.60227C5.42992 1.60227 6.09754 1.88163 6.65625 2.44034C7.21496 2.98958 7.49432 3.65246 7.49432 4.42898C7.49432 4.94981 7.36174 5.42803 7.09659 5.86364C6.84091 6.28977 6.5 6.63068 6.07386 6.88636C5.64773 7.14205 5.17424 7.26989 4.65341 7.26989ZM15.9815 7.26989C15.205 7.26989 14.5374 6.99527 13.9787 6.44602C13.42 5.88731 13.1406 5.21496 13.1406 4.42898C13.1406 3.65246 13.42 2.98958 13.9787 2.44034C14.5374 1.88163 15.205 1.60227 15.9815 1.60227C16.758 1.60227 17.4257 1.88163 17.9844 2.44034C18.5431 2.98958 18.8224 3.65246 18.8224 4.42898C18.8224 4.94981 18.6899 5.42803 18.4247 5.86364C18.169 6.28977 17.8281 6.63068 17.402 6.88636C16.9759 7.14205 16.5024 7.26989 15.9815 7.26989ZM27.3097 7.26989C26.5331 7.26989 25.8655 6.99527 25.3068 6.44602C24.7481 5.88731 24.4688 5.21496 24.4688 4.42898C24.4688 3.65246 24.7481 2.98958 25.3068 2.44034C25.8655 1.88163 26.5331 1.60227 27.3097 1.60227C28.0862 1.60227 28.7538 1.88163 29.3125 2.44034C29.8712 2.98958 30.1506 3.65246 30.1506 4.42898C30.1506 4.94981 30.018 5.42803 29.7528 5.86364C29.4972 6.28977 29.1562 6.63068 28.7301 6.88636C28.304 7.14205 27.8305 7.26989 27.3097 7.26989Z" />
                                </mask>
                                <path
                                  d="M4.65341 7.26989C3.87689 7.26989 3.20928 6.99527 2.65057 6.44602C2.09186 5.88731 1.8125 5.21496 1.8125 4.42898C1.8125 3.65246 2.09186 2.98958 2.65057 2.44034C3.20928 1.88163 3.87689 1.60227 4.65341 1.60227C5.42992 1.60227 6.09754 1.88163 6.65625 2.44034C7.21496 2.98958 7.49432 3.65246 7.49432 4.42898C7.49432 4.94981 7.36174 5.42803 7.09659 5.86364C6.84091 6.28977 6.5 6.63068 6.07386 6.88636C5.64773 7.14205 5.17424 7.26989 4.65341 7.26989ZM15.9815 7.26989C15.205 7.26989 14.5374 6.99527 13.9787 6.44602C13.42 5.88731 13.1406 5.21496 13.1406 4.42898C13.1406 3.65246 13.42 2.98958 13.9787 2.44034C14.5374 1.88163 15.205 1.60227 15.9815 1.60227C16.758 1.60227 17.4257 1.88163 17.9844 2.44034C18.5431 2.98958 18.8224 3.65246 18.8224 4.42898C18.8224 4.94981 18.6899 5.42803 18.4247 5.86364C18.169 6.28977 17.8281 6.63068 17.402 6.88636C16.9759 7.14205 16.5024 7.26989 15.9815 7.26989ZM27.3097 7.26989C26.5331 7.26989 25.8655 6.99527 25.3068 6.44602C24.7481 5.88731 24.4688 5.21496 24.4688 4.42898C24.4688 3.65246 24.7481 2.98958 25.3068 2.44034C25.8655 1.88163 26.5331 1.60227 27.3097 1.60227C28.0862 1.60227 28.7538 1.88163 29.3125 2.44034C29.8712 2.98958 30.1506 3.65246 30.1506 4.42898C30.1506 4.94981 30.018 5.42803 29.7528 5.86364C29.4972 6.28977 29.1562 6.63068 28.7301 6.88636C28.304 7.14205 27.8305 7.26989 27.3097 7.26989Z"
                                  fill="#2D1967"
                                />
                                <path
                                  d="M2.65057 6.44602L1.94344 7.15316L1.94953 7.15915L2.65057 6.44602ZM2.65057 2.44034L3.35163 3.15349L3.35768 3.14745L2.65057 2.44034ZM6.65625 2.44034L5.94912 3.14747L5.95521 3.15347L6.65625 2.44034ZM7.09659 5.86364L6.24238 5.34368L6.2391 5.34914L7.09659 5.86364ZM4.65341 6.26989C4.14177 6.26989 3.72518 6.10014 3.35161 5.7329L1.94953 7.15915C2.69339 7.89039 3.61202 8.26989 4.65341 8.26989V6.26989ZM3.35768 5.73892C2.98538 5.36662 2.8125 4.94817 2.8125 4.42898H0.8125C0.8125 5.48175 1.19833 6.408 1.94346 7.15313L3.35768 5.73892ZM2.8125 4.42898C2.8125 3.92334 2.98221 3.5166 3.35161 3.15347L1.94953 1.72722C1.2015 2.46256 0.8125 3.38159 0.8125 4.42898H2.8125ZM3.35768 3.14745C3.73254 2.77258 4.14729 2.60227 4.65341 2.60227V0.602272C3.6065 0.602272 2.68602 0.990677 1.94346 1.73323L3.35768 3.14745ZM4.65341 2.60227C5.15953 2.60227 5.57428 2.77258 5.94914 3.14745L7.36336 1.73323C6.6208 0.990677 5.70032 0.602272 4.65341 0.602272V2.60227ZM5.95521 3.15347C6.32461 3.5166 6.49432 3.92334 6.49432 4.42898H8.49432C8.49432 3.38159 8.10531 2.46256 7.35729 1.72722L5.95521 3.15347ZM6.49432 4.42898C6.49432 4.77052 6.41006 5.06823 6.24239 5.34369L7.95079 6.38358C8.31342 5.78783 8.49432 5.1291 8.49432 4.42898H6.49432ZM6.2391 5.34914C6.06787 5.63453 5.84475 5.85764 5.55937 6.02887L6.58836 7.74386C7.15525 7.40372 7.61395 6.94502 7.95408 6.37813L6.2391 5.34914ZM5.55937 6.02887C5.29627 6.18673 5.00209 6.26989 4.65341 6.26989V8.26989C5.34639 8.26989 5.99919 8.09736 6.58836 7.74386L5.55937 6.02887ZM13.9787 6.44602L13.2716 7.15316L13.2777 7.15915L13.9787 6.44602ZM13.9787 2.44034L14.6798 3.15349L14.6858 3.14745L13.9787 2.44034ZM17.9844 2.44034L17.2772 3.14747L17.2833 3.15347L17.9844 2.44034ZM18.4247 5.86364L17.5705 5.34368L17.5672 5.34914L18.4247 5.86364ZM15.9815 6.26989C15.4699 6.26989 15.0533 6.10014 14.6797 5.7329L13.2777 7.15915C14.0215 7.89039 14.9401 8.26989 15.9815 8.26989V6.26989ZM14.6858 5.73892C14.3135 5.36662 14.1406 4.94817 14.1406 4.42898H12.1406C12.1406 5.48175 12.5265 6.408 13.2716 7.15313L14.6858 5.73892ZM14.1406 4.42898C14.1406 3.92334 14.3103 3.5166 14.6797 3.15347L13.2777 1.72722C12.5296 2.46256 12.1406 3.38159 12.1406 4.42898H14.1406ZM14.6858 3.14745C15.0607 2.77258 15.4754 2.60227 15.9815 2.60227V0.602272C14.9346 0.602272 14.0141 0.990677 13.2716 1.73323L14.6858 3.14745ZM15.9815 2.60227C16.4877 2.60227 16.9024 2.77258 17.2773 3.14745L18.6915 1.73323C17.9489 0.990677 17.0284 0.602272 15.9815 0.602272V2.60227ZM17.2833 3.15347C17.6527 3.5166 17.8224 3.92334 17.8224 4.42898H19.8224C19.8224 3.38159 19.4334 2.46256 18.6854 1.72722L17.2833 3.15347ZM17.8224 4.42898C17.8224 4.77052 17.7382 5.06823 17.5705 5.34369L19.2789 6.38358C19.6415 5.78783 19.8224 5.1291 19.8224 4.42898H17.8224ZM17.5672 5.34914C17.396 5.63453 17.1729 5.85764 16.8875 6.02887L17.9165 7.74386C18.4834 7.40372 18.9421 6.94502 19.2822 6.37813L17.5672 5.34914ZM16.8875 6.02887C16.6244 6.18673 16.3302 6.26989 15.9815 6.26989V8.26989C16.6745 8.26989 17.3273 8.09736 17.9165 7.74386L16.8875 6.02887ZM25.3068 6.44602L24.5997 7.15316L24.6058 7.15915L25.3068 6.44602ZM25.3068 2.44034L26.0079 3.15349L26.0139 3.14745L25.3068 2.44034ZM29.3125 2.44034L28.6054 3.14747L28.6115 3.15347L29.3125 2.44034ZM29.7528 5.86364L28.8986 5.34368L28.8953 5.34914L29.7528 5.86364ZM27.3097 6.26989C26.798 6.26989 26.3814 6.10014 26.0079 5.7329L24.6058 7.15915C25.3496 7.89039 26.2683 8.26989 27.3097 8.26989V6.26989ZM26.0139 5.73892C25.6416 5.36662 25.4688 4.94817 25.4688 4.42898H23.4688C23.4688 5.48175 23.8546 6.408 24.5997 7.15313L26.0139 5.73892ZM25.4688 4.42898C25.4688 3.92334 25.6385 3.5166 26.0079 3.15347L24.6058 1.72722C23.8578 2.46256 23.4688 3.38159 23.4688 4.42898H25.4688ZM26.0139 3.14745C26.3888 2.77258 26.8035 2.60227 27.3097 2.60227V0.602272C26.2628 0.602272 25.3423 0.990677 24.5997 1.73323L26.0139 3.14745ZM27.3097 2.60227C27.8158 2.60227 28.2305 2.77258 28.6054 3.14745L30.0196 1.73323C29.2771 0.990677 28.3566 0.602272 27.3097 0.602272V2.60227ZM28.6115 3.15347C28.9809 3.5166 29.1506 3.92334 29.1506 4.42898H31.1506C31.1506 3.38159 30.7616 2.46256 30.0135 1.72722L28.6115 3.15347ZM29.1506 4.42898C29.1506 4.77052 29.0663 5.06823 28.8986 5.34369L30.607 6.38358C30.9697 5.78783 31.1506 5.1291 31.1506 4.42898H29.1506ZM28.8953 5.34914C28.7241 5.63453 28.501 5.85764 28.2156 6.02887L29.2446 7.74386C29.8115 7.40372 30.2702 6.94502 30.6103 6.37813L28.8953 5.34914ZM28.2156 6.02887C27.9525 6.18673 27.6583 6.26989 27.3097 6.26989V8.26989C28.0026 8.26989 28.6554 8.09736 29.2446 7.74386L28.2156 6.02887Z"
                                  fill="white"
                                  mask="url(#path-1-outside-1_6231_8791)"
                                />
                              </svg>
                            </IconButton>
                          </MenuHandler>
                          <MenuList className="z-50 border-0 shadow-lg">
                            {actions.map((action) => (
                              <MenuItem
                                key={action.label}
                                onClick={() => action.onClick(row)}
                                className={`hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 ${
                                  action.className ? action.className : ""
                                }`}
                              >
                                {typeof action.label === "function"
                                  ? action.label(row)
                                  : action.label}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </Menu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔢 Professional Pagination with search state management */}
      {totalPages > 1 && onPageChange && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-4">
          <div className="text-sm text-gray-600">
            {(debouncedSearchTerm && !disableInternalSearch) ||
            (disableInternalSearch && searchQuery) ? (
              <span>
                Showing {filteredData.length} filtered result
                {filteredData.length !== 1 ? "s" : ""}
                {(allData || data || []).length > 0 &&
                  ` of ${(allData || data || []).length} total`}
              </span>
            ) : (
              <span>
                Page {currentPage} of {totalPages} (
                {(allData || data || []).length} total records)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={
                currentPage === 1 ||
                (debouncedSearchTerm && !disableInternalSearch) ||
                (disableInternalSearch && searchQuery)
              }
              className="px-4 py-2 rounded-sm bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              Previous
            </button>

            {!(
              (debouncedSearchTerm && !disableInternalSearch) ||
              (disableInternalSearch && searchQuery)
            ) && (
              <span className="px-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={
                currentPage === totalPages ||
                (debouncedSearchTerm && !disableInternalSearch) ||
                (disableInternalSearch && searchQuery)
              }
              className="px-4 py-2 rounded-sm bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              Next
            </button>

            {debouncedSearchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 rounded-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

Table.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.node,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
    }),
  ).isRequired,
  data: PropTypes.array.isRequired,
  allData: PropTypes.array,
  exportData: PropTypes.bool,
  isLoading: PropTypes.bool,
  hasNumber: PropTypes.bool,
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
  disableInternalSearch: PropTypes.bool,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  onAdd: PropTypes.func,
  addButtonText: PropTypes.string,
};

export default Table;
