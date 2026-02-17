import React, { useState } from "react";
import { dateFormat } from "../helpers/dateHelper";
import Table from "../components/ReviewTable";
import useApiMutation from "../api/hooks/useApiMutation";
import { useModal } from "../hooks/modal";
import ConfirmModal from "./ConfirmModal";

const UserTable = ({ data, totalData, refetch }) => {
  const usersData = data.data;
  const { mutate } = useApiMutation();
  const { openModal } = useModal();
  const [updatingUsers, setUpdatingUsers] = useState(new Set());

  const fetchNew = (page) => {
    refetch(page);
  };

  const toggleUserStatus = (userId, currentStatus) => {
    console.log(
      `🔄 [UserTable] Attempting to toggle status for user ID: ${userId}, current status: ${currentStatus}`,
    );

    const action = currentStatus === "active" ? "suspend" : "activate";
    const confirmMessage =
      currentStatus === "active"
        ? "Are you sure you want to suspend this customer?"
        : "Are you sure you want to activate this customer?";

    const confirmToggle = () => {
      // Add user to updating set to show loading state
      setUpdatingUsers((prev) => new Set(prev).add(userId));

      mutate({
        url: `/admin/toggle/user/status?userId=${userId}`,
        method: "PATCH",
        headers: true,
        onSuccess: (response) => {
          console.log(
            `✅ [UserTable] Successfully ${action}d user:`,
            response.data,
          );
          // Remove user from updating set
          setUpdatingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          // Refresh both current page and total data to see updated status immediately
          refetch(data.meta.currentPage);
        },
        onError: (error) => {
          console.error(`❌ [UserTable] Error ${action}ing user:`, error);
          // Remove user from updating set even on error
          setUpdatingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        },
      });
    };

    openModal({
      size: "sm",
      content: (
        <ConfirmModal
          title={`${action === "suspend" ? "Suspend" : "Activate"} Customer`}
          message={confirmMessage}
          onConfirm={confirmToggle}
          confirmText={action === "suspend" ? "Suspend" : "Activate"}
          confirmColor={action === "suspend" ? "red" : "green"}
        />
      ),
    });
  };
  return (
    <>
      <div className="All">
        <div className="rounded-md pb-2 w-full gap-5">
          <h2 className="text-lg font-semibold text-black-700 mb-4">
            All Customers
          </h2>
        </div>
        <div className="bg-white rounded-md p-6 w-full gap-5">
          <h2 className="text-lg font-semibold text-black-700">
            All Customers
          </h2>
          <div className="overflow-x-auto">
            <Table
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "accountType", label: "User Type" },
                { key: "dateJoined", label: "Date Joined" },
                {
                  key: "phoneNumber",
                  label: "Phone",
                  render: (value) => {
                    return <span>{value}</span>;
                  },
                },
                {
                  key: "status",
                  label: "Status",
                  render: (value) => (
                    <span
                      className={`py-1 px-3 rounded-full text-sm capitalize ${
                        value === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {value}
                    </span>
                  ),
                },
              ]}
              exportData
              hasNumber
              allData={totalData.map((item) => ({
                ...item,
                name: `${item.firstName} ${item.lastName}`,
                dateJoined: dateFormat(item.createdAt, "dd-MM-yyyy"),
              }))}
              data={usersData.map((item) => ({
                ...item,
                name: `${item.firstName} ${item.lastName}`,
                dateJoined: dateFormat(item.createdAt, "dd-MM-yyyy"),
              }))}
              actions={[
                {
                  label: (row) => {
                    if (updatingUsers.has(row.id)) {
                      return "Updating...";
                    }
                    return row.status === "active"
                      ? "Suspend Customer"
                      : "Unsuspend Customer";
                  },
                  onClick: (row) => {
                    if (!updatingUsers.has(row.id)) {
                      toggleUserStatus(row.id, row.status);
                    }
                  },
                },
              ]}
              currentPage={data.meta.currentPage}
              totalPages={data.meta.totalPages}
              onPageChange={(page) => fetchNew(page)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserTable;
