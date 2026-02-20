import Imgix from "react-imgix";
import './style.css';
export default function GetApp() {
    return (
        <>
            <div className="relative flex flex-col w-full mx-auto bg-transparent">
                {/* Foreground Content */}
                <div className="relative flex flex-col md:flex-row items-center justify-between w-full h-full px-6 z-10">

                    {/* Left Section: Text & Button */}
                    <div className="flex flex-col justify-center text-center md:text-left md:w-1/2 max-w-md">
                        <h2 className="text-2xl md:text-4xl font-semibold text-white leading-snug">
                            Get the App
                        </h2>
                        <p className="text-white text-base md:text-lg mt-4 leading-loose">
                            Buy and sell with Kudu, where convenience meets quality.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                            {/* Google Play Button */}
                            <button
                                onClick={() => window.open("https://play.google.com/store/apps/details?id=com.kudu.app&hl=en", "_blank")}
                                className="hover:scale-105 transition-transform duration-200"
                            >
                                <img
                                    src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1737404439/Frame_23_x0rtk4.png"
                                    alt="Google Play"
                                    className="w-24 sm:w-10 md:w-40 mb-4 sm:mb-2"
                                    draggable="false"
                                />
                            </button>
                            {/* App Store Button */}
                            <button
                                onClick={() => window.open("https://apps.apple.com/app/6746808658", "_blank")}
                                className="hover:scale-105 transition-transform duration-200"
                            >
                                <img
                                    src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1737404439/Frame_24_jfspqy.png"
                                    alt="App Store"
                                    className="w-24 sm:w-10 md:w-40 mb-4 sm:mb-2"
                                    draggable="false"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Right Section: Image */}
                    <div className="relative flex items-center justify-center w-full md:w-1/2">
                        <img
                            src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1737404892/Group_1321314900_l9puj7.png"
                            alt="App Illustration"
                            className="object-contain w-3/4 sm:w-full md:w-full"
                        />
                    </div>
                </div>
            </div>


        </>
    )
}