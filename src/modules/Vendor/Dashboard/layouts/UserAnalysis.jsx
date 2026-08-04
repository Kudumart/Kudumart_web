import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../../api/apiFactory";

const UserAnalysis = () => {
    const query = useQuery({
        queryKey: ["vendorDashboardStats"],
        queryFn: async () => {
            const response = await apiClient.get("/vendor/dashboard/stats");
            return response.data;
        },
    });

    const breakdown = query.data?.data?.productStatusBreakdown ?? { active: 0, draft: 0, inactive: 0 };
    const total = breakdown.active + breakdown.draft + breakdown.inactive;
    const activePercent = total > 0 ? Math.round((breakdown.active / total) * 100) : 0;
    const activeDash = total > 0 ? (breakdown.active / total) * 100 : 0;

    return (
        <>
            <div className="md:px-5 px-2 py-7 md:rounded-lg bg-white shadow shadow-md">
                <div className="flex lg:flex-row md:flex-row flex-col lg:gap-0 md:gap-0 gap-3 justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Product Analytics</h3>
                </div>
                <div className="py-1 mt-5 rounded-lg border border-mobiBorderTable px-3 flex flex-col items-center">
                    <div style={{ position: 'relative', width: '300px', height: '300px' }}>
                        <svg width="300" height="300" viewBox="0 0 42 42" className="donut-chart">
                            <circle
                                className="donut-ring"
                                cx="21"
                                cy="21"
                                r="15.91549431"
                                fill="transparent"
                                stroke="#D1D1D1"
                                strokeWidth="8"
                            ></circle>
                            <circle
                                className="donut-segment"
                                cx="21"
                                cy="21"
                                r="15.91549431"
                                fill="transparent"
                                stroke="rgba(255, 111, 34, 1)"
                                strokeWidth="8"
                                strokeDasharray={`${activeDash} ${100 - activeDash}`}
                                strokeDashoffset="25"
                            ></circle>
                        </svg>

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
                            <div>{query.isLoading ? "..." : `${activePercent}%`}</div>
                            <div>(Active Products)</div>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-4 text-sm text-gray-600">
                        <span>Active: {breakdown.active}</span>
                        <span>Draft: {breakdown.draft}</span>
                        <span>Inactive: {breakdown.inactive}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserAnalysis;
