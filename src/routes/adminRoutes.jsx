import React from "react";
import AdminLayout from "../layouts/admin/index.jsx";
import AdminRouteGuard from "../components/AdminRouteGuard.jsx";
import Dashboard from "../modules/SuperAdmin/Dashboard/index.jsx";
import Users from "../modules/SuperAdmin/Dashboard/users.jsx";
import Vendors from "../modules/SuperAdmin/Dashboard/vendors.jsx";
import Products from "../modules/SuperAdmin/Dashboard/productsA.jsx";
import MyProducts from "../modules/SuperAdmin/Dashboard/myProducts.jsx";
import Subscription from "../modules/SuperAdmin/Dashboard/subscriptions.jsx";
import Orders from "../modules/SuperAdmin/Dashboard/order.jsx";
import Transactions from "../modules/SuperAdmin/Dashboard/transactions.jsx";
import CreateSubscription from "../modules/SuperAdmin/Dashboard/createSubscription.jsx";
import ProductCategories from "../modules/SuperAdmin/Dashboard/productCategories.jsx";
import AddProductCategory from "../modules/SuperAdmin/Dashboard/addProductCategory.jsx";
import Settings from "../modules/SuperAdmin/Dashboard/settings.jsx";
import SubLevel from "../modules/SuperAdmin/Dashboard/sublevel.jsx";
import AdminAdverts from "../modules/SuperAdmin/Dashboard/adverts.jsx";
import PostNewAdvert from "../modules/SuperAdmin/Dashboard/postadverts.jsx";
import AllStores from "../modules/SuperAdmin/Dashboard/stores.jsx";
import MyStores from "../modules/SuperAdmin/Dashboard/mystores.jsx";
import AddNewStore from "../modules/SuperAdmin/Dashboard/newStore.jsx";
import AddNewProduct from "../modules/SuperAdmin/Dashboard/newProduct.jsx";
import AddProductSubCategory from "../modules/SuperAdmin/Dashboard/addProductSubCategory.jsx";
import ProductSubCategories from "../modules/SuperAdmin/Dashboard/viewProductSubCategory.jsx";
import UpdateProductSubCategory from "../modules/SuperAdmin/Dashboard/updateSubCategory.jsx";
import UpdateStore from "../modules/SuperAdmin/Dashboard/updateStore.jsx";
import UpdateProductCategory from "../modules/SuperAdmin/Dashboard/updateProductCategory.jsx";
import UpdateProduct from "../modules/SuperAdmin/Dashboard/updateProducts.jsx";
import UpdateAdvert from "../modules/SuperAdmin/Dashboard/updateNewAdvert.jsx";
import ViewKYC from "../modules/SuperAdmin/Dashboard/viewKyc.jsx";
import EditSubscription from "../modules/SuperAdmin/Dashboard/editSubscription.jsx";
import FaqCategory from "../modules/SuperAdmin/Dashboard/inner-pages/faqs-category.jsx";
import Faqs from "../modules/SuperAdmin/Dashboard/inner-pages/faqs.jsx";
import Testimonials from "../modules/SuperAdmin/Dashboard/inner-pages/testimonials.jsx";
import AuctionProducts from "../modules/SuperAdmin/Dashboard/auctionProducts.jsx";
import AddNewAuctionProduct from "../modules/SuperAdmin/Dashboard/addAuctionProduct.jsx";
import Jobs from "../modules/SuperAdmin/Dashboard/jobs.jsx";
import UpdateAuctionProducts from "../modules/SuperAdmin/Dashboard/updateAuctionProducts.jsx";
import CustomerOrders from "../modules/SuperAdmin/Dashboard/customerOrders.jsx";
import OrderDetails from "../modules/SuperAdmin/Dashboard/ViewOrders.jsx";
import WithdrawalRequest from "../modules/SuperAdmin/Dashboard/withdrawalRequest.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import JobApplicants from "../modules/SuperAdmin/Dashboard/jobsApplicants.jsx";
import UserInquiries from "../modules/SuperAdmin/Dashboard/userInquiries.jsx";
import SubAdmins from "../modules/SuperAdmin/Dashboard/SubAdmins.jsx";
import AdminRoles from "../modules/SuperAdmin/Dashboard/AdminRoles.jsx";
import CreateSubAdmin from "../modules/SuperAdmin/Dashboard/CreateSubAdmin.jsx";
import CreateRole from "../modules/SuperAdmin/Dashboard/CreateRole.jsx";
import Permissions from "../modules/SuperAdmin/Dashboard/Permissions.jsx";
import ServiceCategories from "../modules/SuperAdmin/Dashboard/serviceCategories.js";
import ServiceSubCategories from "../modules/SuperAdmin/Dashboard/services-sub-categories.js";
import AdminServices from "../modules/SuperAdmin/Dashboard/services.js";
import AdminViewService from "../modules/SuperAdmin/Dashboard/view-service.js";
import AdminNotifications from "../modules/SuperAdmin/Dashboard/admin-notifications.js";
import ViewServiceCategories from "../modules/SuperAdmin/Dashboard/view-service-category.js";
import AliExpressDropShip from "../modules/SuperAdmin/Dashboard/aliexpress/index.js";

