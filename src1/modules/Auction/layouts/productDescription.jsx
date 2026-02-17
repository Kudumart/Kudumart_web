import React from "react";
import SafeHTML from "../../../helpers/safeHTML";



const ProductDescription = ({description, specifications}) => {
  return (
    <div className="max-w-md mx-auto rounded-lg flex flex-col gap-4 shadow-md bg-white p-4">
      <div className="flex justify-between items-center border-b border-gray-300 pb-2">
        <h2 className="text-sm font-semibold">Product Description</h2>
      </div>
      <div className="space-y-1 text-sm">
        <SafeHTML htmlContent={description} />
      </div>

      <div className="flex justify-between items-center border-b border-gray-300 pb-2 mt-6">
        <h2 className="text-sm font-semibold">Product Specification</h2>
      </div>
      <div className="space-y-1 text-sm">
        <SafeHTML htmlContent={specifications} />
      </div>

    </div>
  );
};

export default ProductDescription;
