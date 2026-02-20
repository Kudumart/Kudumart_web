import { useEffect, useState } from "react";
import useAppState from "../../../hooks/appState";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Loader from "../../../components/Loader";
import { useNavigate } from "react-router-dom";
import VendorMyOrdersTable from "../../../components/VendorMyOrdersTable";
import VendorCustomerOrdersTable from "../../../components/VendorCustomerOrdersTable";

export default function ProfileOrders() {
  const [activeTab, setActiveTab] = useState("my orders");
  const [loader, setLoader] = useState(true);
  const [orders, setOrders] = useState([]);
  const [vendorOrder, setVendorOrders] = useState([]);

  const { user } = useAppState();

  const { mutate } = useApiMutation();

  const navigate = useNavigate();

  const getOrders = () => {
    setLoader(true);
    mutate({
      url: `user/orders`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setOrders(response.data.data);
        setLoader(false);
      },
      onError: (error) => {
        setLoader(false);
        setOrders([]);
      },
    });
  };

  const vendorOrders = () => {
    setLoader(true);
    mutate({
      url: `vendor/order/items`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setVendorOrders(response.data.data);
        setLoader(false);
      },
      onError: (error) => {
        setLoader(false);
        setVendorOrders([]);
      },
    });
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <>
      <div className="bg-white rounded-lg w-full shadow">
        <h2 className="text-lg font-bold p-6">Orders</h2>
        <div className="w-full h-px border" />
        <div className="mt-5">
          <div className="flex border-b w-full justify-between px-4 text-xs sm:text-sm">
            <button
              className={`p-2 sm:p-3 font-semibold ${
                activeTab === "my orders"
                  ? "text-[#FE6A3A] border-b-2 border-[#FE6A3A]"
                  : "text-black"
              }`}
              onClick={() => [setActiveTab("my orders"), getOrders()]}
            >
              MY ORDERS
            </button>
            {user.accountType === "Vendor" && (
              <button
                className={`p-2 sm:p-3 font-semibold ml-2 sm:ml-4 ${
                  activeTab === "customer orders"
                    ? "text-[#FE6A3A] border-b-2 border-[#FE6A3A]"
                    : "text-black"
                }`}
                onClick={() => [
                  setActiveTab("customer orders"),
                  vendorOrders(),
                ]}
              >
                CUSTOMER'S ORDERS
              </button>
            )}
          </div>

          {loader && (
            <div className="w-full h-screen flex items-center justify-center">
              <Loader />
            </div>
          )}

          {activeTab === "my orders" ? (
            <VendorMyOrdersTable
              data={orders}
              loading={loader}
              onViewOrder={(orderId) => navigate(`order-details/${orderId}`)}
            />
          ) : null}

          {activeTab === "customer orders" ? (
            <VendorCustomerOrdersTable
              data={vendorOrder}
              loading={loader}
              onViewOrder={(orderId) => navigate(`order-details/${orderId}`)}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
