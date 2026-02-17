import './style.css';

export default function PreviewSection() {
    return (
        <>
            <div className="relative w-full overflow-hidden bg-white">
                <div className="w-full flex flex-col gap-2 justify-center items-center">
                    {/* Header Section */}
                    <div className="md:w-1/3 w-full flex flex-col gap-5 z-10">
                        <img src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1737059210/Screenshot_2025-01-16_at_9.26.37_PM_mv3pvc.png" alt="" width="100%"
                            className="w-full h-full object-cover"
                            draggable="false" />
                    </div>
                    <p className="text-base text-center">
                        Do more with Kudu Mart today, sign up and let’s get started!
                    </p>
                </div>

                {/* Card Section */}
                <div className="w-full flex md:flex-row flex-col gap-5 z-0 mt-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 mt-14 md:mb-10 md:mx-2 gap-8" style={{ position: "relative" }}>
                        {/* Auction Card */}
                        <div
                            className="h-full w-full Box"
                            style={{
                                border: "1px solid transparent",
                            }}
                        >
                            <div
                                className="transform"
                            >
                                <div className="w-full flex justify-center">
                                    <img
                                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1737481788/kuduMart/wired-outline-1339-sale-hover-roll_cuouey.gif"
                                        alt="Auction Icon"
                                        className="w-[100px] h-[100px]"
                                    />
                                </div>
                                <div className="w-full flex mt-3 justify-center">
                                    <p className="md:text-1xl text-lg text-center font-semibold">Auction</p>
                                </div>
                                <div className="w-full flex mt-4 justify-center">
                                    <p className="text-base leading-loose text-center">
                                        You can auction what you want to sell and have people bid for it. Then the highest bidder goes home with it.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sell Anything Card */}
                        <div
                            className=" h-full w-full Box bg-white"
                        >
                            <div
                                className=""
                            >
                                <div className="w-full flex justify-center">
                                    <img
                                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1737481790/kuduMart/wired-outline-139-basket-hover-oscillate-empty_c3tltg.gif"
                                        alt="Sell Anything Icon"
                                        className="w-[100px] h-[100px]"
                                    />
                                </div>
                                <div className="w-full flex mt-3 justify-center">
                                    <p className="md:text-1xl text-lg text-center font-semibold">Sell Anything</p>
                                </div>
                                <div className="w-full flex mt-4 justify-center">
                                    <p className="text-base leading-loose text-center">
                                        You can sell any item eg; cars, devices, and more in any condition, refurbished, new, and used.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bid Your Price Card */}
                        <div
                            className="h-full w-full Box
                            bg-white"
                        >
                            <div
                                className=""
                            >
                                <div className="w-full flex justify-center">
                                    <img
                                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1737481789/kuduMart/wired-outline-298-coins-hover-spending_nhci8u.gif"
                                        alt="Bid Your Price Icon"
                                        className="w-[100px] h-[100px]"
                                    />
                                </div>
                                <div className="w-full flex mt-3 justify-center">
                                    <p className="md:text-1xl text-lg text-center font-semibold">Bid Your Price</p>
                                </div>
                                <div className="w-full flex mt-4 justify-center">
                                    <p className="text-base leading-loose text-center">
                                        Place a bid on products you want to buy and stand a chance to go home with it as the highest bidder.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </>
    );
}