import { useEffect, useState } from "react";
import { useSocket } from "../store/SocketContext.jsx";
import useApiMutation from "../api/hooks/useApiMutation.jsx";
import { formatNumberWithCommas } from "../helpers/helperFactory.jsx";

const Monitor = ({ auctionProductId, currency }) => {
  const socket = useSocket();
  const [currentBid, setCurrentBid] = useState(null);
  const [auctionStatus, setAuctionStatus] = useState("Auction Ongoing 🟢");
  const [loading, setLoading] = useState(true);
  const [bidders, setBidders] = useState([]);
  const [winner, setWinner] = useState(null);
  const [winningBid, setWinningBid] = useState(null);

  const { mutate } = useApiMutation();


  useEffect(() => {
    getAuctionBidders()
  }, []);


  const getAuctionBidders = (silent = false) => {
    if (!silent) setLoading(true);
    mutate({
      url: `/user/auction/product/bidders?auctionproductId=${auctionProductId}`,
      method: 'GET',
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const bidsData = response?.data?.data?.bids || [];
        setBidders(bidsData);
        if (bidsData.length > 0) {
          const latestBid = bidsData.reduce((max, bid) => {
            const currentAmount = parseFloat(bid.bidAmount);
            const maxAmount = parseFloat(max.bidAmount);
            return currentAmount > maxAmount ? bid : max;
          }, bidsData[0]);

          if (latestBid && latestBid.bidAmount) {
            setCurrentBid(latestBid.bidAmount);
          }
        }
        if (!silent) setLoading(false);
      },
      onError: () => {
        if (!silent) setLoading(false);
      },
    });
  };

  useEffect(() => {
    // 1. Initial fetch
    getAuctionBidders();

    // 2. Periodic poll fallback every 15s to guarantee fresh state
    const pollInterval = setInterval(() => {
      getAuctionBidders(true);
    }, 15000);

    // 3. Tab visibility change refresh
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        getAuctionBidders(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [auctionProductId]);

  useEffect(() => {
    if (!socket || !auctionProductId) return;

    // Join the auction room
    socket.emit("joinAuction", auctionProductId);

    // Reconnection handler
    const handleConnect = () => {
      socket.emit("joinAuction", auctionProductId);
      getAuctionBidders(true);
    };

    // Listen for new bids scoped to this auction
    const handleNewBid = (data) => {
      if (data?.auctionProductId && data.auctionProductId !== auctionProductId) return;
      if (data?.bidAmount) {
        setCurrentBid(data.bidAmount);
      }
      getAuctionBidders(true);
    };

    // Listen for auction start
    const handleAuctionStarted = (data) => {
      if (data?.auctionProductId && data.auctionProductId !== auctionProductId) return;
      setAuctionStatus("Auction Ongoing 🟢");
      getAuctionBidders(true);
    };

    // Listen for auction end
    const handleAuctionEnd = (data) => {
      if (data?.auctionProductId && data.auctionProductId !== auctionProductId) return;
      setAuctionStatus("Auction Ended 🚫");
      const winnerName = data?.winner
        ? `${data.winner.firstName || ""} ${data.winner.lastName || ""}`.trim() || data.winner.email || "Winner Determined"
        : "No Winner";
      setWinner(winnerName);
      setWinningBid(data?.winningBid || 0);
      getAuctionBidders(true);
    };

    socket.on("connect", handleConnect);
    socket.on("newBid", handleNewBid);
    socket.on("auctionStarted", handleAuctionStarted);
    socket.on("auctionEnded", handleAuctionEnd);

    return () => {
      socket.emit("leaveAuction", auctionProductId);
      socket.off("connect", handleConnect);
      socket.off("newBid", handleNewBid);
      socket.off("auctionStarted", handleAuctionStarted);
      socket.off("auctionEnded", handleAuctionEnd);
    };
  }, [socket, auctionProductId]);




  const getInitials = (name) => {
    return name
      .trim() // Remove leading/trailing spaces
      .split(/\s+/) // Split by one or more spaces
      .map(word => word[0]?.toUpperCase()) // Get first letter and capitalize
      .join('');
  }




  return (
    <div className="max-w-md mx-auto rounded-lg bg-white max-h-[70vh] overflow-y-auto p-4">
      <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-4">
        <h2 className="text-sm font-semibold">{auctionStatus}</h2>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b border-gray-300">
          <span className="font-medium">Current Bid:</span>
          <span className="capitalize">{currency} {currentBid ? formatNumberWithCommas(currentBid) : '0'}</span>
        </div>
        {bidders.length > 0 ? bidders.map((bids, index) => (
          <div className="flex justify-between py-2 border-b border-gray-300" key={index}>
            <div className="p-1 rounded-sm flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-300 text-gray-700 font-bold rounded-full mr-3">
                  {getInitials(`${bids.user.firstName} ${bids.user.lastName}`)}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-gray-800">
                    {bids.user.firstName} {bids.user.lastName}
                  </p>
                  <p className="text-gray-800">
                    Bids Count
                    <span className="font-normal mx-1 text-sm text-gray-500"> - {" "}
                      {bids.bidCount}
                    </span>
                  </p>
                  <span className="capitalize">{currency} {formatNumberWithCommas(bids.bidAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        ))
          :
          <></>}
      </div>
    </div>
  );
};

export default Monitor;
