import { useState, useEffect } from "react";
import useApiMutation from "../api/hooks/useApiMutation";
import {
  useGeoLocatorCurrency,
  useGeoLocatorProduct,
} from "../hooks/geoLocatorProduct";

const useFilteredProducts = (initialData, categoryId) => {
  const { mutate } = useApiMutation();
  const geoLocatedProducts = useGeoLocatorProduct(initialData);
  const currency = useGeoLocatorCurrency();

  const [filteredProducts, setFilteredProducts] = useState(geoLocatedProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [subCategoriesId, setSubCategoriesId] = useState("");
  const [values, setValues] = useState([0, 10000000]);

  const applyFilter = () => {
    setIsLoading(true);
    let queryParams = "?";

    if (categoryId) queryParams += `&categoryId=${categoryId}`;
    if (subCategoriesId)
      queryParams += `&subCategoryName=${subCategoriesId.toLowerCase()}`;
    queryParams += `&minPrice=${values[0]}&maxPrice=${values[1]}`;
    queryParams += `&symbol=${encodeURIComponent(currency[0].symbol)}`;

    mutate({
      url: `/products${queryParams}`,
      method: "GET",
      hideToast: true,
      onSuccess: (response) => {
        const geoFiltered = response.data.data;
        setFilteredProducts(geoFiltered);
        setIsLoading(false);
      },
      onError: () => setIsLoading(false),
    });
  };

  const clearFilter = () => {
    setIsLoading(true);
    setValues([0, 200000]);
    setSubCategoriesId("");
    let queryParams = "?";

    if (categoryId) queryParams += `&categoryId=${categoryId}`;
    queryParams += `&symbol=${encodeURIComponent(currency[0].symbol)}`;

    mutate({
      url: `/products${queryParams}`,
      method: "GET",
      hideToast: true,
      onSuccess: (response) => {
        const geoFiltered = response.data.data;
        setFilteredProducts(geoFiltered);
        setIsLoading(false);
      },
      onError: () => setIsLoading(false),
    });
  };

  return {
    filteredProducts,
    isLoading,
    applyFilter,
    clearFilter,
    values,
    setValues,
    subCategoriesId,
    setSubCategoriesId,
  };
};

export default useFilteredProducts;