export const adminRoutes = [
  {
    path: "/admin/*",
    element: (
      <AdminRouteGuard>
        <AdminLayout />
      </AdminRouteGuard>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "all-customers",
        element: <Users />,
      },
      {
        path: "all-vendors",
        element: <Vendors />,
      },
      {
        path: "products-sell",
        element: <Products />,
      },
      {
        path: "my-products",
        element: <MyProducts />,
      },
      {
        path: "my-products/edit/:id",
        element: <UpdateProduct />,
      },
      {
        path: "products-categories",
        element: <ProductCategories />,
      },
      {
        path: "products-categories/edit/:id",
        element: <UpdateProductCategory />,
      },
      {
        path: "products-categories/add-category",
        element: <AddProductCategory />,
      },
      {
        path: "products-categories/sub-category/create/:id",
        element: <AddProductSubCategory />,
      },
      {
        path: "products-categories/sub-category",
        element: <ProductSubCategories />,
      },
      {
        path: "products-categories/sub-category/update/:id",
        element: <UpdateProductSubCategory />,
      },
      {
        path: "subscriptions",
        element: <Subscription />,
      },
      {
        path: "subscriptions/create",
        element: <CreateSubscription />,
      },
      {
        path: "subscriptions/edit/:id",
        element: <EditSubscription />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "orders/orderDetails/general/:id",
        element: <OrderDetails />,
      },
      {
        path: "customer-orders",
        element: <CustomerOrders />,
      },
      {
        path: "customer-orders/order-details/:id",
        element: <OrderDetails />,
      },
      {
        path: "transactions",
        element: <Transactions />,
      },
      {
        path: "withdrawal-request",
        element: <WithdrawalRequest />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "sublevel",
        element: <SubLevel />,
      },
      {
        path: "adverts",
        element: <AdminAdverts />,
      },
      {
        path: "postadverts",
        element: <PostNewAdvert />,
      },
      {
        path: "adverts/edit/:id",
        element: <UpdateAdvert />,
      },
      {
        path: "all-stores",
        element: <AllStores />,
      },
      {
        path: "my-stores",
        element: <MyStores />,
      },
      {
        path: "my-stores/update/:id",
        element: <UpdateStore />,
      },
      {
        path: "new-stores",
        element: <AddNewStore />,
      },
      {
        path: "new-product",
        element: <AddNewProduct />,
      },
      {
        path: "auction-products",
        element: <AuctionProducts />,
      },
      {
        path: "auction-products/new-product",
        element: <AddNewAuctionProduct />,
      },
      {
        path: "auction-products/edit/:id",
        element: <UpdateAuctionProducts />,
      },
      {
        path: "all-vendors/kyc/:id",
        element: <ViewKYC />,
      },
      {
        path: "pages/faq-category",
        element: <FaqCategory />,
      },
      {
        path: "pages/faqs",
        element: <Faqs />,
      },
      {
        path: "notifications/",
        element: <AdminNotifications />,
      },
      {
        path: "pages/testimonials",
        element: <Testimonials />,
      },
      {
        path: "jobs",
        element: <Jobs />,
      },
      {
        path: "jobs/applicants/:id",
        element: <JobApplicants />,
      },
      {
        path: "user-inquiries",
        element: <UserInquiries />,
      },
      {
        path: "sub-admins",
        element: <SubAdmins />,
      },
      {
        path: "sub-admins/roles",
        element: <AdminRoles />,
      },
      {
        path: "sub-admins/create-role",
        element: <CreateRole />,
      },
      {
        path: "sub-admins/create",
        element: <CreateSubAdmin />,
      },
      {
        path: "services/categories",
        element: <ServiceCategories />,
      },
      {
        path: "services/categories/:id",
        element: <ViewServiceCategories />,
      },
      {
        path: "services/sub-category/:id",
        element: <ServiceSubCategories />,
      },
      {
        path: "services/",
        element: <AdminServices />,
      },
      {
        path: "services/:id",
        element: <AdminViewService />,
      },
      {
        path: "notifications",
        element: <AdminNotifications />,
      },
      // {
      //   path: "notifications/:id",
      //   element: <AdminViewNotification />,
      // },
      {
        path: "permissions",
        element: <Permissions />,
      },
      { path: "aliexpress", element: <AliExpressDropShip /> },
    ],
  },
];
