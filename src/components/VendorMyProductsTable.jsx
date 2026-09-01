import React from "react";
import ReviewTable from "./ReviewTable";
import Button from "./Button";

const VendorMyProductsTable = ({
  data = [],
  loading = false,
  onEdit,
  onDelete,
  onCreateProduct,
  onCreateAIProduct,
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
      onClick: (row) => onDelete(row),
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
        <div className="flex gap-2">
          <Button
            onClick={onCreateAIProduct}
            title="Create product details automatically using AI"
            variant="outline"
          >
            <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            Create with AI
            </span>
          </Button>
          <Button
            onClick={onCreateProduct}
            disabled={false}
            title={!hasStores ? "No stores found for this vendor" : ""}
            variant="primary"
          >
            Create New Product
          </Button>
        </div>
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
              <Button
                onClick={onCreateProduct}
                disabled={!hasStores}
                title={!hasStores ? "No stores found for this vendor" : ""}
                variant="primary"
              >
                {!hasStores ? "Create Store First" : "Add Your First Product"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMyProductsTable;
