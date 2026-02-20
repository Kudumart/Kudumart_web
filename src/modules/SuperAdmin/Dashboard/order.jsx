import React, { useEffect, useState } from 'react';
import OrderTable from "../../../components/OrderTable";
import useApiMutation from '../../../api/hooks/useApiMutation';

const App = () => {

    const { mutate } = useApiMutation();
    const [orders, setOrdersData] = useState([]);
    const [loading, setLoading] = useState(true);


    const getOrders = () => {
        mutate({
          url: `/admin/general/orders`,
          method: "GET",
          headers: true,
          hideToast: true,
          onSuccess: (response) => {
           setOrdersData(response.data.data);
           setLoading(false);
          },
          onError: () => {
            setLoading(false)
          }
        });
      }
    
      useEffect(() => {
        getOrders();
      }, []);



    return (
        <div className="min-h-screen">
            <OrderTable data={orders} loading={loading} />
        </div>
    );
};

export default App;
