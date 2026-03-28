//@ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import apiClient from "../../../api/apiFactory";
import { formatNumberWithCommas } from "../../../helpers/helperFactory";
import { toast } from "react-toastify";
import { X, Check, Tag, Eye } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  countered: "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-700",
};

const LIMIT = 10;

export default function VendorOffers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [counterModal, setCounterModal] = useState<{
    open: boolean;
    offer: any | null;
  }>({ open: false, offer: null });
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    offer: any | null;
  }>({ open: false, offer: null });

  const { register, watch, setValue } = useForm({
    defaultValues: { status: "" },
  });
  const statusFilter = watch("status");

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-offers", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });
      if (statusFilter) params.append("status", statusFilter);
      const res = await apiClient.get(`/vendor/offers?${params.toString()}`);
      return res.data;
    },
  });

  const offers: any[] = data?.data || [];
  const total: number = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  const {
    register: registerCounter,
    handleSubmit: handleCounterSubmit,
    reset: resetCounter,
    formState: { errors: counterErrors },
  } = useForm({ defaultValues: { counterPrice: "" } });

  const respondMutation = useMutation({
    mutationFn: async ({
      offerId,
      status,
      counterPrice,
    }: {
      offerId: string;
      status: string;
      counterPrice?: number;
    }) => {
      const res = await apiClient.put(`/vendor/offers/${offerId}`, {
        status,
        ...(status === "countered" && { counterPrice }),
      });
      return res.data;
    },
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-offers"] });
      setCounterModal({ open: false, offer: null });
      resetCounter();
      const messages: Record<string, string> = {
        accepted: "Offer accepted successfully.",
        rejected: "Offer rejected.",
        countered: "Counter offer sent successfully.",
      };
      toast.success(data?.message || messages[variables.status] || "Done.");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to respond to offer",
      );
    },
  });

  const handleStatusFilter = (status: string) => {
    setValue("status", status);
    setPage(1);
  };

  const onCounterSubmit = ({ counterPrice }: { counterPrice: string }) => {
    respondMutation.mutate({
      offerId: counterModal.offer.id,
      status: "countered",
      counterPrice: parseFloat(counterPrice),
    });
  };

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Offers</h1>
          <p className="text-sm text-gray-500">
            Manage buyer offers on your products
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            "",
            "pending",
            "accepted",
            "rejected",
            "countered",
            "completed",
          ].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                statusFilter === s
                  ? "bg-kudu-orange text-white border-kudu-orange"
                  : "bg-white text-gray-600 border-gray-300 hover:border-kudu-orange"
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
          <input type="hidden" {...register("status")} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "Buyer",
                  "Product",
                  "Listed Price",
                  "Offered Price",
                  "Counter Price",
                  "Message",
                  "Status",
                  "Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-semibold text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    Loading offers...
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Tag size={32} className="text-gray-300" />
                      <span>No offers found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {offer.buyer?.firstName} {offer.buyer?.lastName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {offer.buyer?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {offer.product?.image_url && (
                          <img
                            src={offer.product.image_url}
                            alt={offer.product.name}
                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <span className="max-w-[140px] truncate font-medium">
                          {offer.product?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      ₦{" "}
                      {formatNumberWithCommas(
                        parseFloat(offer.product?.price || 0),
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-kudu-orange">
                      ₦ {formatNumberWithCommas(parseFloat(offer.offeredPrice))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {offer.counterPrice ? (
                        <span className="font-semibold text-blue-600">
                          ₦{" "}
                          {formatNumberWithCommas(
                            parseFloat(offer.counterPrice),
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <span className="text-gray-500 truncate block">
                        {offer.message || (
                          <span className="text-gray-300">—</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          STATUS_COLORS[offer.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {offer.status.charAt(0).toUpperCase() +
                          offer.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-xs">
                      {new Date(offer.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          title="View Details"
                          onClick={() => setDetailModal({ open: true, offer })}
                          className="p-1.5 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        {offer.status === "pending" ? (
                          <>
                            <button
                              title="Accept"
                              disabled={respondMutation.isPending}
                              onClick={() =>
                                respondMutation.mutate({
                                  offerId: offer.id,
                                  status: "accepted",
                                })
                              }
                              className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              title="Counter"
                              disabled={respondMutation.isPending}
                              onClick={() =>
                                setCounterModal({ open: true, offer })
                              }
                              className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                              <Tag size={15} />
                            </button>
                            <button
                              title="Reject"
                              disabled={respondMutation.isPending}
                              onClick={() =>
                                respondMutation.mutate({
                                  offerId: offer.id,
                                  status: "rejected",
                                })
                              }
                              className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              <X size={15} />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}{" "}
              of {total}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded border text-sm ${
                    p === page
                      ? "bg-kudu-orange text-white border-kudu-orange"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Offer Detail Modal */}
      {detailModal.open && detailModal.offer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Offer Details</h2>
              <button
                onClick={() => setDetailModal({ open: false, offer: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Product */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {detailModal.offer.product?.image_url && (
                <img
                  src={detailModal.offer.product.image_url}
                  alt={detailModal.offer.product.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-semibold truncate">
                  {detailModal.offer.product?.name}
                </p>
                <p className="text-xs text-gray-500">
                  Listed Price:{" "}
                  <span className="font-medium text-gray-700">
                    ₦{" "}
                    {formatNumberWithCommas(
                      parseFloat(detailModal.offer.product?.price || 0),
                    )}
                  </span>
                </p>
              </div>
            </div>

            {/* Buyer */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Buyer
              </p>
              <p className="font-medium">
                {detailModal.offer.buyer?.firstName}{" "}
                {detailModal.offer.buyer?.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {detailModal.offer.buyer?.email}
              </p>
              {detailModal.offer.buyer?.phoneNumber && (
                <p className="text-sm text-gray-500">
                  {detailModal.offer.buyer.phoneNumber}
                </p>
              )}
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400">Listed Price</p>
                <p className="font-semibold text-sm">
                  ₦{" "}
                  {formatNumberWithCommas(
                    parseFloat(detailModal.offer.product?.price || 0),
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-gray-400">Offered Price</p>
                <p className="font-semibold text-sm text-kudu-orange">
                  ₦{" "}
                  {formatNumberWithCommas(
                    parseFloat(detailModal.offer.offeredPrice),
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-400">Counter Price</p>
                <p className="font-semibold text-sm text-blue-600">
                  {detailModal.offer.counterPrice ? (
                    `₦ ${formatNumberWithCommas(parseFloat(detailModal.offer.counterPrice))}`
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </p>
              </div>
            </div>

            {/* Message */}
            {detailModal.offer.message && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Buyer's Message
                </p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  {detailModal.offer.message}
                </p>
              </div>
            )}

            {/* Status & Date */}
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  STATUS_COLORS[detailModal.offer.status] ||
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {detailModal.offer.status.charAt(0).toUpperCase() +
                  detailModal.offer.status.slice(1)}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(detailModal.offer.createdAt).toLocaleDateString(
                  "en-GB",
                  { day: "2-digit", month: "long", year: "numeric" },
                )}
              </span>
            </div>

            <button
              type="button"
              className="w-full py-2 px-4 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
              onClick={() => setDetailModal({ open: false, offer: null })}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterModal.open && counterModal.offer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Send Counter Offer</h2>
              <button
                onClick={() => setCounterModal({ open: false, offer: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg flex flex-col gap-1">
              <p className="text-sm font-medium truncate">
                {counterModal.offer.product?.name}
              </p>
              <p className="text-xs text-gray-500">
                Buyer:{" "}
                <span className="font-medium">
                  {counterModal.offer.buyer?.firstName}{" "}
                  {counterModal.offer.buyer?.lastName}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                Buyer's offer:{" "}
                <span className="font-semibold text-kudu-orange">
                  ₦{" "}
                  {formatNumberWithCommas(
                    parseFloat(counterModal.offer.offeredPrice),
                  )}
                </span>
              </p>
            </div>
            <form
              onSubmit={handleCounterSubmit(onCounterSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Counter Price</label>
                <div
                  className={`flex items-center border rounded-md overflow-hidden transition-colors focus-within:border-kudu-orange ${
                    counterErrors.counterPrice
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                >
                  <span className="px-3 py-2 bg-gray-50 text-sm font-medium border-r border-gray-300">
                    ₦
                  </span>
                  <input
                    type="number"
                    placeholder="Enter counter price"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    {...registerCounter("counterPrice", {
                      required: "Counter price is required",
                      validate: (v) =>
                        !isNaN(parseFloat(v)) || "Enter a valid number",
                      min: {
                        value: 1,
                        message: "Price must be greater than 0",
                      },
                    })}
                  />
                </div>
                {counterErrors.counterPrice && (
                  <p className="text-red-500 text-xs">
                    {counterErrors.counterPrice.message}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 py-2 px-4 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => setCounterModal({ open: false, offer: null })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-theme="kudu"
                  className="flex-1 btn btn-primary"
                  disabled={respondMutation.isPending}
                >
                  {respondMutation.isPending ? "Sending..." : "Send Counter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
