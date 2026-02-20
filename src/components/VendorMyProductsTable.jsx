import React from "react";
import ReviewTable from "./ReviewTable";

const VendorMyProductsTable = ({
  data = [],
  loading = false,
  onEdit,
  onDelete,
  onCreateProduct,
  hasStores = true,
}) => {
  const columns = [
    { key: "name", label: "Products" },
    { key: "categoryName", label: "Category" },
    {
      key: "condition",
      label: "Condition",
      render: (value) => (
        <span className="capitalize">{value?.replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (value, row) => (
        <span>
          {row.store?.currency?.symbol} {value}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span>{row.auctionStatus ? "Auction" : "Non Auction"}</span>
          {row.auctionStatus && (
            <span
              className={`text-xs text-white uppercase shadow-md rounded-lg px-3 py-2 leading-loose
                                ${row.auctionStatus !== "ongoing" ? "bg-red-500" : "bg-green-500"}`}
            >
              {row.auctionStatus}
            </span>
          )}
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: () => "View/Edit",
      onClick: (row) => onEdit(row),
    },
    {
      label: () => "Delete",
      onClick: (row) => onDelete(row.id),
      className: "text-red-600 hover:text-red-800",
    },
  ];

  const transformedData = data.map((product) => ({
    ...product,
    categoryName: product.sub_category?.name || "Unknown",
    type: product.auctionStatus ? "Auction" : "Non Auction",
  }));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-black-700 mb-4 mt-4">
          My Products
        </h2>
        <button
          className="bg-kudu-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 text-center inline-block disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onCreateProduct}
          disabled={false}
          title={!hasStores ? "No stores found for this vendor" : ""}
        >
          Create New Product
        </button>
      </div>
      <div className="bg-white rounded-md p-6 w-full">
        {transformedData.length > 0 ? (
          <ReviewTable
            title="My Products"
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
                alt="Empty Products Illustration"
                className="w-80 h-80 mx-auto"
              />
            </div>
            <h1 className="text-center text-lg font-bold mb-4">
              No Products Found
            </h1>
            <div className="text-center text-gray-600 mb-6">
              <p>
                You haven't created any products yet. Start selling by adding
                your first product!
              </p>
            </div>
            <div className="text-center">
              <button
                data-theme="kudu"
                className="btn btn-primary"
                onClick={onCreateProduct}
                disabled={!hasStores}
                title={!hasStores ? "No stores found for this vendor" : ""}
              >
                {!hasStores ? "Create Store First" : "Add Your First Product"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMyProductsTable;
