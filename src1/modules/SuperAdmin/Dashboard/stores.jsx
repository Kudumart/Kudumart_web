import React, { useEffect, useState } from 'react';
import AllStores from "../../../components/AllStore";
import useApiMutation from '../../../api/hooks/useApiMutation';
import Loader from '../../../components/Loader';

const App = () => {
    const [storesData, setStores] = useState([]);
    const [allStores, setAllStores] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

    const { mutate } = useApiMutation();

    const fetchData = async (page) => {
        setLoading(true);
        try {
            const storesRequest = new Promise((resolve, reject) => {
                mutate({
                    url: `/admin/general/stores?page=${page}`,
                    method: 'GET',
                    headers: true,
                    hideToast: true,
                    onSuccess: (response) => resolve(response.data),
                    onError: reject,
                });
            });

            const allStoresRequest = new Promise((resolve, reject) => {
                mutate({
                    url: `/admin/general/stores?page=1&limit=10000000000`,
                    method: 'GET',
                    headers: true,
                    hideToast: true,
                    onSuccess: (response) => resolve(response.data),
                    onError: reject,
                });
            });

            const [stores, allStores] = await Promise.all([
                storesRequest,
                allStoresRequest,
            ]);

            setAllStores(allStores.data);
            setStores(stores.data);
            setPagination(stores.pagination);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchData(1);
    }, []);

    return (
        <div className="min-h-screen">
            <AllStores data={storesData} totalData={allStores} loading={loading} paginate={pagination} refetch={(page) => fetchData(page)} />
        </div>
    );
};

export default App;
