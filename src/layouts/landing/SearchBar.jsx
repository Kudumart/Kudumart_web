import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/apiFactory";
import { formatNumberWithCommas } from "../../helpers/helperFactory";
import { handleImageError } from "../../helpers/imageFallback";

const AUTOCOMPLETE_MIN_CHARS = 2;
const AUTOCOMPLETE_DEBOUNCE_MS = 250;

const highlightMatch = (text, term) => {
  if (!text) return text;
  if (!term) return text;

  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-kudu-orange/20 text-kudu-orange font-semibold rounded-sm">
        {text.slice(idx, idx + term.length)}
      </mark>
      {text.slice(idx + term.length)}
    </>
  );
};

const SearchBar = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { register, handleSubmit, setValue } = useForm();

  // Debounce the typed query before it drives the autocomplete request.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  const trimmedQuery = debouncedQuery.trim();

  const { data: suggestions = [] } = useQuery({
    queryKey: ["search-autocomplete", trimmedQuery],
    queryFn: async () => {
      const resp = await apiClient.get("/products/autocomplete", {
        params: { q: trimmedQuery },
      });
      return resp.data?.data || [];
    },
    enabled: trimmedQuery.length >= AUTOCOMPLETE_MIN_CHARS,
    staleTime: 30000,
  });

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  // Close the dropdown when clicking outside the search bar.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown =
    isOpen && trimmedQuery.length >= AUTOCOMPLETE_MIN_CHARS && suggestions.length > 0;

  const goToProduct = (product) => {
    setIsOpen(false);
    navigate(`/${product?.variants?.length > 0 ? "product-dropship" : "product"}/${product.id}`);
  };

  const onSubmit = (data) => {
    setIsOpen(false);
    navigate(`/catalog?q=${encodeURIComponent(data.search)}`);
  };

  const goToAllResults = () => {
    setIsOpen(false);
    navigate(`/catalog?q=${encodeURIComponent(trimmedQuery)}`);
  };

  // The "View all results" row is an extra, keyboard-navigable item appended
  // after the suggestions, so arrow keys can reach it too.
  const totalNavItems = suggestions.length + 1;
  const viewAllIndex = suggestions.length;

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % totalNavItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? totalNavItems - 1 : prev - 1));
    } else if (e.key === "Enter") {
      if (activeIndex === viewAllIndex) {
        e.preventDefault();
        goToAllResults();
      } else if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        goToProduct(suggestions[activeIndex]);
      }
      // Otherwise let the form's normal onSubmit (full search) handle Enter.
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center w-full max-w-full md:max-w-sm lg:max-w-md"
    >
      <form
        className="flex w-full rounded-full overflow-hidden bg-[#FFF2EA]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          type="text"
          {...register("search", {
            required: "Please enter a search term",
          })}
          placeholder="Search for an item or product"
          className="flex-1 py-3 px-4 text-sm text-black bg-[#FFF2EA] outline-hidden min-w-0"
          autoComplete="off"
          onChange={(e) => {
            setValue("search", e.target.value);
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-autocomplete-list"
        />

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

      {showDropdown && (
        <ul
          id="search-autocomplete-list"
          role="listbox"
          className="absolute top-full left-0 mt-2 w-full bg-white text-black rounded-lg shadow-xl border border-gray-100 overflow-hidden z-[9999] max-h-96 overflow-y-auto"
        >
          {suggestions.map((product, index) => {
            const price = parseFloat(product.price);
            const discountPrice = parseFloat(product.discount_price);
            const hasDiscount = discountPrice > 0 && discountPrice < price;
            const currencySymbol = product?.store?.currency?.symbol || "₦";

            return (
              <li
                key={product.id}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => {
                  // onMouseDown fires before the input's blur, so the click
                  // registers before the dropdown closes.
                  e.preventDefault();
                  goToProduct(product);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                  index === activeIndex ? "bg-kudu-light-blue" : "hover:bg-gray-50"
                }`}
              >
                <img
                  src={product.image_url || "https://picsum.photos/60"}
                  alt={product.name}
                  onError={handleImageError}
                  className="w-10 h-10 rounded-md object-cover shrink-0"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm truncate">
                    {highlightMatch(product.name, trimmedQuery)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {currencySymbol}{" "}
                    {formatNumberWithCommas(hasDiscount ? discountPrice : price)}
                  </span>
                </div>
                {product?.sub_category?.name && (
                  <span className="text-xs text-gray-400 shrink-0 px-2 py-1 bg-gray-50 rounded-full">
                    {product.sub_category.name}
                  </span>
                )}
              </li>
            );
          })}

          <li
            role="option"
            aria-selected={activeIndex === viewAllIndex}
            onMouseDown={(e) => {
              e.preventDefault();
              goToAllResults();
            }}
            onMouseEnter={() => setActiveIndex(viewAllIndex)}
            className={`px-4 py-3 text-sm font-semibold text-center text-kudu-orange border-t border-gray-100 cursor-pointer transition-colors ${
              activeIndex === viewAllIndex ? "bg-kudu-light-blue" : "hover:bg-gray-50"
            }`}
          >
            View all results for &quot;{trimmedQuery}&quot;
          </li>
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
