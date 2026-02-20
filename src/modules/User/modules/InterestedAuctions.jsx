import { useEffect, useState } from "react"
import Loader from "../../../components/Loader";
import useApiMutation from "../../../api/hooks/useApiMutation";
import AuctionPage from "../../Auction/layouts/AuctionPage";

export default function InterestedAuctions() {
    const [bookmarkedAuctions, setBookmarkedAuctions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const { mutate } = useApiMutation();




    const getSavedAuctions = async () => {
        try {
            const savedProducts = new Promise((resolve, reject) => {
                mutate({
                    url: `/user/auction/products/interest`,
                    method: "GET",
                    headers: true,
                    hideToast: true,
                    onSuccess: (response) => resolve(response.data.data),
                    onError: reject,
                });
            });
            const [products] = await Promise.all([savedProducts]);
            setBookmarkedAuctions(products);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
        getSavedAuctions();
    }, []);



    return (
        <>
            <div className="w-full p-6 bg-white shadow rounded-lg">
                <div className="flex w-full justify-between">
                    <h2 className="text-lg font-bold mb-4">Interested Auctions</h2>
                </div>

                {isLoading ? (
                    <div className="w-full h-96 flex items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <AuctionPage hideHeader auctions={bookmarkedAuctions.map(item => item.auctionProduct)} />
                )}
            </div>

        </>
    )
}