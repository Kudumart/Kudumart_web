import React from "react";
import Button from "../../../components/Button";

const ProductTypeModal = ({ openAddNewAuctionProductForm, openAddNewProductForm }) => {
    return(
      <div>
         <h1 className="text-center font-large">
            Product Type
        </h1>
        <div className="flex justify-center mt-4">
            <Button
                variant="secondary"
                className="mr-2"
                onClick={openAddNewAuctionProductForm}
            >
                Auction
            </Button>
            <Button 
                variant="primary"
                className="bg-kudu-orange"
                onClick={openAddNewProductForm}
            >
                Non-Auction
            </Button>
        </div>
      </div>
    )
}

export default ProductTypeModal;