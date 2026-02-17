import React from "react";
import { useState } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loader from "../../../components/Loader";
import { dateFormat } from "../../../helpers/dateHelper";
import { LuArrowLeft } from "react-icons/lu";
import TrackOrder from "../../../components/TrackOrder";
import Table from "../../../components/Tables";

const OrderDetails = () => {
  const navigate = useNavigate();
  const url = useLocation();

  const general = url.pathname.includes("general");

  const { id } = useParams();

  const [orderDetails, setOrderDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { mutate } = useApiMutation();

  useEffect(() => {
    getOrderDetails();
  }, []);

  const getOrderDetails = () => {
    const base_URL = general
      ? `/admin/general/order/items?orderId=${id}`
      : `/admin/order/item?orderItemId=${id}`;
    setIsLoading(true);
    mutate({
      url: base_URL,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setOrderDetails(general ? response.data.data : [response.data.data]);
        setIsLoading(false);
      },
      onError: (error) => {
        setIsLoading(false);
      },
    });
  };

  const handleRefetch = () => {
    getOrderDetails();
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const isVendorType = true;

  return (
    <div className="w-full flex-col gap-5 flex">
      <div className="All flex flex-col gap-6">
        <div className="rounded-md pb-2 w-full gap-5">
          <h2 className="text-lg font-semibold text-black-700 mt-4">
            {general ? "Order Details" : "Customer's Orders"}{" "}
          </h2>
        </div>
        <div className="w-full flex flex-col md:flex-row justify-between gap-6">
          {!general && (
            <Table
              headers={[
                { key: "refId", label: "Order ID" },
                { key: "trackingNumber", label: "Tracking Number" },
                { key: "totalAmount", label: "Price" },
                { key: "userName", label: "Customer's Name" },
                { key: "vendorOrStore", label: "Store Name" },
                {
                  key: "createdAt",
                  label: "Date",
                  render: (value) => dateFormat(value, "dd-MM-yyyy"),
                },
                { key: "shippingAddress", label: "Shipping Address" },
              ]}
              data={orderDetails}
              transformData={(orderDetails) =>
                orderDetails.map((item) => ({
                  ...item,
                  refId: item.order.refId,
                  trackingNumber: item.order.trackingNumber,
                  totalAmount: item.order.totalAmount,
                  userName: `${item.order.user.firstName} ${item.order.user.lastName}`,
                  shippingAddress: item.order.shippingAddress,
                  vendorOrStore: item.vendor
                    ? `${item.vendor?.firstName} ${item.vendor?.lastName}`
                    : item.product.store?.name || "Administrator",
                }))
              }
              actions={[]}
              currentPage={null}
              totalPages={null}
            />
          )}

          {general && (
            <Table
              headers={[
                { key: "productName", label: "Product Name" },
                { key: "sku", label: "Product ID" },
                { key: "quantity", label: "Quantity" },
                { key: "vendorOrStore", label: "Vendor/Store" }, // Changed label to be more general
                { key: "price", label: "Price" },
                {
                  key: "status",
                  label: "Status",
                  render: (value) => (
                    <span
                      className={`py-1 px-3 rounded-full text-sm capitalize ${
                        value === "delivered"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {value}
                    </span>
                  ),
                },
                {
                  key: "createdAt",
                  label: "Date",
                  render: (value) => dateFormat(value, "dd-MM-yyyy"),
                },
              ]}
              data={orderDetails}
              transformData={(orderDetails) =>
                orderDetails.map((item) => ({
                  ...item,
                  sku: item.product.sku,
                  productName: `${item.product?.name}`,
                  productImage: `${item.product.image_url}`,
                  vendorOrStore: item.vendor
                    ? `${item.vendor?.firstName} ${item.vendor?.lastName}`
                    : item.product.store?.name || "Administrator", // Added store name fallback
                }))
              }
              actions={[]}
              currentPage={null}
              totalPages={null}
            />
          )}
        </div>

        {!general && (
          <TrackOrder
            userType={isVendorType}
            admin
            orderId={orderDetails[0].id}
            status={orderDetails[0].status}
            refetch={handleRefetch}
          />
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
