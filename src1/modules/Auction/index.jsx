import Imgix from "react-imgix";
import AuctionPage from "./layouts/AuctionPage";
import { useEffect, useState } from "react";
import useApiMutation from "../../api/hooks/useApiMutation";
import Loader from "../../components/Loader";

export default function Auction() {

    const [auctionProducts, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { mutate } = useApiMutation();

    const fetchAuction = () => {
        mutate({
            url: '/auction/products?auctionStatus=upcoming',
            method: 'GET',
            hideToast: true,
            onSuccess: (response) => {
                setProducts(response.data?.data || []);
                setLoading(false);
            },
            onError: () => {
                setLoading(false)
            },
        });
    }

    useEffect(() => {
        fetchAuction()
    }, []);


    return (
        <>
            <div className="w-full flex flex-col h-full bg-kudu-light-blue">
                <div className="w-full flex flex-col md:gap-10 bg-kudu-light-blue h-full mt-14 md:mt-16">
                    <div className="relative w-full h-[100px] md:h-auto flex grow z-50">
                        <Imgix
                            src="https://res.cloudinary.com/do2kojulq/image/upload/v1735426623/kudu_mart/auction_frame_lscwdh.png"
                            alt="Background image"
                            width={2180}
                            height={530}
                            className="w-full object-cover h-full"
                        />
                    </div>
                    <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 mt-28 md:mt-0 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
                        {loading ? (
                            <div className="w-full h-screen flex items-center justify-center">
                                <Loader />
                            </div>
                        ) : (
                            <div className="w-full lg:flex md:flex gap-3">
                                <AuctionPage auctions={auctionProducts.slice(0, 20)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}