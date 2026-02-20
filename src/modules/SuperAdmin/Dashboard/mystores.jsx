import React, { useEffect, useState } from 'react';
import MyStores from "../../../components/MyStore";
import Loader from '../../../components/Loader';
import useApiMutation from '../../../api/hooks/useApiMutation';

const App = () => {
    const [storesData, setAllStores] = useState([]);
    const [loading, setLoading] = useState(true);

    const { mutate } = useApiMutation();

    const fetchData = async () => {
        try {
            const storesRequest = new Promise((resolve, reject) => {
                mutate({
                    url: '/admin/store',
                    method: 'GET',
                    headers: true,
                    hideToast: true,
                    onSuccess: (response) => resolve(response.data.data),
                    onError: reject,
                });
            });
            const [stores] = await Promise.all([
                storesRequest,
            ]);

            setAllStores(stores)
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchData();
    }, []);


    return (
        <div className="min-h-screen">
            {loading ? (
                <div className="w-full h-screen flex items-center justify-center">
                    <Loader />
                </div>
            ) : (
                <MyStores data={storesData} refetch={() => fetchData()} />
            )
            }
        </div>
    );
};

export default App;
