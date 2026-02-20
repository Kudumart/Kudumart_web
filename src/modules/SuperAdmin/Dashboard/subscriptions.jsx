import { useState } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Loader from "../../../components/Loader";
import { useEffect } from "react";
import SubscriptionTable from "../../../components/SubscriptionsTable";

const Subscription = () => {
    const { mutate } = useApiMutation();
    const [subscriptions, setSubscriptionData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getSubscriptions = () => {
        mutate({
          url: `/admin/subscription/plans`,
          method: "GET",
          headers: true,
          hideToast: true,
          onSuccess: (response) => {
           setSubscriptionData(response.data.data);
           setLoading(false);
          },
          onError: () => {
            setLoading(false)
          }
        });
      }
    
      useEffect(() => {
        getSubscriptions();
      }, []);
    
      return (
        <div className="min-h-screen">
          {loading ?
            <div className="w-full h-screen flex items-center justify-center">
              <Loader />
            </div>
            :
            <SubscriptionTable data={subscriptions} refetch={() => getSubscriptions()} loading={loading} />
          }
        </div>
      );
};

export default Subscription;