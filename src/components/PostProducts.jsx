import React from "react";
import { useModal } from "../hooks/modal";
import Modal from "./Modal";
import Table from "./ReviewTable";

const formatPrice = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString("en-NG", { maximumFractionDigits: 2 })
    : value;
};

const PostProducts = ({ data, paginate, loading, refetch, searchQuery, onSearchChange, categories, categoryId, onCategoryChange }) => {
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

  const handleTrendingModal = (product) => {
    openModal({
      size: "sm",
      content: (
        <Modal
          title={`${product.isTrending ? "Remove" : "Add"} “${product.name}” ${product.isTrending ? "from" : "to"} trending products?`}
          redirect={handleRedirect}
          api="/admin/general/product/trending"
          method="PATCH"
          body={{ productId: product.id, isTrending: !product.isTrending }}
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
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex min-w-60 flex-col gap-1 text-sm font-medium text-gray-700">
            Filter by category
            <select
              className="h-11 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              value={categoryId}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          {categoryId && (
            <button
              type="button"
              className="h-11 rounded-md px-3 text-sm font-medium text-orange-600 hover:bg-orange-50"
              onClick={() => onCategoryChange("")}
            >
              Clear filter
            </button>
          )}
        </div>
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
              {
                key: "isTrending",
                label: "Trending",
                render: (value) => <span className={`py-1 px-3 rounded-full text-sm ${value ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>{value ? "Trending" : "Standard"}</span>,
              },
              { key: "vendor", label: "Vendor" },
            ]}
            exportData
            isLoading={loading}
            data={data.map((item) => ({
              ...item,
              vendor: item.vendor
                ? `${item.vendor.firstName} ${item.vendor.lastName}`
                : "Administrator",
              price: `${item.store?.currency?.symbol || "₦"} ${formatPrice(item.price)}`,
            }))}
            disableInternalSearch
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search products by name..."
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
              {
                label: (row) => row.isTrending ? "Remove from trending" : "Make trending",
                onClick: (row) => handleTrendingModal(row),
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
