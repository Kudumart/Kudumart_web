import React, { useEffect, useState } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { Button } from "@material-tailwind/react";
import AllStore from "../components/AllStores";
import Loader from "../../../components/Loader";
import { useNavigate } from "react-router-dom";

const Stores = () => {
  const [storesData, setAllStores] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const { mutate } = useApiMutation();

  const fetchData = async (page) => {
    setLoading(true);
    setError(null);

    try {
      const storesRequest = new Promise((resolve, reject) => {
        mutate({
          url: `/vendor/store`,
          method: "GET",
          headers: true,
          hideToast: true,
          onSuccess: (response) => {
            resolve(response.data);
          },
          onError: (error) => {
            // Handle 404 as empty state, not error
            if (
              error.response?.status === 404 ||
              error.message?.includes("No stores found")
            ) {
              console.log("No stores found for vendor - showing empty state");
              resolve({ data: [], pagination: {} });
            } else {
              reject(error);
            }
          },
        });
      });
      const [stores] = await Promise.all([storesRequest]);

      setAllStores(stores.data || []);

      // Handle pagination if provided by backend
      if (stores.pagination) {
        setPagination(stores.pagination);
      }
    } catch (error) {
      console.error("Error fetching vendor stores data:", error);
      setError(error.message || "Failed to load stores");
      setAllStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  return (
    <>
      {loading ? (
        <div className="w-full h-screen flex items-center justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg w-full shadow">
          <h2 className="text-lg font-bold p-6">Stores</h2>
          <div className="w-full h-px border" />
          <div className="mt-5 p-6">
            <div className="text-center">
              <div className="text-red-500 text-lg font-semibold mb-4">
                Error Loading Stores
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                className="bg-kudu-orange text-white"
                onClick={() => fetchData(1)}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg w-full shadow">
          <h2 className="text-lg font-bold p-6">Stores</h2>
          <div className="w-full h-px border" />
          <div className="mt-5">
            {storesData.length > 0 ? (
              <AllStore
                data={storesData}
                allData={storesData}
                paginate={pagination}
                refetch={(page) => fetchData(page)}
              />
            ) : (
              <div className="empty-store bg-white rounded-lg p-8">
                <div className="text-center">
                  <img
                    src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
                    alt="Empty Store Illustration"
                    className="w-80 h-80 mx-auto"
                  />
                </div>
                <h1 className="text-center text-lg font-bold mb-4">
                  No Store Found
                </h1>
                <div className="text-center text-gray-600 mb-6">
                  <p>
                    You haven't created any stores yet. Start selling by
                    creating your first store!
                  </p>
                </div>
                <div className="text-center">
                  <button
                    data-theme="kudu"
                    className="btn btn-primary"
                    onClick={() => navigate("create")}
                  >
                    Add New Store
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Stores;
