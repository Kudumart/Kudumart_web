import LandingLayout from "../layouts/landing";
import ViewProduct from "../modules/Products/viewProduct";
import CategoriesProduct from "../modules/Products/categoriesProduct";
import VendorStorefront from "../modules/Products/vendorStorefront";
import ErrorBoundary from "../components/ErrorBoundary";

export const productRoutes = [
    {
        path: '/',
        element: <LandingLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                path: 'product/:id',
                element: <ViewProduct />
            },
            {
                path: 'products/categories/:id/:name',
                element: <CategoriesProduct />
            },
            {
                path: 'store/:vendorId/products',
                element: <VendorStorefront />
            }
        ],
    },
];
