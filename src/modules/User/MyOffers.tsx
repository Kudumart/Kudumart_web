//@ts-nocheck
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePaystackPayment } from "react-paystack";
import apiClient from "../../api/apiFactory";
import { formatNumberWithCommas } from "../../helpers/helperFactory";
import { paystackKey } from "../../config/paymentKeys";
import { toast } from "react-toastify";
import { Tag, X, Check, ShoppingBag } from "lucide-react";
import CustomTable, { columnType } from "../../components/CustomTable";
import useAppState from "../../hooks/appState";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  countered: "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-700",
};

const LIMIT = 10;

type Offer = {
  id: string;
  productId: string;
  offeredPrice: string;
  counterPrice: string | null;
  status: string;
  message: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: string;
    image_url: string;
  };
};

export default function MyOffers() {
  const queryClient = useQueryClient();
  const { user } = useAppState();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [detailOffer, setDetailOffer] = useState<Offer | null>(null);

  // Payment state
  const [checkoutOffer, setCheckoutOffer] = useState<Offer | null>(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    trackingNumber: string;
  } | null>(null);
  const [paystackConfig, setPaystackConfig] = useState<any>({
    publicKey: paystackKey || "",
    email: "",
    amount: 0,
    reference: "",
  });
  // ref to hold pending checkout data across async boundary
  const pendingCheckout = useRef<{
    offerId: string;
    refId: string;
    shippingAddress: string;
  } | null>(null);
  const shouldPay = useRef(false);

  const initializePayment = usePaystackPayment(paystackConfig);

  const { data, isLoading } = useQuery({
    queryKey: ["my-offers", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusFilter) params.append("status", statusFilter);
      const res = await apiClient.get(`/user/offers?${params.toString()}`);
      return res.data;
    },
  });

  const offers: Offer[] = data?.data || [];
  const total: number = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  const respondMutation = useMutation({
    mutationFn: async ({
      offerId,
      status,
    }: {
      offerId: string;
      status: "accepted" | "rejected";
    }) => {
      const res = await apiClient.put(`/user/offers/${offerId}/respond`, { status });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-offers"] });
      setDetailOffer(null);
      toast.success(
        data?.message ||
          (variables.status === "accepted"
            ? "Counter offer accepted."
            : "Counter offer rejected."),
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to respond to counter offer.",
      );
    },
  });

  // Step 1: initiate payment — get Paystack reference + effectivePrice
  const initiateMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const res = await apiClient.post(`/user/offers/${offerId}/initiate-payment`);
      return res.data;
    },
    onSuccess: (data) => {
      const { refId, effectivePrice, paystackDetails } = data.data;
      pendingCheckout.current = {
        offerId: checkoutOffer!.id,
        refId,
        shippingAddress,
      };
      shouldPay.current = true;
      setPaystackConfig({
        publicKey: paystackKey || "",
        email: user?.email || "",
        amount: effectivePrice * 100, // kobo
        reference: paystackDetails.reference,
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to initiate payment.");
    },
  });

  // Step 2: complete checkout after Paystack confirms
  const checkoutMutation = useMutation({
    mutationFn: async ({
      offerId,
      refId,
      shippingAddress,
    }: {
      offerId: string;
      refId: string;
      shippingAddress: string;
    }) => {
      const res = await apiClient.post(`/user/offers/${offerId}/checkout`, {
        refId,
        shippingAddress,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-offers"] });
      setCheckoutOffer(null);
      setShippingAddress("");
      setOrderResult(data.data);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Checkout failed. Please retry.");
    },
  });

  // Trigger Paystack popup once config is updated
  useEffect(() => {
    if (!shouldPay.current) return;
    shouldPay.current = false;
    initializePayment({
      onSuccess: () => {
        if (!pendingCheckout.current) return;
        checkoutMutation.mutate(pendingCheckout.current);
        pendingCheckout.current = null;
      },
      onClose: () => {
        toast.info("Payment cancelled.");
        pendingCheckout.current = null;
      },
    });
  }, [paystackConfig]);

  const columns: columnType<Offer>[] = [
    {
      key: "product",
      label: "Product",
      render: (_, offer) => (
        <div className="flex items-center gap-2 min-w-[140px]">
          {offer.product?.image_url && (
            <img
              src={offer.product.image_url}
              alt={offer.product.name}
              className="w-8 h-8 rounded object-cover flex-shrink-0"
            />
          )}
          <span className="truncate max-w-[120px] font-medium">
            {offer.product?.name}
          </span>
        </div>
      ),
    },
    {
      key: "product",
      label: "Listed Price",
      render: (_, offer) => (
        <span className="whitespace-nowrap">
          ₦ {formatNumberWithCommas(parseFloat(offer.product?.price || "0"))}
        </span>
      ),
    },
    {
      key: "offeredPrice",
      label: "Your Offer",
      render: (val) => (
        <span className="font-semibold text-kudu-orange whitespace-nowrap">
          ₦ {formatNumberWithCommas(parseFloat(val as string))}
        </span>
      ),
    },
    {
      key: "counterPrice",
      label: "Counter Price",
      render: (val) =>
        val ? (
          <span className="font-semibold text-blue-600 whitespace-nowrap">
            ₦ {formatNumberWithCommas(parseFloat(val as string))}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
            STATUS_COLORS[val as string] || "bg-gray-100 text-gray-600"
          }`}
        >
          {(val as string).charAt(0).toUpperCase() + (val as string).slice(1)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (val) => (
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {new Date(val as string).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (_, offer) => {
        if (offer.status === "countered") {
          return (
            <button
              onClick={() => setDetailOffer(offer)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              View Counter
            </button>
          );
        }
        if (offer.status === "accepted") {
          return (
            <button
              onClick={() => {
                setCheckoutOffer(offer);
                setShippingAddress(user?.location?.street || "");
              }}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors whitespace-nowrap"
            >
              Proceed to Payment
            </button>
          );
        }
        if (offer.status === "pending") {
          return <span className="text-xs text-gray-400">Awaiting review</span>;
        }
        if (offer.status === "rejected") {
          return <span className="text-xs text-red-400">Offer Declined</span>;
        }
        if (offer.status === "completed") {
          return <span className="text-xs text-gray-500">Order Placed</span>;
        }
        return null;
      },
    },
  ];

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Offers</h1>
          <p className="text-sm text-gray-500">Track offers you've sent to vendors</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {["", "pending", "accepted", "rejected", "countered", "completed"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Loading offers...
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
            <Tag size={32} className="text-gray-300" />
            <span className="text-sm">No offers found</span>
          </div>
        ) : (
          <CustomTable data={offers} columns={columns} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of{" "}
              {total}
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

      {/* Checkout Modal */}
      {checkoutOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Complete Payment</h2>
              <button
                onClick={() => setCheckoutOffer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              {checkoutOffer.product?.image_url && (
                <img
                  src={checkoutOffer.product.image_url}
                  alt={checkoutOffer.product.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-medium truncate">{checkoutOffer.product?.name}</p>
                <p className="text-xs text-gray-500">
                  Amount:{" "}
                  <span className="font-bold text-kudu-orange">
                    ₦{" "}
                    {formatNumberWithCommas(
                      parseFloat(
                        checkoutOffer.counterPrice || checkoutOffer.offeredPrice,
                      ),
                    )}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Shipping Address</label>
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your delivery address"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-kudu-orange"
              />
            </div>

            <button
              disabled={!shippingAddress.trim() || initiateMutation.isPending}
              onClick={() => initiateMutation.mutate(checkoutOffer.id)}
              data-theme="kudu"
              className="btn btn-primary btn-block disabled:opacity-50"
            >
              {initiateMutation.isPending ? "Preparing..." : "Pay with Paystack"}
            </button>
            <p className="text-[10px] text-center text-gray-400 uppercase tracking-wider">
              Secure Payment via Paystack
            </p>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {orderResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <ShoppingBag size={28} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Order Placed!</h2>
              <p className="text-sm text-gray-500 mt-1">Your payment was successful.</p>
            </div>
            <div className="w-full p-3 bg-gray-50 rounded-lg flex flex-col gap-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order ID</span>
                <span className="font-medium truncate max-w-[180px]">
                  {orderResult.orderId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tracking No.</span>
                <span className="font-bold text-kudu-orange">
                  {orderResult.trackingNumber}
                </span>
              </div>
            </div>
            <button
              onClick={() => setOrderResult(null)}
              data-theme="kudu"
              className="btn btn-primary btn-block"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Counter Offer Response Modal */}
      {detailOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Counter Offer</h2>
              <button
                onClick={() => setDetailOffer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg flex flex-col gap-1">
              {detailOffer.product?.image_url && (
                <img
                  src={detailOffer.product.image_url}
                  alt={detailOffer.product.name}
                  className="w-12 h-12 rounded-lg object-cover mb-1"
                />
              )}
              <p className="font-medium truncate">{detailOffer.product?.name}</p>
              <p className="text-xs text-gray-500">
                Your offer:{" "}
                <span className="font-semibold text-kudu-orange">
                  ₦ {formatNumberWithCommas(parseFloat(detailOffer.offeredPrice))}
                </span>
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg flex flex-col gap-1">
              <p className="text-xs text-gray-500">Counter offer from vendor</p>
              <p className="text-xl font-bold text-blue-600">
                ₦ {formatNumberWithCommas(parseFloat(detailOffer.counterPrice!))}
              </p>
            </div>

            {detailOffer.message && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {detailOffer.message}
              </p>
            )}

            <div className="flex gap-3">
              <button
                disabled={respondMutation.isPending}
                onClick={() =>
                  respondMutation.mutate({
                    offerId: detailOffer.id,
                    status: "rejected",
                  })
                }
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-md border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <X size={14} /> Reject
              </button>
              <button
                disabled={respondMutation.isPending}
                onClick={() =>
                  respondMutation.mutate({
                    offerId: detailOffer.id,
                    status: "accepted",
                  })
                }
                data-theme="kudu"
                className="flex-1 btn btn-primary flex items-center gap-1.5"
              >
                <Check size={14} />
                {respondMutation.isPending ? "..." : "Accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
