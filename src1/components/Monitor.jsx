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


  const getAuctionBidders = () => {
    setLoading(true);
    mutate({
      url: `/user/auction/product/bidders?auctionproductId=${auctionProductId}`,
      method: 'GET',
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setBidders(response.data.data.bids);
        if (response.data.data.bids && response.data.data.bids.length > 0) {
          const latestBid = response.data.data.bids.reduce((max, bid) => {
            const currentAmount = parseFloat(bid.bidAmount);
            const maxAmount = parseFloat(max.bidAmount);
            return currentAmount > maxAmount ? bid : max;
          }, response.data.data.bids[0]);

          setCurrentBid(latestBid.bidAmount)
        }
        setLoading(false);
      },
      onError: () => {
        setLoading(false)
      },
    });
  }





  useEffect(() => {
    if (!socket) return;

    // Join the auction room
    socket.emit("joinAuction", auctionProductId);

    // Listen for new bids
    const handleNewBid = (data) => {
      setCurrentBid(data.bidAmount);
      getAuctionBidders();
    };

    // Listen for auction end
    const handleAuctionEnd = (data) => {
      setAuctionStatus("Auction Ended 🚫");
      setWinner(data.winner ? `${data.winner.firstName} ${data.winner.lastName}` : "No Winner");
      setWinningBid(data.winningBid);
    };

    socket.on("newBid", handleNewBid);
    socket.on("auctionEnded", handleAuctionEnd);

    return () => {
      socket.off("newBid", handleNewBid);
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
