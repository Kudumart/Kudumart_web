import React from "react";
import { useModal } from "../hooks/modal";
import Modal from "./Modal";
import Table from "./ReviewTable";

const PostProducts = ({ data, paginate, totalData, loading, refetch }) => {
  const { openModal } = useModal();

  const fetchNew = (page) => {
    refetch(page);
  };

  const handleRedirect = () => {
    refetch(paginate.page);
  };

  const handlePublishModal = (user) => {
    openModal({
      size: "sm",
      content: (
        <Modal
          title={`Do you wish to ${
            user.status === "inactive" ? "publish" : "unpublish"
          } this product?`}
          redirect={handleRedirect}
          api={
            user.status === "inactive"
              ? `/admin/general/product/publish?productId=${user.id}`
              : `/admin/general/product/unpublished?productId=${user.id}`
          }
          method={"PUT"}
        />
      ),
    });
  };

  const handleDeleteModal = (product) => {
    console.log(product);
    openModal({
      size: "sm",
      content: (
        <Modal
          title={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
          redirect={handleRedirect}
          api={`/admin/general/product/delete?productId=${product.id}`}
          method={"DELETE"}
        />
      ),
    });
  };

  return (
    <div className="All">
      <div className="rounded-md pb-2 w-full gap-5">
        <h2 className="text-lg font-semibold text-black-700 mb-4">
          All Products
        </h2>
      </div>
      <div className="bg-white rounded-md p-6 w-full gap-5">
        <h2 className="text-lg font-semibold text-black-700">All Products</h2>
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
              { key: "vendor", label: "Vendor" },
            ]}
            exportData
            isLoading={loading}
            allData={totalData.map((item) => ({
              ...item,
              vendor: item.vendor
                ? `${item.vendor.firstName} ${item.vendor.lastName}`
                : "Administrator",
              price: `${item.store.currency.symbol} ${item.price}`,
            }))}
            data={data.map((item) => ({
              ...item,
              vendor: item.vendor
                ? `${item.vendor.firstName} ${item.vendor.lastName}`
                : "Administrator",
              price: `${item.store.currency.symbol} ${item.price}`,
            }))}
            actions={[
              {
                label: (row) => {
                  return row.status === "inactive" ? "Publish" : "Unpublish";
                },
                onClick: (row) => handlePublishModal(row),
              },
              {
                label: () => "Delete",
                onClick: (row) => handleDeleteModal(row),
              },
            ]}
            currentPage={paginate.page}
            totalPages={paginate.pages}
            onPageChange={(page) => fetchNew(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default PostProducts;
