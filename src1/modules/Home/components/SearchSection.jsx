import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";

const MyComponent = ({ categories }) => {
  const navigate = useNavigate();

  const slides = [
    {
      desktopImage:
        "https://res.cloudinary.com/dmlgns85e/image/upload/v1752514518/Untitled_qt12wn.jpg",
      mobileImage:
        "https://res.cloudinary.com/dmlgns85e/image/upload/v1752514518/Untitled_qt12wn.jpg",
    },
    {
      desktopImage:
        "https://res.cloudinary.com/dmlgns85e/image/upload/v1752514517/Untitled2_spfiz9.jpg",
      mobileImage:
        "https://res.cloudinary.com/dmlgns85e/image/upload/v1752514517/Untitled2_spfiz9.jpg",
    },
    // {
    //   desktopImage:
    //     "https://res.cloudinary.com/greenmouse-tech/image/upload/v1747159169/kuduMart/kmb4_fkdjo4_1_1_1_aiama3.jpg",
    //   mobileImage:
    //     "https://res.cloudinary.com/greenmouse-tech/image/upload/v1747160096/kuduMart/mbkd2_2_rjixyc_1_pmxuek_1_bxg36i.jpg",
    // },
    // {
    //   desktopImage:
    //     "https://res.cloudinary.com/greenmouse-tech/image/upload/v1747160051/kuduMart/kdbn3_ynznyh_1_1_wazogj_1_s2pb6o.jpg",
    //   mobileImage:
    //     "https://res.cloudinary.com/greenmouse-tech/image/upload/v1747160635/kuduMart/mbkd2_v3y2ve_1_dxdwgk_1_conoa9.jpg",
    // },
    {
      desktopImage:
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739274574/kuduMart/WhatsApp_Image_2025-02-11_at_11.18.18_AM_hcqyzy.jpg",
      mobileImage:
        "https://res.cloudinary.com/greenmouse-tech/image/upload/v1747159988/kuduMart/mbkd3o_ulwuof_1_tfq5h8.jpg",
    },
  ];

  const handleNavigation = (id, name) => {
    navigate(`products/categories/${id}/${name}`);
  };

  return (
    <div
      className="relative z-50 bg-white J md:mt-50 sm:mt-50"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/greenmouse-tech/image/upload/v1747159259/kuduMart/kmb4_1_mtofeu_1_1_ery4y2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-30 md:px-20 sm:px-6 px-3 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
        {/* Desktop View - Top Categories + Banner */}
        <div className="hidden md:flex items-stretch rounded-lg overflow-hidden">
          {/* Left - Top Categories */}
          <div className="w-1/5 bg-[#FF6F22] text-white flex flex-col">
            <h3 className="text-white font-bold text-center text-[14px] uppercase py-5 bg-black">
              Top Categories
            </h3>
            <ul
              className={`flex flex-col max-h-[335px] custom-scrollbar overflow-y-auto py-3 px-4 gap-4`}
            >
              {[...categories]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category, index) => (
                  <li
                    key={index}
                    className="flex items-center text-[15px] font-medium gap-5 cursor-pointer"
                    onClick={() => {
                      if (category.name.toLowerCase() === "services") {
                        return navigate("/services");
                      }
                      handleNavigation(category.id, category.name);
                    }}
                  >
                    <img
                      src={category.img}
                      alt={category.name}
                      className="w-[18px] h-[18px] object-contain"
                    />
                    {category.name}
                  </li>
                ))}
            </ul>
          </div>

          <div className="w-4/5">
            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 3000 }}
              loop={true}
              className="w-full h-[400px]"
            >
              {slides.map((slide, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={slide.desktopImage}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Mobile View - Swiper (Removed as per prompt) */}
        <div className="block md:hidden mt-2 mx-1">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3000 }}
            loop={true}
            className="w-full rounded-xl overflow-hidden shadow-lg"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-48 sm:h-56 bg-red-200 flex items-center justify-cente r">
                  <img
                    src={slide.mobileImage}
                    alt={`Mobile Slide ${index + 1}`}
                    className="size-full object-cover rounded-lg"
                    loading="lazy"
                    style={{
                      filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default MyComponent;
