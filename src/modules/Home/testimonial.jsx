import React from "react";
import { useGetTestimonialsClient } from "../../api/pages/testimonials";
import Loader from "../../components/Loader";

const Testimonials = () => {
  // const testimonials = [
  //     {
  //         text: "Kudu Mart has been a game-changer for my business. The ability to auction products and sell services in one place is incredible. I’ve gained so many new customers!",
  //         name: "Engr Chukka Uzo",
  //         role: "Small Business Owner",
  //         image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1738014181/image_vvmcp3.png",
  //         bgColor: "bg-white",
  //     },
  //     {
  //         text: "I was looking for a reliable platform to sell my physical products, and Kudu Mart exceeded my expectations. The vetting process ensures quality, and the sales have been steady. I highly recommend it!",
  //         name: "Amaka Claire",
  //         role: "Vendor",
  //         image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1738014181/image_vvmcp3.png",
  //         bgColor: "bg-black text-white",
  //     },
  //     {
  //         text: "Buying on Kudu is seamless and stress-free. I’ve even scored some amazing deals on auctions. It’s now my go-to platform for online shopping!",
  //         name: "Kemi Folarin",
  //         role: "Verified Seller",
  //         // image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1738014181/image_vvmcp3.png",

  //     },
  // ];

  const { data: testimonials, isLoading } = useGetTestimonialsClient();

  if (isLoading)
    return (
      <div className="py-40">
        <Loader />
      </div>
    );

  return (
    <>
      <div className="w-full flex flex-col">
        <section
          className="breadcrumb"
          style={{
            backgroundImage: `url(https://res.cloudinary.com/greenmouse-tech/image/upload/v1738013621/image_4_hwlvm2.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col py-12">
            <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
              <h1 className="text-4xl font-bold">Testimonials</h1>
            </div>
          </div>
        </section>
      </div>
      <div className="container mx-auto flex flex-col md:flex-row lg:px-20 md:px-2 sm:px-1 gap-8">
        <div className="py-12 px-6 bg-white">
          <div className="text-center mb-16 mt-8">
            <h2 className="text-2xl md:text-2xl font-bold text-black mb-4">
              Don't Just Take Our Word For It,
            </h2>
            <h3 className="text-base md:text-xl font-normal text-black">
              Listen to our Customers ✅
            </h3>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 Ju">
            {testimonials?.map((testimonial, index) => (
              <div
                key={index}
                className={`pr-4 pl-4 pt-8 pb-8 rounded-lg border `}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: testimonial?.message }}
                ></div>
                <div className="flex items-center mt-6">
                  <div>
                    <h4 className="text-base font-medium">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-orange-500 leading-loose">
                      {testimonial.position}
                    </p>
                  </div>
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full ml-20"
                  />
                </div>
              </div>
            ))}
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 Ju">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`pr-4 pl-4 pt-8 pb-8 rounded-lg border ${testimonial.bgColor}`}
              >
                <p className="text-sm leading-loose">{testimonial.text}</p>
                <div className="flex items-center mt-6">
                  <div>
                    <h4 className="text-base font-medium">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-orange-500 leading-loose">
                      {testimonial.role}
                    </p>
                  </div>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full ml-20"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 Ju">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`pr-4 pl-4 pt-8 pb-8 rounded-lg border ${testimonial.bgColor}`}
              >
                <p className="text-sm leading-loose">{testimonial.text}</p>
                <div className="flex items-center mt-6">
                  <div>
                    <h4 className="text-base font-medium">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-orange-500 leading-loose">
                      {testimonial.role}
                    </p>
                  </div>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full ml-20"
                  />
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Testimonials;
