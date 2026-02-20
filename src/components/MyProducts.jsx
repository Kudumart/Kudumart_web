import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { useModal } from "../hooks/modal";
import Modal from "./Modal";
import Table from "./ReviewTable";

const MyProducts = ({ data, refetch }) => {
  const navigate = useNavigate();

  const { openModal } = useModal();

  const handleRedirect = () => {
    refetch();
  };

  const handlePublishModal = (user) => {
    openModal({
      size: "sm",
      content: (
        <Modal
          title={`Do you wish to ${user.status === "inactive" ? "publish" : "unpublish"} this product?`}
          redirect={handleRedirect}
          api={`${
            user.status === "inactive"
              ? `/admin/general/product/publish?productId=${user.id}`
              : `/admin/general/product/unpublished?productId=${user.id}`
          }
                    `}
          method={"PUT"}
        />
      ),
    });
  };

  return (
    <>
      <div className="All">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-black-700 mb-4 mt-4">
            My Products
          </h2>
          <Link
            to="/admin/new-product"
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 text-center inline-block"
          >
            Create New Product
          </Link>
        </div>

        <div className="bg-white rounded-md p-6 w-full gap-5">
          <h2 className="text-lg font-semibold text-black-700">My Products</h2>
          <div className="overflow-x-auto">
            <Table
              columns={[
                { key: "name", label: "Products" },
                { key: "sku", label: "Product ID" },
                { key: "category", label: "Category" },
                {
                  key: "condition",
                  label: "Conditions",
                  render: (value) => <span>{value.replace(/_/g, " ")}</span>,
                },
                { key: "price", label: "Price" },
                { key: "quantity", label: "Quantity" },
                {
                  key: "status",
                  label: "Status",
                  render: (value) => (
                    <span
                      className={`py-1 px-3 rounded-full text-sm capitalize ${
                        value === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {value}
                    </span>
                  ),
                },
              ]}
              exportData
              allData={data.map((item) => ({
                ...item,
                price: `${item.store.currency.symbol} ${item.price}`,
              }))}
              data={data.map((item) => ({
                ...item,
                price: `${item.store.currency.symbol} ${item.price}`,
              }))}
              actions={[
                {
                  label: (row) => {
                    return "Edit";
                  },
                  onClick: (row) => navigate(`edit/${row.id}`),
                },
                {
                  label: (row) => {
                    return row.status === "inactive" ? "Publish" : "Unpublish";
                  },
                  onClick: (row) => handlePublishModal(row),
                },
              ]}
              currentPage={null}
              totalPages={null}
              onPageChange={null}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProducts;
