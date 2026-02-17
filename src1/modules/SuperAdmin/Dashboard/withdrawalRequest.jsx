import React from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { useEffect, useState } from "react";
import Loader from "../../../components/Loader";
import { dateFormat } from "../../../helpers/dateHelper";
import Table from "../../../components/ReviewTable";
import { useModal } from "../../../hooks/modal";
import DropZone from "../../../components/DropZone";
import { useMutation } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import { toast } from "react-toastify";
import { Button } from "@mui/material";

const WithdrawalRequest = () => {
  const { mutate } = useApiMutation();

  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setIsLoading] = useState(true);
  const { openModal, closeModal } = useModal();

  const status_mutate = useMutation({
    mutationFn: async (data) => {
      await apiClient.post("/admin/withdrawal/update/status", {
        ...data,
      });
    },
    onSuccess: () => {
      getRequests();
      getStats();
      closeModal();
      toast.success("Status updated successfully");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  });

  const getRequests = () => {
    mutate({
      url: `/admin/payout/reports`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setWithdrawals(response.data.data);
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  const getStats = () => {
    apiClient.get("/admin/payout/stats").then(res => {
      setStats(res.data.data);
    });
  };

  useEffect(() => {
    getRequests();
    getStats();
  }, []);

  const handleDeclineModal = (bank) => {
    openModal({
      size: "md",
      content: (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              let formData = new FormData(e.target);
              let note = formData.get("note");
              if (!note) {
                toast.error("Please enter a reason for rejection");
                return;
              }
              let data = {
                id: bank.id,
                status: "rejected",
                note,
              };
              status_mutate.mutate(data);
            }}
          >
            <h2 className="text-xl font-bold my-2 text-red-600">Reject Withdrawal</h2>
            <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting this payout request.</p>
            <textarea
              className="w-full p-3 rounded-xl focus:outline-none placeholder-gray-400 text-sm border border-gray-200"
              placeholder="Enter reason for rejection"
              rows="4"
              id="note"
              name="note"
            ></textarea>
            <div className="flex w-full mt-6">
              <button
                disabled={status_mutate.isPending}
                className="ml-auto bg-red-600 text-white px-8 py-2 rounded-xl hover:bg-red-700 transition duration-300 font-bold"
              >
                Reject Request
              </button>
            </div>
          </form>
        </>
      ),
    });
  };

  const handleSubMitModal = (bank) => {
    openModal({
      size: "md",
      content: (
        <>
          <div>
            <h2 className="text-xl font-bold my-2 text-green-600">Approve Payout</h2>
            <p className="text-sm text-gray-500 mb-6">Confirm payment by uploading the transfer receipt.</p>
            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-4">
              <DropZone
                text={"Upload Payment Receipt"}
                onUpload={(e) => {
                  let data = {
                    id: bank.id,
                    paymentReceipt: e[0],
                    status: "approved",
                  };
                  status_mutate.mutateAsync(data);
                }}
              />
            </div>
          </div>
        </>
      ),
    });
  };

  const handleViewModal = (bank) => {
    openModal({
      size: "md",
      content: (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6 border-b pb-2">Bank Account Details</h2>
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(bank.bankInfo || {}).map(([key, value]) => (
              <div key={key}>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <div className="text-sm font-semibold text-gray-800 break-words">
                  {value || "---"}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-8 pt-4 border-t">
            <Button
              onClick={closeModal}
              className="bg-gray-100 text-gray-600 normal-case px-6 py-2 rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      ),
    });
  };

  const parseBankInfo = (bankInfo) => {
    if (!bankInfo || typeof bankInfo !== 'string') return {};
    return bankInfo.split("?").reduce((acc, param) => {
      const [key, value] = param.split("=");
      if (key && value) acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50/50">
      {loading ? (
        <div className="w-full h-[60vh] flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Admin Payout Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="h-10 w-10 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                  <span className="text-orange-600 font-bold">₦</span>
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending (NGN)</p>
                <p className="text-3xl font-black mt-2 text-gray-900">
                  ₦{Number(stats?.find(s => s.status === 'pending' && s.currency === 'NGN')?.totalAmount || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">$</span>
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending (USD)</p>
                <p className="text-3xl font-black mt-2 text-gray-900">
                  ${Number(stats?.find(s => s.status === 'pending' && s.currency === 'USD')?.totalAmount || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="h-10 w-10 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Paid (NGN)</p>
                <p className="text-3xl font-black mt-2 text-gray-900">
                  ₦{Number(stats?.find(s => s.status === 'approved' && s.currency === 'NGN')?.totalAmount || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="h-10 w-10 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                  <span className="text-green-600 font-bold">$✓</span>
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Paid (USD)</p>
                <p className="text-3xl font-black mt-2 text-gray-900">
                  ${Number(stats?.find(s => s.status === 'approved' && s.currency === 'USD')?.totalAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-black text-gray-900 text-xl tracking-tight">Recent Payout Requests</h3>
            </div>
            <div className="overflow-x-auto">
              <Table
                columns={[
                  {
                    key: "vendor",
                    label: "Vendor",
                    render: (v) => <div className="font-bold text-gray-900">{v?.firstName} {v?.lastName}</div>
                  },
                  {
                    key: "amount",
                    label: "Amount",
                    render: (v, row) => <div className="font-extrabold text-gray-900">{row.currency === 'NGN' ? '₦' : '$'}{Number(v).toLocaleString()}</div>
                  },
                  {
                    key: "createdAt",
                    label: "Requested On",
                    render: (value) => <span className="text-gray-500 font-medium">{dateFormat(value, "dd MMM yyyy")}</span>,
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (value) => (
                      <span
                        className={`py-1.5 px-4 rounded-full text-[10px] font-black uppercase tracking-widest ${value === "approved"
                            ? "bg-green-100 text-green-700"
                            : value === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                      >
                        {value === "approved" ? "Completed" : value}
                      </span>
                    ),
                  },
                ]}
                allData={withdrawals.map((item) => ({
                  ...item,
                  bankInfo: parseBankInfo(item.bankInformation?.bankInfo),
                }))}
                data={withdrawals}
                exportData
                actions={[
                  {
                    label: (row) => "View Bank",
                    onClick: (row) => handleViewModal({ ...row, bankInfo: parseBankInfo(row.bankInformation?.bankInfo) }),
                  },
                  {
                    label: (row) => row.status === "pending" ? "Approve" : null,
                    onClick: (row) => handleSubMitModal(row),
                  },
                  {
                    label: (row) => row.status === "pending" ? "Reject" : null,
                    onClick: (row) => handleDeclineModal(row),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequest;
