import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAppState from "../../../hooks/appState";
import { useModal } from "../../../hooks/modal";
import Modal from "../../../components/Modal";
import { useGeoLocatorProduct } from "../../../hooks/geoLocatorProduct";
import { formatNumberWithCommas } from "../../../helpers/helperFactory";

const AuctionPage = ({ auctions, hideHeader }) => {
  const [activeTab, setActiveTab] = useState("popular");
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppState();

  const filteredAuctions = useGeoLocatorProduct(auctions);

  const { openModal } = useModal();

  const capitalizeEachWord = (str) => {
    return str
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleNavigate = (auctionId) => {
    if (!user) {
      openModal({
        size: "sm",
        content: (
          <Modal submitButton={false} text={'You must be logged in to view auction details. Please sign in or create an account to access this product.'} />
        ),
      });
      return;
    }
    const isAuctionPage = location.pathname.includes("/auction");
    const targetPath = isAuctionPage ? `product/${auctionId}` : `/auction/product/${auctionId}`;
    navigate(targetPath);
  };



  const handleMonitor = (auctionId) => {
    if (!user) {
      openModal({
        size: "sm",
        content: (
          <Modal submitButton={false} text={'You must be logged in to view auction details. Please sign in or create an account to access this product.'} />
        ),
      });
      return;
    }
    const isAuctionPage = location.pathname.includes("/auction");
    const targetPath = isAuctionPage ? `product/monitor/${auctionId}` : `/auction/product/monitor/${auctionId}`;
    navigate(targetPath);
  };

  

  return (
    <div className="w-full px-4 md:px-1">
      {/* Header */}
      {!hideHeader &&
        <div className="bg-[#FFDEC1] flex justify-between items-center p-4 md:p-6 rounded-md md:mb-0">
          <h2 className="text-lg md:text-xl font-semibold">Auctions</h2>
          <button className="text-black font-semibold text-sm md:text-base">
            See All
          </button>
        </div>
      }

      {/* Auction Listings */}
      {filteredAuctions.length > 0 ?
        <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-4 gap-4 mt-3">
          {
            filteredAuctions.map((auction) => {
              const auctionLocation = auction.vendor?.location
                ? auction.vendor.location
                : null;

              return (
                <div
                  key={auction.id}
                  className="bg-white p-3 shadow-lg border rounded-lg relative"
                >
                  {/* Product Image */}
                  <div className="flex justify-center relative md:h-[200px] h-[200px]">
                    <img
                      src={auction.image}
                      alt={auction.name}
                      className="w-full md:h-[200px] object-cover rounded-md"
                    />
                  </div>

                  {/* Condition Badge */}
                  <span className={`absolute top-2 right-2 ${auction.condition === "brand_new" ? "bg-[#34A853]" : "bg-[#FF0F00]"} text-white px-2 py-1 text-xs rounded-sm`}>
                    {capitalizeEachWord(auction.condition)}
                  </span>

                  {/* Auction Name */}
                  <h3 className="text-sm md:text-base font-semibold mt-3 leading-loose truncate whitespace-nowrap overflow-hidden w-full">
                    {auction.name}
                  </h3>

                  {/* Lot Number 
                  <p className="text-gray-500 mt-3 text-xs">
                    Lot #{" "}
                    <span className="text-[#FF6F22]">{auction.id}</span>
                  </p> */}

                  {/* Current Bid */}
                  <p className="text-base font-bold mt-3 text-green-600">
                    <small className="text-black">Auction Price:</small> <br />
                    {auction.store.currency.symbol} {formatNumberWithCommas(auction.price)}
                  </p>

                  {/* Location */}
                  <p className="text-black text-xs mt-3">
                    Location:{" "}
                    <span className="font-semibold">
                      {auctionLocation
                        ? `${auctionLocation.city}, ${auctionLocation.state}, ${auctionLocation.country}`
                        : "N/A"}
                    </span>
                  </p>

                  {/* View Details Button */}
                  <button
                    onClick={() => handleNavigate(auction.id)}
                    className="bg-[#FF6F22] text-white w-full py-3 mt-5 rounded-lg text-xs md:text-sm"
                  >
                    View Details
                  </button>

                  {/* Monitor Button */}
                  <div onClick={() => handleMonitor(auction.id)} className="flex text-left text-[#FF6F22] text-sm mt-5 cursor-pointer">
                    <span>📌 Monitor</span>
                  </div>
                </div>
              );
            })}
        </div>
        :
        <div className="w-full">
          <div className="empty-store">
            <div className="text-center">
              <img
                src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
                alt="Empty Store Illustration"
                className="w-80 h-80 mx-auto"
              />
            </div>
            <h1 className="text-center text-lg font-bold mb-4">No Product Found</h1>
            <div className="text-center text-black-100 mb-6 leading-loose text-sm">
              Oops! It looks like we don’t have products available in your region at the moment.  <br></br>Please check back later or try browsing other categories.
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default AuctionPage;
