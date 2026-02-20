import { useState } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Loader from "../../../components/Loader";
import { useEffect } from "react";
import ProductCategoriesTable from "../../../components/ProductCategoriesTable";

const ProductCategories = () => {
    const { mutate } = useApiMutation();
    const [categories, setCategoriesData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getCategories = () => {
        mutate({
          url: `/admin/categories`,
          method: "GET",
          headers: true,
          hideToast: true,
          onSuccess: (response) => {
           setCategoriesData(response.data.data);
           setLoading(false);
          },
          onError: () => {
            setLoading(false)
          }
        });
      }
    
      useEffect(() => {
        getCategories();
      }, []);
    
      return (
        <div className="min-h-screen">
          {loading ?
            <div className="w-full h-screen flex items-center justify-center">
              <Loader />
            </div>
            :
            <ProductCategoriesTable 
              data={categories} 
              refetch={getCategories}
              loading={loading}
            />
          }
        </div>
      );
};

export default ProductCategories;