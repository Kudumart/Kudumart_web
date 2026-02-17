import { Carousel, IconButton } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import Imgix from "react-imgix";
import { Link, useNavigate } from "react-router-dom";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { toast } from "react-toastify";

export default function CategoriesSection({ data }) {

    const navigate = useNavigate();

    const { mutate } = useApiMutation();

    const chunkArray = (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    const slidesXS = chunkArray(data, 3); // 3 items per slide for mobile
    const slidesMD = chunkArray(data, 5); // 5 items per slide for medium screens
    const slidesLG = chunkArray(data, 6); // 6 items per slide for large screens

    // Determine which slide array to use based on screen size
    const [slides, setSlides] = useState(slidesLG);

    useEffect(() => {
        const updateSlides = () => {
            if (window.innerWidth < 768) {
                setSlides(slidesXS);
            } else if (window.innerWidth >= 768 && window.innerWidth < 992) {
                setSlides(slidesMD);
            } else {
                setSlides(slidesLG);
            }
        };

        updateSlides();
        window.addEventListener("resize", updateSlides);

        return () => window.removeEventListener("resize", updateSlides);
    }, []);



    const handleNavigation = (id, name) => {
        navigate(`products/categories/${id}/${name}`)
    }


    return (
        <div className="flex w-full flex-col gap-5">
            {/* Carousel Section */}
            <div className="w-full mx-auto">
                {/* Desktop Carousel */}
                <Carousel
                    className="rounded-lg md:flex hidden"
                    prevArrow={({ handlePrev }) => (
                        <IconButton
                            variant="text"
                            color="black"
                            size="md"
                            onClick={handlePrev}
                            className="!absolute top-2/4 left-4 -translate-y-2/4 bg-black text-white shadow-md rounded-full 
                       hover:bg-black !focus:bg-black active:bg-black !disabled:bg-black"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="-ml-1 h-5 w-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </IconButton>
                    )}
                    nextArrow={({ handleNext }) => (
                        <IconButton
                            variant="text"
                            color="black"
                            size="md"
                            onClick={handleNext}
                            className="!absolute top-2/4 right-4 -translate-y-2/4 bg-black text-white shadow-md rounded-full 
                       hover:bg-black !focus:bg-black active:bg-black !disabled:bg-black"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="ml-1 h-5 w-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </IconButton>
                    )}
                >
                    {slides.map((slide, slideIndex) => (
                        <div className="flex gap-10 mt-10 py-2 justify-center" key={`slide-${slideIndex}`}>
                            {slide.map((category, index) => (
                                <span
                                    key={`slide-desktop-${index}`}
                                    className="w-[140px] cursor-pointer flex flex-col items-center gap-4"
                                    onClick={() => handleNavigation(category.id, category.name)}
                                >
                                    <div
                                        className={`w-[140px] h-[140px] rounded-full flex items-center justify-center ${category.color}`}
                                    >
                                        <img
                                            src={category.img}
                                            alt={category.name}
                                            className="w-[70px] h-[70px] object-contain"
                                        />
                                    </div>
                                    <span
                                        className={`font-medium text-lg ${category.active ? "text-kudu-orange" : "text-black"
                                            }`}
                                    >
                                        {category.name}
                                    </span>
                                </span>
                            ))}
                        </div>
                    ))}
                </Carousel>

                {/* Mobile Carousel */}
                <Carousel className="rounded-lg flex md:hidden"
                    prevArrow={({ handlePrev }) => (
                        <IconButton
                            variant="text"
                            color="black"
                            size="sm"
                            onClick={handlePrev}
                            className="!absolute top-2/4 left-2 -translate-y-2/4 bg-black text-white shadow-md rounded-full 
                           hover:bg-black !focus:bg-black active:bg-black !disabled:bg-black"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="-ml-1 h-6 w-6"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </IconButton>
                    )}
                    nextArrow={({ handleNext }) => (
                        <IconButton
                            variant="text"
                            color="black"
                            size="sm"
                            onClick={handleNext}
                            className="!absolute top-2/4 right-2 -translate-y-2/4 bg-black text-white shadow-md rounded-full 
                           hover:bg-black !focus:bg-black active:bg-black !disabled:bg-black"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="ml-1 h-6 w-6"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </IconButton>
                    )}>
                    {slidesXS.map((slide, slideIndex) => (
                        <div className="flex gap-5 justify-center mt-8" key={`slide-xs-${slideIndex}`}>
                            {slide.map((category, index) => (
                                <div
                                    key={`slide-mobile-${index}`}
                                    className="w-[90px] flex flex-col items-center gap-2"
                                    onClick={() => handleNavigation(category.id, category.name)}
                                >
                                    <div className={`w-[90px] h-[90px] rounded-full flex items-center justify-center ${category.color}`}>
                                        <img src={category.img} alt={category.name} className="w-[50px] h-[50px] object-contain" />
                                    </div>
                                    <span className={`font-medium text-sm ${category.active ? 'text-kudu-orange' : 'text-black'}`}>
                                        {category.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </Carousel>
            </div>
        </div>
    );
}
