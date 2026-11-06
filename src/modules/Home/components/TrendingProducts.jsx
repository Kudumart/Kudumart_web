import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductListing from "../../../components/ProductsList";
import Imgix from "react-imgix";
import { useGeoLocatorProduct } from "../../../hooks/geoLocatorProduct";
import { goToAdvert } from "../../../helpers/advertLink";

const TrendingProducts = ({ productsArr = [], ads = [] }) => {

    const filteredProducts = useGeoLocatorProduct(productsArr);

    const navigate = useNavigate();
    const carouselRef = useRef(null);

    const handleSelectedAd = (ad) => goToAdvert(ad, navigate);

    const scrollTrending = (direction) => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        carousel.scrollBy({
            left: direction * Math.max(carousel.clientWidth * 0.85, 280),
            behavior: "smooth",
        });
    };



    return (
        <div className="w-full">
            <div className="bg-[#192D4C] w-full flex justify-between p-6 rounded-md mb-10 cursor-pointer">
                <h2 className="text-lg text-white font-semibold">Trending Products</h2>
                <Link to={'/see-all'} className="text-white font-semibold">See All</Link>
            </div>

            <div className="relative px-1 md:px-12">
                {filteredProducts.length > 0 && (
                    <>
                        <button
                            type="button"
                            onClick={() => scrollTrending(-1)}
                            aria-label="Scroll trending products left"
                            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md text-[#192D4C] hover:bg-[#192D4C] hover:text-white transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTrending(1)}
                            aria-label="Scroll trending products right"
                            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md text-[#192D4C] hover:bg-[#192D4C] hover:text-white transition-colors"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                <ProductListing
                    productsArr={filteredProducts}
                    displayError
                    layout="two-row-carousel"
                    scrollRef={carouselRef}
                />
            </div>

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
        </div>
    );
};

export default TrendingProducts;




