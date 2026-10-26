import React, { useState, useMemo } from "react";
import { dateFormat } from "../helpers/dateHelper";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { formatNumberWithCommas } from "../helpers/helperFactory";
import { useDebounce } from "../hooks/useDebounce";
import DeleteModal from "./DeleteModal";
import { useModal } from "../hooks/modal";
import ReviewTable from "./ReviewTable";
import useApiMutation from "../api/hooks/useApiMutation";
import ConfirmModal from "./ConfirmModal";

const SubscriptionTable = ({ data, refetch, loading }) => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { mutate } = useApiMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data) return [];

    if (!debouncedSearchQuery.trim()) {
      return data;
    }

    const query = debouncedSearchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item?.name?.toLowerCase().includes(query) ||
        item?.currency?.symbol?.toLowerCase().includes(query) ||
        item?.price?.toString().includes(query),
    );
  }, [data, debouncedSearchQuery]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handleRedirect = () => {
    refetch();
  };

  const handleDeleteModal = (id) => {
    openModal({
      size: "sm",
      content: (
        <DeleteModal
          title={"Do you wish to delete this subscription?"}
          redirect={handleRedirect}
          api={`/admin/subscription/plan/delete?planId=${id}`}
        />
      ),
    });
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleGlobalWaiver = (plan) => {
    const waived = !plan.isFeeWaived;
    openModal({
      size: "sm",
      content: (
        <ConfirmModal
          title={waived ? "Waive this plan fee for everyone?" : "Restore this plan fee?"}
          message={waived
            ? `Every vendor will be able to activate ${plan.name} without payment until the waiver is removed. The normal price will be preserved.`
            : `Vendors will pay the normal ${plan.name} price again. Existing subscriptions will remain active.`}
          confirmText={waived ? "Waive Fee" : "Restore Fee"}
          confirmColor={waived ? "orange" : "green"}
          onConfirm={() => mutate({
            url: `/admin/subscription/plans/${plan.id}/fee-waiver`,
            method: "PATCH",
            headers: true,
            data: { waived },
            onSuccess: refetch,
          })}
        />
      ),
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    { key: "name", label: "Plan Name" },
    { key: "maxAds", label: "Max Ads" },
    { key: "productLimit", label: "Product Limit" },
    // { key: "allowsServiceAds", label: "Allows Ads" },
    { key: "price", label: "Plan Price" },
    { key: "duration", label: "Plan Validity" },
    { key: "serviceAdsLimit", label: "Service Ads Limit" },
    // { key: "currency", label: "currency" },
  ];

  const renderRow = (item) => ({
    name: (
      <span className="text-sm font-semibold text-gray-900">{item.name}</span>
    ),

    userType: <span className="text-sm text-gray-600">Vendors</span>,
    price: (
      <div>
        <span className={`text-sm text-gray-900 ${item.isFeeWaived ? "line-through text-gray-400" : ""}`}>
          {item.currency ? item.currency.symbol : "₦"}{" "}{formatNumberWithCommas(item.price)}
        </span>
        {item.isFeeWaived && <span className="ml-2 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">Waived for everyone</span>}
      </div>
    ),
    allowsServiceAds: <span className="text-sm text-gray-600">"ues"</span>,
    duration: (
      <span className="text-sm text-gray-600">{item.duration} month(s)</span>
    ),
    status: (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600">
        Active
      </span>
    ),
    // currency: (
    //   <span className="text-sm font-semibold text-gray-900">
    //     {JSON.stringify(item)}
    //   </span>
    // ),
  });

  const exportData = data?.map((item) => ({
    "Plan Name": item.name || "",
    "User Type": "Vendors",
    "Plan Price": `${item.currency ? item.currency.symbol : "₦"} ${formatNumberWithCommas(item.price)}`,
    "Plan Validity": `${item.duration} month(s)`,
    Status: "Active",
    "Created At": new Date(item?.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="min-h-screen p-6">
      <ReviewTable
        columns={columns}
        data={paginatedData}
        renderRow={renderRow}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search subscriptions..."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={filteredData.length}
        exportData={exportData}
        exportFilename="subscriptions"
        title="All Subscription Plans"
        onAdd={() => navigate("create")}
        addButtonText="Add New Subscription"
        actions={[
          {
            label: (row) => row.isFeeWaived ? "Restore Fee for Everyone" : "Waive Fee for Everyone",
            onClick: handleGlobalWaiver,
          },
          {
            label: (row) => {
              return "Edit";
            },
            onClick: (row) => navigate(`edit/${row.name}`),
          },
          {
            label: (row) => {
              return "Delete";
            },
            onClick: (row) => handleDeleteModal(row.id),
          },
        ]}
      />
    </div>
  );
};

export default SubscriptionTable;
