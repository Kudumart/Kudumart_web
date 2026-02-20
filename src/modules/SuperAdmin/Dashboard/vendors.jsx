import React from 'react';
import useApiMutation from '../../../api/hooks/useApiMutation';
import { useEffect } from 'react';
import { useState } from 'react';
import Loader from '../../../components/Loader';
import VendorTable from '../../../components/VendorTable';

const App = () => {
  const { mutate } = useApiMutation();

  const [customers, setCustomersData] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const getVendors = (page) => {
    setCurrentPage(page);
    mutate({
      url: `/admin/vendors?page=${page}`,
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



  const getTotalVendors = () => {
    mutate({
      url: `/admin/vendors?page=1&limit=100000000000000`,
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
    getVendors(page);
    getTotalVendors();
  };



  useEffect(() => {
    getVendors(1);
    getTotalVendors();
  }, []);

  return (
    <div className="min-h-screen">
      {loading ?
        <div className="w-full h-screen flex items-center justify-center">
          <Loader />
        </div>
        :
        <VendorTable data={customers} totalData={totalCustomers} refetch={handleRefetch} />
      }
    </div>
  );
};

export default App;
