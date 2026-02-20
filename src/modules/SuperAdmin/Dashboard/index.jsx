import Table from "../../../components/ReviewTable";
import DashboardStats from "./layouts/DashboardStats";
import Greeting from "./layouts/Greetings";
import UserAnalysis from "./layouts/UserAnalysis";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { useEffect } from "react";
import { useState } from "react";
import Loader from "../../../components/Loader";
import { dateFormat } from "../../../helpers/dateHelper";
import TransactionAnalytics from "./layouts/TransactionAnalytics";

export default function Dashboard() {
  const { mutate } = useApiMutation();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const [customersLength, setCustomersLength] = useState(0);
  const [vendorsLength, setVendorsLength] = useState(0);
  const [usersLength, setUserLength] = useState(0);
  const [productLength, setProductLength] = useState(0);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionsAmt, setTransactionsAmt] = useState(0);

  const TableHeaders = ["Name", "Account Type", "Date", "Action"];

  const getCustomers = () => {
    mutate({
      url: `/admin/customers`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const customers = response.data.data;
        const customersLength = response.data.meta.totalCustomers;
        setCustomersLength(customersLength);
        getVendors(customers, customersLength);
      },
      onError: () => {},
    });
  };

  const getVendors = (customers, customersLength) => {
    mutate({
      url: `/admin/vendors`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const vendors = response.data.data;
        const vendorLength = response.data.meta.totalVendors;
        setVendorsLength(vendorLength);
        setUserLength(customersLength + vendorLength);
        const combinedData = [...customers, ...vendors];
        const sortedUsers = sortByMostRecentUpdate(combinedData);
        setUserData(sortedUsers);
        setIsLoading(false);
      },
      onError: () => {},
    });
  };

  // Function to sort users by the most recent `updatedAt`
  const sortByMostRecentUpdate = (combinedData) => {
    return combinedData.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  };

  const getProducts = () => {
    mutate({
      url: "/admin/general/products",
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        getAuctionedProducts(response.data.pagination.total);
      },
      onError: () => {},
    });
  };

  const getAuctionedProducts = (productLength) => {
    mutate({
      url: "/admin/general/auction/products",
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const auctionedLength = response.data.pagination.total;
        setProductLength(productLength + auctionedLength);
      },
      onError: () => {},
    });
  };

  const getOrders = (page) => {
    mutate({
      url: `/admin/general/orders`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setOrders(response.data.data);
      },
      onError: () => {},
    });
  };

  const fetchAllTransactions = async () => {
    let totalAmount = 0;
    let currentPage = 1;
    let totalPages = 1;
    let allTransactions = [];

    const fetchPage = (page) => {
      mutate({
        url: `/admin/transactions?page=${page}`,
        method: "GET",
        headers: true,
        hideToast: true,
        onSuccess: (response) => {
          const transactions = response.data.data;
          totalAmount += transactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0,
          );
          allTransactions = [...allTransactions, ...transactions];

          if (page === 1) {
            totalPages = response.data.pagination.pages;
          }

          if (page < totalPages) {
            fetchPage(page + 1);
          } else {
            setTransactionsAmt(totalAmount);
            setTransactions(allTransactions);
          }
        },
        onError: () => {},
      });
    };

    fetchPage(currentPage);
  };

  useEffect(() => {
    getCustomers();
    getProducts();
    getOrders();
    fetchAllTransactions();
  }, []);

  return (
    <>
      <div className="w-full flex h-full animate__animated animate__fadeIn">
        <div className="w-full flex flex-col gap-5 h-full">
          <Greeting />
          <div className="w-full flex lg:flex-row md:flex-row flex-col h-full gap-5 my-2 md:px-0 px-3">
            <DashboardStats
              users={usersLength}
              products={productLength}
              orders={orders.length}
              transactions={transactions.length}
            />
          </div>
          <div className="w-full flex lg:flex-row md:flex-row flex-col gap-5">
            <div className="lg:w-[65%] md:w-[65%] w-full flex flex-col gap-5">
              <Table
                title="New Users"
                subTitle=""
                columns={[
                  { key: "name", label: "Name" },
                  { key: "accountType", label: "Account Type" },
                  {
                    key: "createdAt",
                    label: "Date",
                    render: (value) => dateFormat(value, "dd MMM, yyy"),
                  },
                ]}
                allData={userData.slice(0, 4).map((item) => ({
                  ...item,
                  name: `${item.firstName} ${item.lastName}`,
                }))}
                data={userData.slice(0, 4).map((item) => ({
                  ...item,
                  name: `${item.firstName} ${item.lastName}`,
                }))}
                exportData
                actions={[]}
                hasNumber
                isLoading={isLoading}
                currentPage={null}
                totalPages={null}
                onPageChange={null}
              />
            </div>

            <div className="lg:w-[35%] md:w-[35%] w-full grow h-full flex flex-col gap-5">
              <UserAnalysis
                usersLength={customersLength}
                vendorsLength={vendorsLength}
              />
            </div>
          </div>

          <div className="w-full flex lg:flex-row md:flex-row flex-col gap-5 my-2">
            <div className="lg:w-[50%] md:w-[50%] w-full flex flex-col gap-5">
              <TransactionAnalytics transactions={transactions} />
            </div>

            <div className="lg:w-[50%] md:w-[50%] w-full flex flex-col gap-5">
              <Table
                title="Orders"
                subTitle=""
                columns={[
                  { key: "refId", label: "Reference ID" },
                  { key: "trackingNumber", label: "Tracking Number" },
                  {
                    key: "totalAmount",
                    label: "Amount",
                    render: (value) => value,
                  },
                  {
                    key: "createdAt",
                    label: "Date",
                    render: (value) => dateFormat(value, "dd MMM, yyy"),
                  },
                ]}
                allData={orders.slice(0, 4)}
                data={orders.slice(0, 4)}
                actions={[]}
                exportData
                hasNumber
                isLoading={isLoading}
                currentPage={null}
                totalPages={null}
                onPageChange={null}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
