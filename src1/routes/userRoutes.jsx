import LandingLayout from "../layouts/landing";
import UserProfile from "../modules/User";
import ProfileOrders from "../modules/User/modules/orders";
import UpdatedKYC from "../modules/User/modules/kyc";
import Stores from "../modules/User/modules/stores";
import AccountProfile from "../modules/User/modules/profile";
import MyProducts from "../modules/User/modules/MyProducts";
import Subscription from "../modules/User/modules/subscriptions";
import OrderDetails from "../modules/User/modules/ViewOrders";
import VendorAdverts from "../modules/User/modules/VendorAdverts";
import Notification from "../modules/Notification/Notification";
import PostNewAdvert from "../modules/User/modules/AddNewAdvert";
import UpdateAdvert from "../modules/User/modules/UpdateAdvert";
// import OrderDetails from "../modules/orders/OrderDetails";
import AddNewProduct from "../modules/User/modules/AddNewProduct";
import AddNewAuctionProduct from "../modules/User/modules/AddNewAuctionProduct";
import UpdateProduct from "../modules/User/modules/UpdateProducts";
import UpdateAuctionProducts from "../modules/User/modules/UpdateAuctionProducts";
import AddNewStore from "../modules/User/modules/CreateNewStore";
import UpdateStore from "../modules/User/modules/UpdateStore";
import BookMarkedProducts from "../modules/User/modules/bookmark";
import Wallet from "../modules/User/modules/Wallet";
import AddBankAccount from "../modules/User/modules/AddBankAccount";
import EditBankAccount from "../modules/User/modules/EditBankAccount";
import InterestedAuctions from "../modules/User/modules/InterestedAuctions";
import ErrorBoundary from "../components/ErrorBoundary";
import VendorServices from "../modules/User/modules/vendor-services";
import VendorCreateService from "../modules/User/modules/vendor-services.create";
import { VendorViewService } from "../modules/User/modules/vendor-view-service";
import VendorEditService from "../modules/User/modules/vendor-edit-service";

export const userRoutes = [
  {
    path: "/",
    element: <LandingLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "profile",
        element: <UserProfile />,
        children: [
          {
            index: true,
            element: <AccountProfile />,
          },
          {
            path: "orders",
            element: <ProfileOrders />,
          },
          {
            path: "orders/order-details/:id",
            element: <OrderDetails />,
          },
          {
            path: "view-orders",
            element: <OrderDetails />,
          },
          {
            path: "updated-kyc",
            element: <UpdatedKYC />,
          },
          {
            path: "stores",
            element: <Stores />,
          },
          {
            path: "stores/create",
            element: <AddNewStore />,
          },
          {
            path: "stores/edit/:id",
            element: <UpdateStore />,
          },
          {
            path: "products",
            element: <MyProducts />,
          },
          {
            path: "products/create",
            element: <AddNewProduct />,
          },
          {
            path: "auction-products/create",
            element: <AddNewAuctionProduct />,
          },
          {
            path: "products/edit/:id",
            element: <UpdateProduct />,
          },
          {
            path: "auction-products/edit/:id",
            element: <UpdateAuctionProducts />,
          },
          {
            path: "adverts/create-advert",
            element: <PostNewAdvert />,
          },
          {
            path: "adverts/edit-advert/:id",
            element: <UpdateAdvert />,
          },
          {
            path: "subscription",
            element: <Subscription />,
          },
          {
            path: "bookmark",
            element: <BookMarkedProducts />,
          },
          {
            path: "interestedAuctions",
            element: <InterestedAuctions />,
          },
          {
            path: "wallet",
            element: <Wallet />,
          },
          {
            path: "wallet/add-account",
            element: <AddBankAccount />,
          },
          {
            path: "wallet/edit-account/:id",
            element: <EditBankAccount />,
          },
          {
            path: "adverts",
            element: <VendorAdverts />,
          },
          {
            path: "notification",
            element: <Notification />,
          },
          {
            path: "services",
            element: <VendorServices />,
          },
          {
            path: "services/create",
            element: <VendorCreateService />,
          },
          {
            path: "service/:id",
            element: <VendorViewService />,
          },
          {
            path: "service/edit/:id",
            element: <VendorEditService />,
          },
        ],
      },
    ],
  },
];
