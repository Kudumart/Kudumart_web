import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCountrySelect } from "../../store/clientStore";

const SearchBar = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("FILTER");

  const filters = ["All", "Name", "Category", "Price"];

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();
  const country = useCountrySelect();

  const onSubmit = (data) => {
    window.location.href = `/catalog?q=${encodeURIComponent(data.search)}`;
  };

  return (
    <div className="flex items-center w-full max-w-full md:max-w-sm lg:max-w-md rounded-full overflow-hidden bg-[#FFF2EA] relative">
      {/* Search Input */}
      <form className="flex w-full" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          {...register("search", {
            required: "Please enter a search term", // Validation rule
          })}
          placeholder="Search for an item or product"
          className="flex-1 py-3 px-4 text-sm text-black bg-[#FFF2EA] outline-hidden min-w-0"
        />

        {/* Filter Button & Dropdown
      <div className="relative z-50 shrink-0">
        <Menu>
          <MenuHandler>
            <button
              className="bg-white px-3 sm:px-4 mr-2 sm:mr-4 py-1 text-xs font-sm rounded-full flex items-center gap-1"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              {selectedFilter}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </button>
          </MenuHandler>
          <MenuList>
            {/* Dropdown Menu *
            <div className="w-48 z-9999 outline-hidden">
              {filters.map((filter, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm text-black hover:bg-gray-200"
                  onClick={() => {
                    setSelectedFilter(filter);
                    setFilterOpen(false);
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </MenuList>
        </Menu>
      </div>*/}

        {/* Search Button */}
        <button
          type="submit"
          className="bg-kudu-orange text-white py-2 px-3 sm:py-3 sm:px-2 text-sm flex items-center justify-center shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-4 h-4 sm:w-5 sm:h-5"
          >
            <path d="M10 2a8 8 0 105.293 13.707l4.998 4.998a1 1 0 101.414-1.414l-4.998-4.998A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
