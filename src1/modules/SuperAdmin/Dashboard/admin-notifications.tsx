import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../hooks/appState";
import apiClient from "../../../api/apiFactory";
import { SimplePagination } from "../../../components/SimplePagination";

// Removed unused interface as per diagnostic error
interface NotificationsResponse {
  data: [];
  pagination: {
    total: number;
    // Add other pagination properties if they exist
  };
}
// Removed unused interface as per diagnostic error
// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   read: boolean;
// }

export default function AdminNotifications() {
  const paginate = usePagination();

  const notifications = useQuery<NotificationsResponse>({
    queryKey: ["notifications", paginate.params],
    queryFn: async () => {
      const response = await apiClient.get("admin/notifications", {
        params: { ...paginate.params },
      });
      // Assuming response.data has a 'data' property for the array and 'pagination' property for pagination info
      return response.data;
    },
    // Optional: Add staleTime and refetchInterval for better UX
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Adjust as needed
  });

  // Destructure data from the query result for cleaner access
  const { data, isLoading, isError } = notifications;

  return (
    <div className="container mx-auto p-6" id="root" data-theme="kudu">
      <h1 className="text-3xl font-bold mb-6">Admin Notifications</h1>

      {isLoading && <p className="text-blue-500">Loading notifications...</p>}
      {isError && (
        <p className="text-red-500">
          Error fetching notifications. Please try again later.
        </p>
      )}

      {!isLoading && !isError && data?.data?.length === 0 && (
        <p className="text-gray-600">No notifications found.</p>
      )}

      {data?.data && data.data.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {data.data.map((notification: any, index: number) => (
              <li
                key={index}
                className="p-4 hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                <div className="flex justify-between items-center">
                  <p className="text-gray-800">
                    {notification.message || `Notification ${index + 1}`}
                  </p>
                  {/* Add more details if available in notification object, e.g., timestamps */}
                  {/* {notification.timestamp && <span className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</span>} */}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <SimplePagination
        total={data?.pagination?.total || 0}
        paginate={paginate}
      />
    </div>
  );
}
