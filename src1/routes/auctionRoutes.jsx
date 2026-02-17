import ErrorBoundary from "../components/ErrorBoundary";
import LandingLayout from "../layouts/landing";
import Auction from "../modules/Auction";
import AllAuctions from "../modules/Auction/allAuctions";
import MonitorAuction from "../modules/Auction/MonitorAuction";
import ViewAuctionProduct from "../modules/Auction/product";

export const auctionRoutes = [
    {
        path: '/',
        element: <LandingLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                path: 'auction',
                element: <Auction />
            },
            {
                path: 'auction/product/:id',
                element: <ViewAuctionProduct />
            },
            {
                path: 'auction/product/monitor/:id',
                element: <MonitorAuction />
            },
            {
                path: 'auction/all-auctions',
                element: <AllAuctions />
            }
        ],
    },
];
