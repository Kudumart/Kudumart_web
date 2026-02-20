const StatCard = ({ number, label, iconColor, IconComponent, colorGradient, cronTop, cronTopIcon,cronAnalytics }) => {
    let style = null;
    if (colorGradient) {
        style = {
            boxShadow: `-0.5px -1px 0px ${colorGradient[0]}, 0 0px 1px ${colorGradient[1]}`,
            borderRadius: '10px !important',
        };
    }

    return (
        <div
        className="bg-white rounded-md py-6 px-4 w-full flex items-center justify-between"
        style={style}
    >
        {/* Left Section */}
        <div className="flex flex-col gap-3">
            <span
                className={`${
                    cronTop
                        ? 'text-sm text-[] font-semibold'
                        : 'text-mobiRomanSilver text-xl font-bold text-[#7F7F7F]'
                } flex gap-1`}
            >
                {cronTopIcon} {cronTop ? label : number}
            </span>
            <span
                className={`${
                    cronTop
                        ? 'text-xl font-bold text-mobiDarkCloud'
                        : 'text-sm font-semibold text-gray-600'
                } flex gap-2`}
            >
                {cronTop ? number : label}
                {cronAnalytics && (
                    <span className="text-xs font-medium bg-green-100 text-green-600 rounded-md px-2 py-0.5 flex items-center">
                        {growth}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-3 h-3 ml-1"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                        </svg>
                    </span>
                )}
            </span>
        </div>

        {/* Right Icon Section */}
        <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${iconColor}`}
        >
            {IconComponent}
        </div>
    </div>
    );
};

export default StatCard