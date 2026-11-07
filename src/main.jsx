import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { AppOverlays } from "./components/ui";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Storefront from "./pages/Storefront";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import AccountSettings from "./pages/AccountSettings";
import Saved from "./pages/Saved";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Offers from "./pages/Offers";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import ServiceBookings from "./pages/ServiceBookings";
import AuctionInterests from "./pages/AuctionInterests";
import Discovery from "./pages/Discovery";
import DiscoveryDetail from "./pages/DiscoveryDetail";
import PasswordRecovery from "./pages/PasswordRecovery";
import EmailVerification from "./pages/EmailVerification";
import {
  AdvertiseWithUs,
  Careers,
  Contact,
  ContentPage,
  DownloadApp,
  Faqs,
  JobDetail,
  NotFound,
  Testimonials,
} from "./pages/PublicPages";
import SellerLayout from "./pages/seller/SellerLayout";
import {
  SellerOverview,
  SellerProducts,
  SellerOrders,
  SellerOrderDetail,
  SellerOffers,
  SellerStores,
} from "./pages/seller/SellerPages";
import { SellerProductForm, SellerStoreForm } from "./pages/seller/SellerForms";
import SellerVerification from "./pages/seller/SellerVerification";
import SellerFinance from "./pages/seller/SellerFinance";
import SellerSubscriptions from "./pages/seller/SellerSubscriptions";
import {
  SellerServices,
  SellerServiceForm,
} from "./pages/seller/SellerServices";
import { SellerAdverts, SellerAdvertForm } from "./pages/seller/SellerAdverts";
import {
  SellerAuctions,
  SellerAuctionForm,
  SellerAuctionBids,
} from "./pages/seller/SellerAuctions";
import {
  AdminCategories,
  AdminLayout,
  AdminLogin,
  AdminOrderDetail,
  AdminOrders,
  AdminOverview,
  AdminList,
  AdminProductDetail,
  AdminProducts,
  AdminSubscriptions,
  AdminTransactions,
  AdminVendorDetail,
  AdminVerification,
  AdminWithdrawals,
} from "./pages/admin/Admin";
import "./styles/index.css";
import "./styles/specialists.css";

