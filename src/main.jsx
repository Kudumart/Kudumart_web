import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AppOverlays } from './components/ui';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import Storefront from './pages/Storefront';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Account from './pages/Account';
import AccountSettings from './pages/AccountSettings';
import Saved from './pages/Saved';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Offers from './pages/Offers';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import ServiceBookings from './pages/ServiceBookings';
import Discovery from './pages/Discovery';
import DiscoveryDetail from './pages/DiscoveryDetail';
import PasswordRecovery from './pages/PasswordRecovery';
import EmailVerification from './pages/EmailVerification';
import SellerLayout from './pages/seller/SellerLayout';
import { SellerOverview, SellerProducts, SellerOrders, SellerOrderDetail, SellerOffers, SellerStores } from './pages/seller/SellerPages';
import { SellerProductForm, SellerStoreForm } from './pages/seller/SellerForms';
import SellerVerification from './pages/seller/SellerVerification';
import SellerFinance from './pages/seller/SellerFinance';
import SellerSubscriptions from './pages/seller/SellerSubscriptions';
import { SellerServices, SellerServiceForm } from './pages/seller/SellerServices';
import { SellerAdverts, SellerAdvertForm } from './pages/seller/SellerAdverts';
import { SellerAuctions, SellerAuctionForm, SellerAuctionBids } from './pages/seller/SellerAuctions';
import { AdminCategories, AdminLayout, AdminLogin, AdminOrderDetail, AdminOrders, AdminOverview, AdminList, AdminProductDetail, AdminProducts, AdminSubscriptions, AdminTransactions, AdminVendorDetail, AdminVerification, AdminWithdrawals } from './pages/admin/Admin';
import { AdminAdverts, AdminAuctions, AdminServices, AdminStores } from './pages/admin/AdminOperations';
import { AdminAccess, AdminServiceTaxonomy } from './pages/admin/AdminGovernance';
import './styles/index.css';

function App() {
  return <AppProvider><BrowserRouter><Routes>
    <Route element={<Layout/>}>
      <Route index element={<Home/>}/>
      <Route path="catalog" element={<Catalog/>}/>
      <Route path="product/:id" element={<Product/>}/>
      <Route path="store/:vendorId" element={<Storefront/>}/>
      <Route path="cart" element={<Cart/>}/>
      <Route path="login" element={<Auth mode="login"/>}/>
      <Route path="register" element={<Auth mode="register"/>}/>
      <Route path="forgot-password" element={<PasswordRecovery/>}/>
      <Route path="forget" element={<Navigate to="/forgot-password" replace/>}/>
      <Route path="verify-email" element={<EmailVerification/>}/>
      <Route element={<RequireAuth/>}>
        <Route path="checkout" element={<Checkout/>}/>
        <Route path="account" element={<Account/>}/>
        <Route path="account/settings" element={<AccountSettings/>}/>
        <Route path="account/orders" element={<Orders/>}/>
        <Route path="account/orders/:id" element={<Orders detail/>}/>
        <Route path="account/offers" element={<Offers/>}/>
        <Route path="account/notifications" element={<Notifications/>}/>
        <Route path="account/messages" element={<Messages/>}/>
        <Route path="account/services" element={<ServiceBookings/>}/>
      </Route>
      <Route path="saved" element={<Saved/>}/>
      <Route path="auctions" element={<Discovery type="auctions"/>}/>
      <Route path="services" element={<Discovery type="services"/>}/>
      <Route path="auction/product/:id" element={<DiscoveryDetail type="auction"/>}/>
      <Route path="services/:id" element={<DiscoveryDetail type="service"/>}/>
      <Route path="*" element={<Catalog/>}/>
    </Route>
    <Route path="seller" element={<SellerLayout/>}>
      <Route index element={<SellerOverview/>}/>
      <Route path="products" element={<SellerProducts/>}/>
      <Route path="products/new" element={<SellerProductForm/>}/>
      <Route path="products/:id" element={<SellerProductForm/>}/>
      <Route path="auctions" element={<SellerAuctions/>}/>
      <Route path="auctions/new" element={<SellerAuctionForm/>}/>
      <Route path="auctions/:id/edit" element={<SellerAuctionForm/>}/>
      <Route path="auctions/:id/bids" element={<SellerAuctionBids/>}/>
      <Route path="orders" element={<SellerOrders/>}/>
      <Route path="orders/:id" element={<SellerOrderDetail/>}/>
      <Route path="offers" element={<SellerOffers/>}/>
      <Route path="stores" element={<SellerStores/>}/>
      <Route path="stores/new" element={<SellerStoreForm/>}/>
      <Route path="stores/:id" element={<SellerStoreForm/>}/>
      <Route path="services" element={<SellerServices/>}/>
      <Route path="services/new" element={<SellerServiceForm/>}/>
      <Route path="services/:id" element={<SellerServiceForm/>}/>
      <Route path="adverts" element={<SellerAdverts/>}/>
      <Route path="adverts/new" element={<SellerAdvertForm/>}/>
      <Route path="adverts/:id" element={<SellerAdvertForm/>}/>
      <Route path="verification" element={<SellerVerification/>}/>
      <Route path="finance" element={<SellerFinance/>}/>
      <Route path="subscriptions" element={<SellerSubscriptions/>}/>
    </Route>
    <Route path="auth/admin/login" element={<AdminLogin/>}/>
    <Route path="admin/login" element={<Navigate to="/auth/admin/login" replace/>}/>
    <Route path="admin" element={<AdminLayout/>}>
      <Route index element={<AdminOverview/>}/>
      <Route path="vendors" element={<AdminList kind="vendors"/>}/>
      <Route path="vendors/:vendorId" element={<AdminVendorDetail/>}/>
      <Route path="subscriptions" element={<AdminSubscriptions/>}/>
      <Route path="customers" element={<AdminList kind="customers"/>}/>
      <Route path="products" element={<AdminProducts/>}/>
      <Route path="categories" element={<AdminCategories/>}/>
      <Route path="stores" element={<AdminStores/>}/>
      <Route path="auctions" element={<AdminAuctions/>}/>
      <Route path="adverts" element={<AdminAdverts/>}/>
      <Route path="services" element={<AdminServices/>}/>
      <Route path="service-taxonomy" element={<AdminServiceTaxonomy/>}/>
      <Route path="access" element={<AdminAccess/>}/>
      <Route path="products/:productId" element={<AdminProductDetail/>}/>
      <Route path="orders" element={<AdminOrders/>}/>
      <Route path="orders/:orderId" element={<AdminOrderDetail/>}/>
      <Route path="transactions" element={<AdminTransactions/>}/>
      <Route path="withdrawals" element={<AdminWithdrawals/>}/>
      <Route path="verification" element={<AdminVerification/>}/>
    </Route>
  </Routes><AppOverlays/></BrowserRouter></AppProvider>;
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_LOGIN || '';
const root = <React.StrictMode><App/></React.StrictMode>;
createRoot(document.getElementById('root')).render(googleClientId ? <GoogleOAuthProvider clientId={googleClientId}>{root}</GoogleOAuthProvider> : root);
