import { useEffect, useState } from "react"
import Loader from "../../../components/Loader";
import useApiMutation from "../../../api/hooks/useApiMutation";
import ProductListing from "../../../components/ProductsList";
import { Link } from "react-router-dom";

export default function BookMarkedProducts() {
    const [bookmarkedProducts, setBookmarkedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const { mutate } = useApiMutation();


    const capitalizeEachWord = (str) => {
        return str
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };



    const getSavedProducts = async () => {
        try {
            const savedProducts = new Promise((resolve, reject) => {
                mutate({
                    url: `/user/saved/products`,
                    method: "GET",
                    headers: true,
                    hideToast: true,
                    onSuccess: (response) => resolve(response.data.data),
                    onError: reject,
                });
            });
            const [products] = await Promise.all([savedProducts]);
            const productObjects = Array.isArray(products) ? products.map(item => item.product) : [];
            setBookmarkedProducts(productObjects);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
        getSavedProducts();
    }, []);



    return (
        <>
            <div className="w-full p-6 bg-white shadow rounded-lg">
                <div className="flex w-full justify-between">
                    <h2 className="text-lg font-bold mb-4">Bookmarked Products</h2>
                </div>

                {isLoading ? (
                    <div className="w-full h-96 flex items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <div className="mt-4">
                        <div className="w-full">
                            {bookmarkedProducts.length > 0 ?
                                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4`}>
                                    {bookmarkedProducts.map((item) => (
                                        <div key={item.id} className="bg-white shadow-lg p-1 border rounded-lg relative">
                                            <Link to={`/product/${item.id}`}>
                                                <div className="flex justify-center relative md:h-[200px] h-[200px]">
                                                    <img src={item.image_url} alt={item.name} className="w-full md:h-[200px] h-[200px] object-cover rounded-md" />
                                                </div>
                                                <div className="p-3 w-full">
                                                    <h3 className="text-base font-medium mt-1 leading-loose truncate whitespace-nowrap overflow-hidden w-full">{item.name}</h3>
                                                    <p className="text-sm font-semibold leading-loose">{item.store.currency.symbol} {item.price}</p>
                                                    <button
                                                        className={`absolute top-2 right-0 px-2 py-1 text-xs rounded font-meduim text-white ${item?.vendor?.isVerified ? "bg-green-500" : item.admin ? "bg-green-500" : "bg-red-500"
                                                            }`}
                                                    >
                                                        {item?.vendor?.isVerified ? "Verified" : item.admin ? "Verified" : "Not Verified"}
                                                    </button>
                                                    <span
                                                        className={`absolute top-2 left-0 px-2 py-1 text-xs rounded font-meduim text-white ${item.condition === "brand_new" ? "bg-[#34A853]" : "bg-orange-500"
                                                            }`}
                                                    >
                                                        {capitalizeEachWord(item.condition.replace(/_/g, ' '))}
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                                :
                                (displayError &&
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
                                )
                            }
                        </div>
                    </div>
                )}
            </div>

        </>
    )
}