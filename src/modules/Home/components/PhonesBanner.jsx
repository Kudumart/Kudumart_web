const PhonesBanner = () => {
    return (
        <>

            <div className="flex flex-col md:flex-row items-center justify-between relative w-full min-w-screen-xl mx-auto h-auto md:h-60">
                {/* Background section with equal split */}
                <div className="flex flex-row w-full h-full gap-5">
                    <div className="bg-kudu-sky-blue w-1/2 p-6 md:h-[300px] h-[280px] lg:h-full"></div>
                    <div className="w-1/2 md:h-full h-[280px]" style={{ backgroundColor: "rgba(100, 158, 255, 1)" }}></div>
                </div>

                {/* Content section */}
                <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between px-6 py-8 md:py-0 w-full">
                    {/* Left text and button section */}
                    <div className="w-1/2 flex flex-col justify-center md:items-start items-center text-center md:text-left gap-4 px-6">
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                            Upgrade to the best of the digital age
                        </h2>
                        <button className="px-6 py-3 flex md:text-lg text-base gap-2 font-semibold justify-center text-black border border-black transition duration-300 ease-in-out">
                            <p className="flex">SHOP TECH</p>
                            <span className="flex flex-col justify-center h-full">
                                <svg width="27" height="13" viewBox="0 0 27 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M26.5 6.5L16.5 0.726497V12.2735L26.5 6.5ZM0.5 7.5H17.5V5.5H0.5V7.5Z" fill="#000" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    {/* Right image section */}
                    <div className="w-1/2 flex justify-center items-center relative">
                        <img src="https://res.cloudinary.com/do2kojulq/image/upload/v1735426588/kudu_mart/game_console_mytxfs.png"
                            alt="console" className="w-1/3 md:w-1/4 object-contain" />
                        <img src="https://res.cloudinary.com/do2kojulq/image/upload/v1735426594/kudu_mart/phone_pack_w5hyn3.png"
                            alt="phone pack" className="w-1/3 md:w-1/4 object-contain" />
                    </div>
                </div>
            </div>

        </>
    );
};

export default PhonesBanner;
