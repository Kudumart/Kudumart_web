const UserAnalysis = () => {
    return (
        <>
            <div className="md:px-5 px-2 py-7 md:rounded-lg bg-white shadow shadow-md">
                <div className="flex lg:flex-row md:flex-row flex-col lg:gap-0 md:gap-0 gap-3 justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Product Analytics</h3>
                    <div className="flex space-x-2">
                        <button className="px-2 py-2 flex gap-2 rounded-md" style={{ backgroundColor: 'rgba(10, 19, 48, 1)' }}>
                            <p className='text-xs text-white'>2024</p>
                            <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.8">
                                    <path d="M4.87769 6.34473L8.97329 10.4403L13.0689 6.34473" stroke="#AEB9E1" strokeWidth="1.3652" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="py-1 mt-5 rounded-lg border border-mobiBorderTable px-3">
                    <div style={{ position: 'relative', width: '300px', height: '300px' }}>
                        {/* SVG Donut Chart */}
                        <svg width="300" height="300" viewBox="0 0 42 42" className="donut-chart">
                            {/* First Segment (Individual - 40%) */}
                            <circle
                                className="donut-segment"
                                cx="21"
                                cy="21"
                                r="15.91549431"
                                fill="transparent"
                                stroke="#000000"
                                strokeWidth="4" // Smaller stroke width for Individual
                                strokeDasharray="40 60" // 40% and 60% of the circle
                                strokeDashoffset="65"   // Rotate the circle to position it correctly
                            ></circle>

                            {/* Background Circle (Organisation - 60%) */}
                            <circle
                                className="donut-ring"
                                cx="21"
                                cy="21"
                                r="15.91549431"
                                fill="transparent"
                                stroke="rgba(255, 111, 34, 0.7)"
                                strokeWidth="8" // Organisation stroke width
                                strokeDasharray="60 40" // Organisation covers 60%, leaving 40% as a gap
                                strokeDashoffset="25"
                            ></circle>
                        </svg>

                        {/* Center text */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '16px',
                            color: '#000',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}>
                            <div>60%</div>
                            <div>(New Products)</div>
                        </div>
                    </div>
                </div></div>
        </>
    );
};

export default UserAnalysis;
