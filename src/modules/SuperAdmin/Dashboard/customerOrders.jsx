import React, { useEffect, useState } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Loader from "../../../components/Loader";
import Table from "../../../components/ReviewTable";
import { dateFormat } from "../../../helpers/dateHelper";
import { useNavigate } from "react-router-dom";

const CustomerOrders = () => {
  const { mutate } = useApiMutation();
  const [orders, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const getOrders = () => {
    mutate({
      url: `/admin/order/items`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setOrdersData(response.data.data);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="All">
        <div className="rounded-md pb-2 w-full gap-5">
          <h2 className="text-lg font-semibold text-black-700 mt-4">
            Customer's Orders
          </h2>
        </div>
        {loading ? (
          <div className="w-full h-screen flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="mt-5">
            <Table
              columns={[
                { key: "productName", label: "Product Name" },
                { key: "storeName", label: "Store Name" },
                { key: "sku", label: "Product ID" },
                {
                  key: "productImage",
                  label: "Product Image",
                  render: (value) => <img src={value} width={50} />,
                },
                { key: "quantity", label: "Quantity" },
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
              allData={orders.map((item) => ({
                ...item,
                sku: item.product.sku,
                price: `${item.product.store.currency.symbol} ${item.price}`,
                productName: `${item.product.name}`,
                storeName: `${item.product.store.name}`,
                productImage: `${item.product.image_url}`,
              }))}
              data={orders.map((item) => ({
                ...item,
                sku: item.product.sku,
                price: `${item.product.store.currency.symbol} ${item.price}`,
                productName: `${item.product.name}`,
                storeName: `${item.product.store.name}`,
                productImage: `${item.product.image_url}`,
              }))}
              exportData
              actions={[
                {
                  label: (row) => {
                    return "View Order";
                  },
                  onClick: (row) => navigate(`order-details/${row.id}`),
                },
              ]}
              currentPage={null}
              totalPages={null}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