const AdminStores = lazy(() =>
  import("./pages/admin/AdminOperations").then((module) => ({
    default: module.AdminStores,
  })),
);
const AdminAuctions = lazy(() =>
  import("./pages/admin/AdminOperations").then((module) => ({
    default: module.AdminAuctions,
  })),
);
const AdminAuctionMonitor = lazy(() =>
  import("./pages/admin/AdminOperations").then((module) => ({
    default: module.AdminAuctionMonitor,
  })),
);
const AdminAdverts = lazy(() =>
  import("./pages/admin/AdminOperations").then((module) => ({
    default: module.AdminAdverts,
  })),
);
const AdminServices = lazy(() =>
  import("./pages/admin/AdminOperations").then((module) => ({
    default: module.AdminServices,
  })),
);
const AdminServiceTaxonomy = lazy(() =>
  import("./pages/admin/AdminGovernance").then((module) => ({
    default: module.AdminServiceTaxonomy,
  })),
);
const AdminAccess = lazy(() =>
  import("./pages/admin/AdminGovernance").then((module) => ({
    default: module.AdminAccess,
  })),
);
const AdminReports = lazy(() =>
  import("./pages/admin/AdminInsights").then((module) => ({
    default: module.AdminReports,
  })),
);
const AdminNotifications = lazy(() =>
  import("./pages/admin/AdminInsights").then((module) => ({
    default: module.AdminNotifications,
  })),
);
const AdminContent = lazy(() =>
  import("./pages/admin/AdminContent").then((module) => ({
    default: module.AdminContent,
  })),
);
const AdminConfiguration = lazy(() =>
  import("./pages/admin/AdminContent").then((module) => ({
    default: module.AdminConfiguration,
  })),
);
const AdminPaymentGateways = lazy(() =>
  import("./pages/admin/AdminSpecialists").then((module) => ({
    default: module.AdminPaymentGateways,
  })),
);
const AdminSettings = lazy(() =>
  import("./pages/admin/AdminSettings").then((module) => ({
    default: module.AdminSettings,
  })),
);
const AdminDropshipping = lazy(() =>
  import("./pages/admin/AdminSpecialists").then((module) => ({
    default: module.AdminDropshipping,
  })),
);
const AdminOffers = lazy(() =>
  import("./pages/admin/AdminOffers").then((module) => ({
    default: module.AdminOffers,
  })),
);
const AliExpressCallback = lazy(() =>
  import("./pages/admin/AdminSpecialists").then((module) => ({
    default: module.AliExpressCallback,
  })),
);
const deferred = (element) => (
  <Suspense
    fallback={
      <div className="admin-route-loading" aria-label="Loading page">
        <span className="spinner" />
      </div>
    }
  >
    {element}
  </Suspense>
);
const LegacyProduct = () => (
  <Navigate to={`/product/${useParams().id}`} replace />
);
const LegacyAuction = () => (
  <Navigate to={`/auction/product/${useParams().id}`} replace />
);
const LegacyStore = () => (
  <Navigate to={`/store/${useParams().vendorId}`} replace />
);
const LegacyCategory = () => (
  <Navigate to={`/catalog?categoryId=${useParams().id}`} replace />
);

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="product/:id" element={<Product />} />
            <Route path="store/:vendorId" element={<Storefront />} />
            <Route path="cart" element={<Cart />} />
            <Route path="login" element={<Auth mode="login" />} />
            <Route path="register" element={<Auth mode="register" />} />
            <Route path="forgot-password" element={<PasswordRecovery />} />
            <Route
              path="forget"
              element={<Navigate to="/forgot-password" replace />}
            />
            <Route path="verify-email" element={<EmailVerification />} />
            <Route
              path="reconnect"
              element={
                <Suspense fallback={<div className="admin-route-loading"><span className="spinner" /></div>}>
                  <AliExpressCallback />
                </Suspense>
              }
            />
            <Route element={<RequireAuth />}>
              <Route path="checkout" element={<Checkout />} />
              <Route path="account" element={<Account />} />
              <Route path="account/settings" element={<AccountSettings />} />
              <Route path="account/orders" element={<Orders />} />
              <Route path="account/orders/:id" element={<Orders detail />} />
              <Route path="account/offers" element={<Offers />} />
              <Route path="account/notifications" element={<Notifications />} />
              <Route path="account/messages" element={<Messages />} />
              <Route path="account/services" element={<ServiceBookings />} />
              <Route path="account/auctions" element={<AuctionInterests />} />
            </Route>
            <Route path="saved" element={<Saved />} />
            <Route path="auctions" element={<Discovery type="auctions" />} />
            <Route path="services" element={<Discovery type="services" />} />
            <Route
              path="auction/product/:id"
              element={<DiscoveryDetail type="auction" />}
            />
            <Route
              path="services/:id"
              element={<DiscoveryDetail type="service" />}
            />
            <Route path="about" element={<ContentPage kind="about" />} />
            <Route path="contact" element={<Contact />} />
            <Route path="faqs" element={<Faqs />} />
            <Route path="privacy" element={<ContentPage kind="privacy" />} />
            <Route
              path="terms-condition"
              element={<ContentPage kind="terms" />}
            />
            <Route
              path="cookie-policy"
              element={<ContentPage kind="cookies" />}
            />
            <Route
              path="return-policy"
              element={<ContentPage kind="returns" />}
            />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="download-app" element={<DownloadApp />} />
            <Route path="advertise-with-us" element={<AdvertiseWithUs />} />
            <Route
              path="become-a-vendor"
              element={<Navigate to="/register?type=Vendor" replace />}
            />
            <Route
              path="sign-up"
              element={<Navigate to="/register" replace />}
            />
            <Route path="product-dropship/:id" element={<LegacyProduct />} />
            <Route
              path="products/categories/:id/:name"
              element={<LegacyCategory />}
            />
            <Route path="store/:vendorId/products" element={<LegacyStore />} />
            <Route
              path="messages"
              element={<Navigate to="/account/messages" replace />}
            />
            <Route
              path="notification"
              element={<Navigate to="/account/notifications" replace />}
            />
            <Route
              path="profile"
              element={<Navigate to="/account" replace />}
            />
            <Route
              path="profile/orders"
              element={<Navigate to="/account/orders" replace />}
            />
            <Route
              path="profile/interestedAuctions"
              element={<Navigate to="/account/auctions" replace />}
            />
            <Route
              path="settings/profile"
              element={<Navigate to="/account/settings" replace />}
            />
            <Route
              path="settings/security"
              element={<Navigate to="/account/settings" replace />}
            />
            <Route
              path="settings/delete-account"
              element={<Navigate to="/account/settings" replace />}
            />
            <Route
              path="auction"
              element={<Navigate to="/auctions" replace />}
            />
            <Route
              path="auction/all-auctions"
              element={<Navigate to="/auctions" replace />}
            />
            <Route
              path="auction/product/monitor/:id"
              element={<LegacyAuction />}
            />
            <Route path="careers" element={<Careers />} />
            <Route path="careers/:jobId" element={<JobDetail />} />
            <Route path="career" element={<Navigate to="/careers" replace />} />
            <Route path="jobs-details/:jobId" element={<JobDetail />} />
            <Route
              path="testimonial"
              element={<Navigate to="/testimonials" replace />}
            />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="seller" element={<SellerLayout />}>
            <Route index element={<SellerOverview />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="products/new" element={<SellerProductForm />} />
            <Route path="products/:id" element={<SellerProductForm />} />
            <Route path="auctions" element={<SellerAuctions />} />
            <Route path="auctions/new" element={<SellerAuctionForm />} />
            <Route path="auctions/:id/edit" element={<SellerAuctionForm />} />
            <Route path="auctions/:id/bids" element={<SellerAuctionBids />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="orders/:id" element={<SellerOrderDetail />} />
            <Route path="offers" element={<SellerOffers />} />
            <Route path="stores" element={<SellerStores />} />
            <Route path="stores/new" element={<SellerStoreForm />} />
            <Route path="stores/:id" element={<SellerStoreForm />} />
            <Route path="services" element={<SellerServices />} />
            <Route path="services/new" element={<SellerServiceForm />} />
            <Route path="services/:id" element={<SellerServiceForm />} />
            <Route path="adverts" element={<SellerAdverts />} />
            <Route path="adverts/new" element={<SellerAdvertForm />} />
            <Route path="adverts/:id" element={<SellerAdvertForm />} />
            <Route path="verification" element={<SellerVerification />} />
            <Route path="finance" element={<SellerFinance />} />
            <Route path="subscriptions" element={<SellerSubscriptions />} />
          </Route>
          <Route path="auth/admin/login" element={<AdminLogin />} />
          <Route
            path="admin/login"
            element={<Navigate to="/auth/admin/login" replace />}
          />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="vendors" element={<AdminList kind="vendors" />} />
            <Route path="vendors/:vendorId" element={<AdminVendorDetail />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="customers" element={<AdminList kind="customers" />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="stores" element={deferred(<AdminStores />)} />
            <Route path="auctions" element={deferred(<AdminAuctions />)} />
            <Route
              path="auctions/:auctionId"
              element={deferred(<AdminAuctionMonitor />)}
            />
            <Route path="adverts" element={deferred(<AdminAdverts />)} />
            <Route path="services" element={deferred(<AdminServices />)} />
            <Route
              path="service-taxonomy"
              element={deferred(<AdminServiceTaxonomy />)}
            />
            <Route path="access" element={deferred(<AdminAccess />)} />
            <Route path="reports" element={deferred(<AdminReports />)} />
            <Route
              path="notifications"
              element={deferred(<AdminNotifications />)}
            />
            <Route path="content" element={deferred(<AdminContent />)} />
            <Route
              path="configuration"
              element={deferred(<AdminConfiguration />)}
            />
            <Route
              path="payment-gateways"
              element={deferred(<AdminPaymentGateways />)}
            />
            <Route path="settings" element={deferred(<AdminSettings />)} />
            <Route
              path="dropshipping"
              element={deferred(<AdminDropshipping />)}
            />
            <Route
              path="products/:productId"
              element={<AdminProductDetail />}
            />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:orderId" element={<AdminOrderDetail />} />
            <Route path="offers" element={deferred(<AdminOffers />)} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="verification" element={<AdminVerification />} />
          </Route>
        </Routes>
        <AppOverlays />
      </BrowserRouter>
    </AppProvider>
  );
}

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  import.meta.env.VITE_GOOGLE_LOGIN ||
  "";
const root = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
createRoot(document.getElementById("root")).render(
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{root}</GoogleOAuthProvider>
  ) : (
    root
  ),
);
