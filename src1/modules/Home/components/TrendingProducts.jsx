import { Link } from "react-router-dom";
import ProductListing from "../../../components/ProductsList";
import Imgix from "react-imgix";
import { useGeoLocatorProduct } from "../../../hooks/geoLocatorProduct";
import { useModal } from "../../../hooks/modal";

const TrendingProducts = ({ productsArr, ads }) => {

    const filteredProducts = useGeoLocatorProduct(productsArr);


    const { openModal } = useModal();


    const handleSelectedAd = (ad) => {
        openModal({
            size: "lg",
            content: (<div
                className="relative bg-white rounded-lg p-4 max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <Imgix
                    src={ad.media_url}
                    sizes="100vw"
                    className="w-full h-auto max-h-screen object-contain rounded-sm"
                />
            </div>)
        })
    }



    return (
        <div className="w-full">
            <div className="bg-[#192D4C] w-full flex justify-between p-6 rounded-md mb-10 cursor-pointer">
                <h2 className="text-lg text-white font-semibold">Trending Products</h2>
                <Link to={'/see-all'} className="text-white font-semibold">See All</Link>
            </div>

            <ProductListing productsArr={filteredProducts.slice(0, 12)} displayError />

            <div className="flex w-full flex-col md:flex-row gap-4 my-2">
            {ads.map((ad, index) => (
                    <div
                        key={index}
                        onClick={() => handleSelectedAd(ad)}
                        className={`group cursor-pointer md:w-full flex md:flex-row flex-col relative w-full ${ads.length > 1 ? "pt-64" : "pt-96"
                            } px-4 lg:rounded-lg md:rounded-lg overflow-hidden`}
                    >
                        <div className="absolute inset-0 w-full h-full rounded-lg">
                            <Imgix
                                src={ad.media_url}
                                sizes="100vw"
                                className="w-full h-full object-cover object-center rounded-lg transform scale-110 group-hover:scale-100 transition-all duration-700 ease-in-out"
                            />

                            {/* Black hover overlay with text */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition duration-500 ease-in-out flex items-center justify-center">
                                <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    Click to view
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ProductListing productsArr={filteredProducts.slice(12, 24)} />

        </div>
    );
};

export default TrendingProducts;




