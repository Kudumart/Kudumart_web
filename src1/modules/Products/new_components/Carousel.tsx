import { Carousel } from "@material-tailwind/react";
import { Product } from "../../../types";
import PricingVariants from "./PricingVariants";

export default function ProductInfo({ product }: { product: Product }) {
  return (
    <div>
      <div className="w-full h-96">
        {/*//@ts-ignore*/}
        <Carousel
          className="rounded-xl bg-white shadow-lg"
          autoplay
          loop
          navigation={({ setActiveIndex, activeIndex, length }) => (
            <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
              {new Array(length).fill("").map((_, i) => (
                <span
                  key={i}
                  className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
                    activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
                  }`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}
          prevArrow={({ handlePrev }) => (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800/80 text-white transition hover:bg-gray-900/90"
            >
              ◀
            </button>
          )}
          nextArrow={({ handleNext }) => (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800/80 text-white transition hover:bg-gray-900/90"
            >
              ▶
            </button>
          )}
        >
          {product.additional_images.map((image, index) => (
            <>
              <img
                src={image}
                alt="image 1"
                className="h-full w-full bg-transparent object-contain"
              />
            </>
          ))}
        </Carousel>
      </div>
      <section className="mt-4 bg-base-100 ring p-4 rounded-box ring-current/20 shadow-xl space-y-2">
        <h2 className="md:text-xl text-lg font-bold">{product.name}</h2>
        <div className="md:hidden">
          <PricingVariants product={product} />
        </div>
        <div className="divider" />
        <div className="grid  gap-4">
          <div>
            <h3 className="font-semibold">CONDITION</h3>
            <p>{product.condition}</p>
          </div>
          <div>
            <h3 className="font-semibold">DESCRIPTION</h3>
            <div
              className="max-w-full wrap-anywhere [&_img]:max-h-96"
              dangerouslySetInnerHTML={{ __html: product.description }}
            ></div>
          </div>
          {/*<div>
            <h3 className="font-semibold">SPECIFICATION</h3>
            <p>{product.specification}</p>
          </div>*/}
          <div>
            <h3 className="font-semibold">RETURN POLICY</h3>
            <p>{product.return_policy || "No return policy"}</p>
          </div>
          <div>
            <h3 className="font-semibold">WARRANTY</h3>
            <p>{product.warranty || "No warranty"}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">STORE LOCATION</h3>
          {product.store?.location ? (
            <p>
              {product.store.location.address}, {product.store.location.city},{" "}
              {product.store.location.state}, {product.store.location.country}
            </p>
          ) : (
            <p>Location not available</p>
          )}
        </div>
      </section>
    </div>
  );
}
