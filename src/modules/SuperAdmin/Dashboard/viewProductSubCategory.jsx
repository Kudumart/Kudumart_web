import { useState } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Loader from "../../../components/Loader";
import { useEffect } from "react";
import ProductSubCategoriesTable from "../../../components/ProductSubCategoriesTable";

const ProductSubCategories = () => {
    const { mutate } = useApiMutation();
    const [categories, setCategoriesData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getCategories = () => {
        setLoading(true);
        // Fetch all sub categories
        mutate({
            url: `/admin/sub/categories?page=1&limit=100000`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                getParentCategories(response.data.data);
            },
            onError: () => {
                setLoading(false)
            }
        });
    }

    const getParentCategories = (subCategories) => {
        // Fetch parent categories to merge with sub categories
        mutate({
            url: `/admin/categories`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                mergedCategories(subCategories, response.data.data);
            },
            onError: () => {
                setLoading(false)
            }
        });
    }

    const mergedCategories = (subCategories, parentCategories) => {
        const merged = subCategories.map(subCategory => {
            const category = parentCategories.find(cat => cat.id === subCategory.categoryId);
            return {
                ...subCategory,
                categoryName: category ? category.name : "Unknown"
            };
        });
        
        setCategoriesData(merged);
        setLoading(false);
    }

    useEffect(() => {
        getCategories();
    }, []);

    return (
        <div className="min-h-screen overflow-hidden">
            {loading ?
                <div className="w-full h-screen flex items-center justify-center">
                    <Loader />
                </div>
                :
                <ProductSubCategoriesTable 
                    data={categories}
                    refetch={getCategories}
                    loading={loading}
                />
            }
        </div>
    );
};

export default ProductSubCategories;