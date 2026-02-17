export default function ShoppingExperience() {
    return (
        <>
            <div className="flex w-full flex-col md:gap-8 gap-5 py-5">
                <div className="flex w-full flex-col gap-2 md:gap-4 justify-center items-center">
                    <p className="md:text-3xl text-base font-semibold text-center flex">
                        Enjoy A Smooth Shopping Experience
                    </p>
                    <p className="text-base text-center text-black flex">
                        Buy and sell with Kudu, where convenience meet quality
                    </p>
                </div>
                <div className="grid w-full md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
                    <div className="w-full flex flex-col mt-3 py-3 items-center gap-2 justify-center">
                        <img
                            src="https://res.cloudinary.com/do2kojulq/image/upload/v1735561313/kudu_mart/truck_3d_zqctuq.png"
                            alt="truck_3d"
                            className="max-w-[80px] max-h-[70px] md:max-w-[200px] md:max-h-[200px] object-contain"
                        />
                        <p className="lg:text-lg text-base font-bold leading-loose text-center flex">
                            Safe Delivery
                        </p>
                        <p className="text-center text-base leading-loose text-black flex">
                        Experience secure and reliable delivery services right to your doorstep
                        </p>
                    </div>

                    <div className="w-full flex flex-col mt-3 py-3 items-center gap-2 justify-center">
                        <img
                            src="https://res.cloudinary.com/do2kojulq/image/upload/v1735561313/kudu_mart/money_3d_lwqctf.png"
                            alt="truck_3d"
                            className="max-w-[70px] max-h-[70px] md:max-w-[200px] md:max-h-[200px] object-contain"
                        />
                        <p className="md:text-lg text-base font-bold leading-loose text-center flex">
                            Swift Payment Methods
                        </p>
                        <p className="text-center text-base leading-loose text-black flex">
                        Enjoy quick and hassle-free payment options tailored for your convenience.
                        </p>
                    </div>

                    <div className="w-full flex flex-col mt-3 py-3 items-center gap-2 justify-center">
                        <img
                            src="https://res.cloudinary.com/do2kojulq/image/upload/v1735561313/kudu_mart/customer_support_vevdp4.png"
                            alt="truck_3d"
                            className="max-w-[70px] max-h-[70px] md:max-w-[200px] md:max-h-[200px] object-contain"
                        />
                        <p className="md:text-lg text-base font-bold leading-loose text-center flex">
                            24/7 Customer Support
                        </p>
                        <p className="text-center text-base leading-loose text-black flex">
                        Reach out to us anytime, anywhere, with our round-the-clock support team.
                        </p>
                    </div>

                    <div className="w-full flex flex-col mt-3 py-3 items-center gap-2 justify-center">
                        <img
                            src="https://res.cloudinary.com/do2kojulq/image/upload/v1735561313/kudu_mart/court_3d_xpdhmi.png"
                            alt="truck_3d"
                            className="max-w-[70px] max-h-[70px] md:max-w-[200px] md:max-h-[200px] object-contain"
                        />
                        <p className="md:text-lg text-base font-bold leading-loose text-center flex">
                            Bidding Opportunity
                        </p>
                        <p className="text-center text-base leading-loose text-black flex">
                        Take advantage of exciting bidding opportunities and grab the best deals.
                        </p>
                    </div>

                </div>
            </div>
        </>
    )
}