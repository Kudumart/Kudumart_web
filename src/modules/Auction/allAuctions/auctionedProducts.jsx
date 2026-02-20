import { Button } from "@material-tailwind/react";
import React from "react";

const TableComponent = () => {
  const data = [
    {
      id: 1,
      image: "https://res.cloudinary.com/do2kojulq/image/upload/v1736767358/kudu_mart/0c2a08d6a2ea37ed82313d79c2a4ab79_oxdj1h.png", // Replace with the actual image URL
      name: "2018 TOYOTA RAV4 SE",
      seller: "Mecho Autotech",
      odometer: "75163",
      condition: "Used",
      bid: "#23567",
      auctionTime: "Auction in 3D 14H 27min",
      currentBid: "₦0.00",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/150", // Replace with the actual image URL
      name: "Rose Gold Rolex Watch",
      seller: "Mecho Autotech",
      odometer: "75163",
      condition: "Used",
      bid: "#23567",
      auctionTime: "Auction in 3D 14H 27min",
      currentBid: "₦0.00",
    },
  ];

  return (
    <div className="container mx-auto flex flex-col gap-5">
      <div className="flex flex-col gap-2 mt-5">
        <span className="md:text-2xl text-base font-semibold">Auctioned Products</span>
        <span className="text-sm">Sale Date / Time: 11/07/2024 04:00 pm GMT+1 | Bid Ends: 11/07/2024 03:00 pm GMT+1</span>
        <table className="table-auto table-x w-full border-separate border border-gray-200 mt-5" style={{ borderSpacing: '0 10px' }}>
          {/* Table Headers */}
          <thead className="bg-black h-[60px] rounded-lg text-white text-left">
            <tr>
              <th className="px-4 py-2 text-sm font-normal">Image</th>
              <th className="px-4 py-2 text-sm font-normal">Product Info</th>
              <th className="px-4 py-2 text-sm font-normal">Condition</th>
              <th className="px-4 py-2 text-sm font-normal">Sale Info</th>
              <th className="px-4 py-2 text-sm font-normal">Bids</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b my-3 shadow-sm">
                {/* Image Column */}
                <td className="px-4 py-4 rounded-l-md bg-white">
                  <div className="flex gap-5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-md object-cover"
                    />
                    <div className="flex flex-col gap-2">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <Button className="mt-2 px-3 py-1 border rounded-md text-kudu-orange border-kudu-orange bg-white transition">
                        Monitor
                      </Button>
                    </div>
                  </div>
                </td>
                {/* Product Info Column */}
                <td className="px-4 py-4 bg-white">
                  <p className="font-semibold">Odometer {item.odometer}</p>
                  <p className="text-gray-400 text-sm">Estimated Retail </p>
                  <p className="text-gray-400 text-sm">Value $0.00 USD</p>
                </td>
                {/* Condition Column */}
                <td className="px-4 py-4 bg-white font-medium">{item.condition}</td>
                {/* Sale Info Column */}
                <td className="px-4 py-4 bg-white">
                  <p className="text-blue-600 font-medium text-sm">{item.seller}</p>
                  <p className="text-gray-500 text-sm">Bid: {item.bid}</p>
                  <p className="text-red-600 font-medium mt-2 text-sm">{item.auctionTime}</p>
                </td>
                {/* Bids Column */}
                <td className="px-4 py-4 rounded-r-md bg-white">
                  <p className="text-lg font-bold">{item.currentBid}</p>
                  <button className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    Bid Now
                  </button>
                  <button className="mt-2 w-full px-4 py-2 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-500 hover:text-white transition">
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableComponent;
