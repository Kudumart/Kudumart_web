import React, { useEffect, useState } from 'react';
import Transactions from "../../../components/Transaction";
import useApiMutation from '../../../api/hooks/useApiMutation';
import Loader from '../../../components/Loader';

const App = () => {

    const { mutate } = useApiMutation();
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [loading, setLoading] = useState(true);


    const getTransactions = (page) => {
        setLoading(true);
        mutate({
            url: `/admin/transactions?page=${page}`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                setTransactions(response.data);
                setLoading(false);
            },
            onError: () => {
                setLoading(false)
            }
        });
    }


    const getAllTransactions = (page) => {
        setLoading(true);
        mutate({
            url: `/admin/transactions?page=1&limit=10000000000`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                setAllTransactions(response.data.data);
            },
            onError: () => {
                setLoading(false)
            }
        });
    }


    useEffect(() => {
        getTransactions(1);
        getAllTransactions();
    }, []);

    return (
        <div className="min-h-screen">
            <Transactions data={transactions.data} totalData={allTransactions} loading={loading} paginate={transactions.pagination} fetchNew={(page) => getTransactions(page)} />
        </div>
    );
};

export default App;
