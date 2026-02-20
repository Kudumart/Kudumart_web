const UserAnalysis = ({ usersLength, vendorsLength }) => {

    const percentageCustomers = usersLength / (usersLength + vendorsLength) * 100 || 0;
    const percentageVendors = vendorsLength / (vendorsLength + usersLength) * 100 || 0;


    return (
        <>
            <div className="md:px-5 px-2 pt-6 pb-12 md:rounded-lg bg-white">
                <div className="flex lg:flex-row md:flex-row flex-col lg:gap-0 md:gap-0 gap-3 justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">User Analysis</h3>
                    <div className="flex space-x-2">
                        {/* <button className="px-2 py-2 flex gap-2 rounded-md" style={{ backgroundColor: 'rgba(10, 19, 48, 1)' }}>
                            <p className='text-xs text-white'>2025</p>
                            <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.8">
                                    <path d="M4.87769 6.34473L8.97329 10.4403L13.0689 6.34473" stroke="#AEB9E1" strokeWidth="1.3652" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                            </svg>
                        </button> */}
                    </div>
                </div>
                <div className="py-2 rounded-lg border border-mobiBorderTable px-3">
                    <div className="mx-4" style={{ position: 'relative', width: '300px', height: '300px' }}>
                        {/* SVG Donut Chart */}
                        <svg width="300" height="300" viewBox="0 0 42 42" className="donut-chart">
                            {/* Vendor Segment */}
                            <circle
                                cx="21"
                                cy="21"
                                r="15.91549431"
                                fill="transparent"
                                stroke="#FF6F22"
                                strokeWidth="4"
                                strokeDasharray={`${percentageVendors} ${100 - percentageVendors}`}
                                strokeDashoffset="25"
                                transform="rotate(-90 21 21)" // Start from the top
                            />
                            {/* Customer Segment */}
                            <circle
                                cx="21"
                                cy="21"
                                r="15.91549431"
                                fill="transparent"
                                stroke="#7F7F7F"
                                strokeWidth="4"
                                strokeDasharray={`${percentageCustomers} ${100 - percentageCustomers}`}
                                strokeDashoffset={`calc(25 - ${percentageVendors})`} // Position after vendor arc
                                transform="rotate(-90 21 21)" // Start from the top
                            />
                        </svg>

                        {/* Center text */}
                        {percentageCustomers > 0 || percentageVendors > 0 ?
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '15px',
                                color: '#000',
                                textAlign: 'center',
                            }}>
                                <div>{percentageCustomers > percentageVendors ? Math.round(percentageCustomers) : Math.round(percentageVendors)}%</div>
                                <div>{percentageCustomers > percentageVendors ? 'Customers' : 'Vendors'}</div>
                            </div>
                            :
                            <></>
                        }
                    </div>

                    <div className="flex justify-center w-full gap-6">
                        <div className="flex gap-2">
                            <span className="w-3 h-3 mt-1 rounded-full bg-[#7F7F7F]"></span>
                            <span className="text-sm font-medium">Customers ({Math.round(percentageCustomers)}%)</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 mt-1 rounded-full bg-[#FF6F22]"></span>
                            <span className="text-sm font-medium">Vendors ({Math.round(percentageVendors)}%)</span>
                        </div>
                    </div>
                </div></div>
        </>
    );
};

export default UserAnalysis;
