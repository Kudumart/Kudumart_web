import React, { useEffect, useState } from 'react';
import AdminAdverts from "../../../components/AdminAdverts";
import Loader from '../../../components/Loader';
import useApiMutation from '../../../api/hooks/useApiMutation';


const App = () => {

    const [advertData, setAdverts] = useState([]);
    const [allAdverts, setAllAdverts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});

    const { mutate } = useApiMutation();

    const fetchData = async (page) => {
        setLoading(true)
        try {
            const advertRequest = new Promise((resolve, reject) => {
                mutate({
                    url: `/admin/general/adverts?page=${page}`,
                 hideToast: true,
                        method: 'GET',
                    headers: true,
                   onSuccess: (response) => resolve(response.data),
                    onError: reject,
                });
            });

            const allAdvertRequests = new Promise((resolve, reject) => {
                mutate({
                    url: `/admin/general/adverts?page=1&limit=10000000000`,
                 hideToast: true,
                        method: 'GET',
                    headers: true,
                   onSuccess: (response) => resolve(response.data),
                    onError: reject,
                });
            });

            const [adverts, allAdverts] = await Promise.all([
                advertRequest,
                allAdvertRequests
            ]);

            setAdverts(adverts.data);
            setAllAdverts(allAdverts.data);
            setPagination(adverts.pagination);
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
            <AdminAdverts data={advertData} totalData={allAdverts} loading={loading} paginate={pagination} refetch={(page) => fetchData(page)} />
        </div>
    );
};

export default App;
