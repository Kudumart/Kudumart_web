import React, { useEffect, useState } from "react";
import { dateFormat } from "../helpers/dateHelper";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../hooks/modal";
import useApiMutation from "../api/hooks/useApiMutation";
import Table from "./ReviewTable";
import ConfirmModal from "./ConfirmModal";

const VendorTable = ({ data, totalData, refetch }) => {
  const [kycData, setKYCData] = useState([]);
  const { openModal } = useModal();
  const [updatingVendors, setUpdatingVendors] = useState(new Set());
  useEffect(() => {
    console.log(data);
  }, []);
  const vendorsData = data.data;

  const { mutate } = useApiMutation();

  const getKYC = () => {
    mutate({
      url: `/admin/kyc`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setKYCData(response.data.data);
      },
      onError: () => {
        // Handle error if needed
      },
    });
  };

  useEffect(() => {
    getKYC();
  }, []);

  const navigate = useNavigate();

  const routeKYC = (id) => {
    console.log(
      "🔍 [VendorTable] Looking for KYC data for vendor ID:",
      id,
      "(type:",
      typeof id,
      ")",
    );
    console.log(
      "🆔 [VendorTable] Available KYC data:",
      kycData.map((item) => ({
        vendorId: item.vendorId,
        type: typeof item.vendorId,
        businessName: item.businessName || "No business name",
      })),
    );

    // Improved ID matching logic - consistent with ViewKYC component
    const vendorIdString = String(id).trim();
    const vendorIdNumber = parseInt(id, 10);

    const userKYC = kycData.find((item) => {
      // Try exact string match
      if (String(item.vendorId) === vendorIdString) {
        console.log("✅ [VendorTable] Found KYC match using string comparison");
        return true;
      }
      // Try number comparison
      if (
        typeof item.vendorId === "number" &&
        item.vendorId === vendorIdNumber
      ) {
        console.log("✅ [VendorTable] Found KYC match using number comparison");
        return true;
      }
      // Try case-insensitive comparison
      if (
        String(item.vendorId).toLowerCase() ===
        String(vendorIdString).toLowerCase()
      ) {
        console.log(
          "✅ [VendorTable] Found KYC match using case-insensitive comparison",
        );
        return true;
      }
      return false;
    });

    if (userKYC) {
      console.log(
        "✅ [VendorTable] KYC data found, navigating to ViewKYC page",
      );
      navigate(`/admin/all-vendors/kyc/${id}`);
    } else {
      console.log("❌ [VendorTable] No KYC data found for vendor ID:", id);
      openModal({
        size: "sm",
        content: (
          <>
            <div className="w-full flex h-auto flex-col px-3 py-6 gap-3 -mt-3">
              <div className="flex gap-5 justify-center w-full">
                <p className="font-semibold text-center text-lg">
                  User has not completed their KYC process.
                </p>
              </div>
            </div>
          </>
        ),
      });
    }
  };

  const fetchNew = (page) => {
    refetch(page);
  };

  const toggleVendorStatus = (vendorId, currentStatus) => {
    console.log(
      `🔄 [VendorTable] Attempting to toggle status for vendor ID: ${vendorId}, current status: ${currentStatus}`,
    );

    const action = currentStatus === "active" ? "suspend" : "activate";
    const confirmMessage =
      currentStatus === "active"
        ? "Are you sure you want to suspend this vendor?"
        : "Are you sure you want to activate this vendor?";

    const confirmToggle = () => {
      // Add vendor to updating set to show loading state
      setUpdatingVendors((prev) => new Set(prev).add(vendorId));

      mutate({
        url: `/admin/toggle/user/status?userId=${vendorId}`,
        method: "PATCH",
        headers: true,
        onSuccess: (response) => {
          console.log(
            `✅ [VendorTable] Successfully ${action}d vendor:`,
            response.data,
          );
          // Remove vendor from updating set
          setUpdatingVendors((prev) => {
            const newSet = new Set(prev);
            newSet.delete(vendorId);
            return newSet;
          });
          // Refresh both current page and total data to see updated status immediately
          refetch(data.meta.currentPage);
        },
        onError: (error) => {
          console.error(`❌ [VendorTable] Error ${action}ing vendor:`, error);
          // Remove vendor from updating set even on error
          setUpdatingVendors((prev) => {
            const newSet = new Set(prev);
            newSet.delete(vendorId);
            return newSet;
          });
        },
      });
    };

    openModal({
      size: "sm",
      content: (
        <ConfirmModal
          title={`${action === "suspend" ? "Suspend" : "Activate"} Vendor`}
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
      <div className="rounded-md pb-2 w-full gap-5">
        <h2 className="text-lg font-semibold text-black-700 mb-4">
          All Vendors
        </h2>
      </div>
      <div className="bg-white rounded-md p-6 w-full gap-5">
        <h2 className="text-lg font-semibold text-black-700">All Vendors</h2>
        <div className="overflow-x-auto">
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "trackingId", label: "Id" },
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
              {
                key: "isVerified",
                label: "Verified",
                render: (value) => (
                  <span
                    className={`py-1 px-3 rounded-full text-sm capitalize ${
                      value
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {value ? "Verified" : "Unverified"}
                  </span>
                ),
              },
            ]}
            allData={totalData.map((item) => ({
              ...item,
              name: `${item.firstName} ${item.lastName}`,
              dateJoined: dateFormat(item.createdAt, "dd-MM-yyyy"),
            }))}
            data={vendorsData.map((item) => ({
              ...item,
              name: `${item.firstName} ${item.lastName}`,
              dateJoined: dateFormat(item.createdAt, "dd-MM-yyyy"),
            }))}
            exportData
            hasNumber
            actions={[
              {
                label: () => "View KYC",
                onClick: (row) => routeKYC(row.id),
              },
              {
                label: (row) => {
                  if (updatingVendors.has(row.id)) {
                    return "Updating...";
                  }
                  return row.status === "active"
                    ? "Suspend Vendor"
                    : "Unsuspend Vendor";
                },
                onClick: (row) => {
                  if (!updatingVendors.has(row.id)) {
                    toggleVendorStatus(row.id, row.status);
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
    </>
  );
};

export default VendorTable;
