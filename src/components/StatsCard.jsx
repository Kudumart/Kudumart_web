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
        className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-5 shadow-[0_8px_28px_rgba(15,23,42,.045)]"
        style={style}
    >
        {/* Left Section */}
        <div className="flex flex-col gap-2">
            <span
                className={`${
                    cronTop
                        ? 'text-sm text-[] font-semibold'
                        : 'text-2xl font-bold tracking-tight text-slate-900'
                } flex gap-1`}
            >
                {cronTopIcon} {cronTop ? label : number}
            </span>
            <span
                className={`${
                    cronTop
                        ? 'text-xl font-bold text-mobiDarkCloud'
                        : 'text-xs font-semibold uppercase tracking-wide text-slate-500'
                } flex gap-2`}
            >
                {cronTop ? number : label}
                {cronAnalytics}
            </span>
        </div>

        {/* Right Icon Section */}
        <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconColor}`}
        >
            {IconComponent}
        </div>
    </div>
    );
};

export default StatCard
