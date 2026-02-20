import { Link } from "react-router-dom";

export default function DownloadApp() {
  const handleAndroidDownload = () => {
    window.open("https://play.google.com/store/apps/details?id=com.kudu.app&hl=en", "_blank");
  };

  const handleiOSDownload = () => {
    // iOS link not available yet - show coming soon message
    window.open("https://apps.apple.com/app/6746808658", "_blank");
  };

  return (
    <div className="pt-24 pb-12 bg-linear-to-br from-kudu-orange to-orange-600 min-h-screen px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Section - Content */}
            <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  Download the Kudu App
                </h1>
                <p className="text-base text-gray-600 mb-6 leading-relaxed">
                  Buy and sell with convenience. Get the best deals and quality products 
                  right at your fingertips with the Kudu mobile app.
                </p>
                
                {/* Features */}
                <div className="mb-6 text-left">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Why use the Kudu App?</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">Swift delivery care</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">24/7 Customer support</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">Secure transactions</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">Easy navigation & search</span>
                    </li>
                  </ul>
                </div>

                {/* Download Buttons - Home page style */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  <button
                    onClick={handleAndroidDownload}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <img
                      src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1737404439/Frame_23_x0rtk4.png"
                      alt="Google Play"
                      className="w-32 h-auto"
                      draggable="false"
                    />
                  </button>
                  <button
                    onClick={handleiOSDownload}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <img
                      src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1737404439/Frame_24_jfspqy.png"
                      alt="App Store"
                      className="w-32 h-auto"
                      draggable="false"
                    />
                  </button>
                </div>

                {/* Back to Home */}
                <div className="mt-4">
                  <Link 
                    to="/" 
                    className="inline-flex items-center text-kudu-orange hover:text-orange-600 transition-colors duration-200 text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Section - App Preview */}
            <div className="lg:w-1/2 bg-linear-to-br from-kudu-orange/10 to-orange-100 p-6 lg:p-8 flex items-center justify-center">
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1737404892/Group_1321314900_l9puj7.png"
                  alt="Kudu App Preview"
                  className="object-contain w-full max-w-xs lg:max-w-sm"
                  draggable="false"
                />
                {/* Floating elements for visual appeal */}
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <svg className="w-4 h-4 text-kudu-orange" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -bottom-2 -left-2 bg-white rounded-full p-2 shadow-lg">
                  <svg className="w-4 h-4 text-kudu-orange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
