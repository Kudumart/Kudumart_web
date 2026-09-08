import Imgix from "react-imgix";
import AuctionPage from "./layouts/AuctionPage";
import { useEffect, useState } from "react";
import { useCountrySelect } from "../../store/clientStore";
import useApiMutation from "../../api/hooks/useApiMutation";
import Loader from "../../components/Loader";

export default function Auction() {

    const [auctionProducts, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { country } = useCountrySelect();

    const { mutate } = useApiMutation();

    const fetchAuction = async () => {
        setLoading(true);
        try {
            const fetchUrl = async (url) => {
                return new Promise((resolve) => {
                    mutate({
                        url,
                        method: "GET",
                        hideToast: true,
                        onSuccess: (response) => resolve(response.data?.data || []),
                        onError: () => resolve([]),
                    });
                });
            };

            const rawCountry = typeof country === 'string' ? country : (country?.label || country?.value || "");
            const countryQuery = rawCountry ? `country=${encodeURIComponent(rawCountry)}` : "";
            const qStr = countryQuery ? `?${countryQuery}&limit=100` : "?limit=100";

            const [r1, r2] = await Promise.all([
                fetchUrl(`/auction/products${qStr}`),
                fetchUrl(`/auction/products?limit=100`),
            ]);

            const candidateList = r1.length > 0 ? r1 : r2;
            const uniqueMap = new Map();
            candidateList.forEach((item) => {
                if (item && item.id && !uniqueMap.has(item.id)) {
                    uniqueMap.set(item.id, item);
                }
            });

            const sortedList = Array.from(uniqueMap.values()).sort((a, b) => {
                const priority = (s) => {
                    const st = (s || "").toLowerCase().trim();
                    if (st === "ongoing") return 1;
                    if (st === "upcoming") return 2;
                    return 3;
                };
                const pA = priority(a.auctionStatus);
                const pB = priority(b.auctionStatus);
                if (pA !== pB) return pA - pB;
                const dateA = new Date(a.createdAt || a.startDate || 0).getTime();
                const dateB = new Date(b.createdAt || b.startDate || 0).getTime();
                return dateB - dateA;
            });

            setProducts(sortedList);
        } catch (_) {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuction();
    }, [country]);


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
                                <AuctionPage auctions={auctionProducts} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}