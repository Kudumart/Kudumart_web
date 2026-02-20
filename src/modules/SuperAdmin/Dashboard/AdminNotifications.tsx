import { useNavigate } from "react-router-dom";

export default function AdminNotifications() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-gray-600 text-lg mb-6">Nothing found here.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-kudu-orange text-white rounded-md transition-colors duration-200 font-medium shadow"
        >
          Return to previous page
        </button>
      </div>
    </div>
  );
}
