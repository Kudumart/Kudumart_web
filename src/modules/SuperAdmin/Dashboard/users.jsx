import React from 'react';
import UserTable from "../../../components/UserTable";
import useApiMutation from '../../../api/hooks/useApiMutation';
import { useEffect } from 'react';
import { useState } from 'react';
import Loader from '../../../components/Loader';

const App = () => {
  const { mutate } = useApiMutation();

  const [customers, setCustomersData] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const getCustomers = (page) => {
    setCurrentPage(page);
    mutate({
      url: `/admin/customers?page=${page}`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setCustomersData(response.data);
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      }
    });
  }


  const getAllCustomers = () => {
    mutate({
      url: `/admin/customers?page=1&limit=100000000000000`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setTotalCustomers(response.data.data);
      },
      onError: () => {
      }
    });
  }

  const handleRefetch = (page = currentPage) => {
    // Refetch both current page data and total data to ensure sync
    getCustomers(page);
    getAllCustomers();
  };


  useEffect(() => {
    getCustomers(1);
    getAllCustomers();
  }, []);

  return (
    <div className="min-h-screen">
      {loading ?
        <div className="w-full h-screen flex items-center justify-center">
          <Loader />
        </div>
        :
        <UserTable data={customers} totalData={totalCustomers} refetch={handleRefetch} />
      }
    </div>
  );
};

export default App;
