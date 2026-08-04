import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../../api/apiFactory";
import StatCard from "../../../../components/StatsCard";

const DashboardStats = () => {
    const query = useQuery({
        queryKey: ["vendorDashboardStats"],
        queryFn: async () => {
            const response = await apiClient.get("/vendor/dashboard/stats");
            return response.data;
        },
    });

    const stats = query.data?.data;

    return (
        <div className="flex w-full lg:flex-row md:flex-row flex-col gap-4">
            <StatCard
                cronTop
                number={query.isLoading ? "..." : (stats?.totalSales ?? 0).toLocaleString()}
                label="Total Sales"
                iconColor="bg-mobiOrange"
                IconComponent={<img src="https://res.cloudinary.com/do2kojulq/image/upload/v1736412889/kudu_mart/money_gh4xfu.svg" alt="Sales" style={{ width: '22px' }} />}
            />
            <StatCard
                cronTop
                number={query.isLoading ? "..." : stats?.totalProducts ?? 0}
                label="Total Products"
                iconColor="bg-mobiSubPurple"
                IconComponent={<img src="https://res.cloudinary.com/do2kojulq/image/upload/v1736412891/kudu_mart/products_bajfry.svg" alt="Products" style={{ width: '20px' }} />}
            />
            <StatCard
                cronTop
                number={query.isLoading ? "..." : stats?.totalOrders ?? 0}
                label="Total Orders"
                iconColor="bg-mobiSkyCloud"
                IconComponent={<img src="https://res.cloudinary.com/do2kojulq/image/upload/v1736412889/kudu_mart/orders_fghfzk.svg" alt="Orders" style={{ width: '20px' }} />}
            />
        </div>
    );
};

export default DashboardStats;
