import React, { useEffect, useState } from 'react';
import AllStores from "../../../components/AllStore";
import useApiMutation from '../../../api/hooks/useApiMutation';
import Loader from '../../../components/Loader';

const App = () => {
    const [storesData, setStores] = useState([]);
    const [allStores, setAllStores] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState("");

    const { mutate } = useApiMutation();

    const fetchData = async (page = 1, countryFilter = selectedCountry) => {
        setLoading(true);
        try {
            const countryQuery = countryFilter ? `&country=${encodeURIComponent(countryFilter)}` : "";
            const storesRequest = new Promise((resolve, reject) => {
                mutate({
                    url: `/admin/general/stores?page=${page}${countryQuery}`,
                    method: 'GET',
                    headers: true,
                    hideToast: true,
                    onSuccess: (response) => resolve(response.data),
                    onError: reject,
                });
            });

            const allStoresRequest = new Promise((resolve, reject) => {
                mutate({
                    url: `/admin/general/stores?page=1&limit=10000000000${countryQuery}`,
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

            setAllStores(allStores.data || []);
            setStores(stores.data || []);
            setPagination(stores.pagination || {});
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchData(1, selectedCountry);
    }, [selectedCountry]);

    const handleCountryChange = (c) => {
        setSelectedCountry(c);
        fetchData(1, c);
    };

    return (
        <div className="min-h-screen">
            <AllStores
                data={storesData}
                totalData={allStores}
                loading={loading}
                paginate={pagination}
                selectedCountry={selectedCountry}
                onCountryChange={handleCountryChange}
                refetch={(page) => fetchData(page, selectedCountry)}
            />
        </div>
    );
};

export default App;
