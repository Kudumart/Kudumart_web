import VendorLayout from "../layouts/vendor";
import Dashboard from "../modules/Vendor/Dashboard";
import VendorOrderDetails from "../modules/Vendor/modules/OrderDetails";

export const vendorRoutes = [
  {
    path: "/vendor",
    element: <VendorLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "orders/order-details/:id",
        element: <VendorOrderDetails />,
      },
    ],
  },
];
