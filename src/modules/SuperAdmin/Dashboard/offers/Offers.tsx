//@ts-nocheck
import { useEffect, useState } from "react";
import useApiMutation from "../../../../api/hooks/useApiMutation";
import { formatNumberWithCommas } from "../../../../helpers/helperFactory";
import { toast } from "react-toastify";
import { X, Check, Tag } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  countered: "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-700",
};

export default function Offers() {
  const { mutate } = useApiMutation();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [counterModal, setCounterModal] = useState<{
    open: boolean;
    offer: any | null;
  }>({ open: false, offer: null });
  const [counterPrice, setCounterPrice] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOffers = (p = page, status = statusFilter) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(p),
      limit: String(limit),
    });
    if (status) params.append("status", status);
    mutate({
      url: `/admin/offers?${params.toString()}`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setOffers(response.data.data || []);
        setTotal(response.data.total || 0);
        setLoading(false);
      },
      onError: () => setLoading(false),
    });
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    fetchOffers(1, status);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchOffers(newPage, statusFilter);
  };

  const respondToOffer = (
    offerId: string,
    status: string,
    cprice?: number,
  ) => {
    setActionLoading(true);
    mutate({
      url: `/admin/offers/${offerId}`,
      method: "PUT",
      headers: true,
      data: {
        status,
        ...(status === "countered" && { counterPrice: cprice }),
      },
      onSuccess: () => {
        setActionLoading(false);
        setCounterModal({ open: false, offer: null });
        setCounterPrice("");
        fetchOffers(page, statusFilter);
      },
      onError: () => setActionLoading(false),
    });
  };

  const handleCounter = () => {
    if (!counterPrice || isNaN(parseFloat(counterPrice))) {
      toast.error("Please enter a valid counter price");
      return;
    }
    respondToOffer(
      counterModal.offer.id,
      "countered",
      parseFloat(counterPrice),
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Offers</h1>
          <p className="text-sm text-gray-500">
            Manage buyer offers on products
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Buyer
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Product
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Listed Price
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Offered Price
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Counter Price
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Message
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
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
                      {offer.status === "pending" ? (
                        <div className="flex gap-1.5">
                          <button
                            title="Accept"
                            disabled={actionLoading}
                            onClick={() =>
                              respondToOffer(offer.id, "accepted")
                            }
                            className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            title="Counter"
                            disabled={actionLoading}
                            onClick={() => setCounterModal({ open: true, offer })}
                            className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                          >
                            <Tag size={15} />
                          </button>
                          <button
                            title="Reject"
                            disabled={actionLoading}
                            onClick={() =>
                              respondToOffer(offer.id, "rejected")
                            }
                            className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
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
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{" "}
              of {total}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
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
                onClick={() => handlePageChange(page + 1)}
                className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Counter Offer Modal */}
      {counterModal.open && counterModal.offer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Send Counter Offer</h2>
              <button
                onClick={() =>
                  setCounterModal({ open: false, offer: null })
                }
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
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Counter Price</label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:border-kudu-orange transition-colors">
                <span className="px-3 py-2 bg-gray-50 text-sm font-medium border-r border-gray-300">
                  ₦
                </span>
                <input
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  placeholder="Enter counter price"
                  className="flex-1 px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 px-4 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setCounterModal({ open: false, offer: null })
                }
              >
                Cancel
              </button>
              <button
                data-theme="kudu"
                className="flex-1 btn btn-primary"
                onClick={handleCounter}
                disabled={actionLoading || !counterPrice}
              >
                {actionLoading ? "Sending..." : "Send Counter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
