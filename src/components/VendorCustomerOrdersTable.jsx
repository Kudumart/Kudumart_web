import React from "react";
import { dateFormat } from "../helpers/dateHelper";
import ReviewTable from "./ReviewTable";

const VendorCustomerOrdersTable = ({
  data = [],
  loading = false,
  onViewOrder,
}) => {
  const columns = [
    { key: "productName", label: "Product Name" },
    { key: "quantity", label: "Quantity" },
    { key: "customer", label: "Customer" },
    { key: "customerPhone", label: "Customer Phone Number" },
    { key: "shippingAddress", label: "Shipping Address" },
    { key: "price", label: "Price" },
    {
      key: "createdAt",
      label: "Date",
      render: (value) => dateFormat(value, "dd-MM-yyyy"),
    },
  ];

  const actions = [
    {
      label: () => "View Order",
      onClick: (row) => onViewOrder(row.orderId),
    },
  ];

  const transformedData = data.map((item) => ({
    ...item,
    productName: item.product?.name || "Unknown Product",
    productImage: item.product?.image_url || "",
    shippingAddress: item.order?.shippingAddress || "N/A",
    customer:
      `${item.order?.user?.firstName || ""} ${item.order?.user?.lastName || ""}`.trim() ||
      "Unknown Customer",
    customerPhone: item.order?.user?.phoneNumber || "N/A",
    price: item.price * item.quantity,
  }));

  return (
    <div className="w-full">
      {data.length > 0 ? (
        <ReviewTable
          title="Customer Orders"
          columns={columns}
          data={transformedData}
          allData={transformedData}
          exportData={true}
          isLoading={loading}
          hasNumber={true}
          actions={actions}
          currentPage={1}
          totalPages={1}
          onPageChange={null}
        />
      ) : (
        <div className="empty-store bg-white rounded-lg p-8">
          <div className="text-center">
            <img
              src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
              alt="Empty Store Illustration"
              className="w-80 h-80 mx-auto"
            />
          </div>
          <h1 className="text-center text-lg font-bold mb-4">
            No order items found!
          </h1>
        </div>
      )}
    </div>
  );
};

export default VendorCustomerOrdersTable;
