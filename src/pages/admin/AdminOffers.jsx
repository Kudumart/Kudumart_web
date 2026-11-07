import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Box,
  Check,
  Eye,
  Tag,
  X,
} from "lucide-react";
import { adminApi } from "../../api/admin";
import { Button, EmptyState, Modal, Skeleton } from "../../components/ui";
import { useResource } from "../../hooks/useResource";
import { useApp } from "../../contexts/AppContext";

const LIMIT = 10;

const STATUS_BADGES = {
  pending: { bg: "#fef9c3", color: "#854d0e", label: "Pending" },
  accepted: { bg: "#dcfce7", color: "#166534", label: "Accepted" },
  rejected: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
  countered: { bg: "#dbeafe", color: "#1e40af", label: "Countered" },
  completed: { bg: "#f1f5f9", color: "#475569", label: "Completed" },
};

const formatNaira = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? "0" : num.toLocaleString();
};

export function AdminOffers() {
  const { notify } = useApp();
  const [tab, setTab] = useState("all"); // "all" | "mine"
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);

  // Modals state
  const [detailModal, setDetailModal] = useState(null);
  const [counterModal, setCounterModal] = useState(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterError, setCounterError] = useState("");
  const [busy, setBusy] = useState(false);

  const resource = useResource(
    (signal) => {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      return tab === "all"
        ? adminApi.offers(params, signal)
        : adminApi.myOffers(params, signal);
    },
    [tab, page, statusFilter, revision],
  );

  const payload = resource.data;
  const offers = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.data?.data)
      ? payload.data.data
      : Array.isArray(payload)
        ? payload
        : [];
  const total =
    payload?.total ??
    payload?.meta?.total ??
    payload?.pagination?.total ??
    payload?.data?.total ??
    offers.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPage(1);
  };

  const handleStatusFilter = (s) => {
    setStatusFilter(s);
    setPage(1);
  };

  const handleRespond = async (offerId, status, counterVal) => {
    setBusy(true);
    try {
      await adminApi.respondOffer(offerId, status, counterVal);
      const messages = {
        accepted: "Offer accepted successfully.",
        rejected: "Offer rejected.",
        countered: "Counter offer sent successfully.",
      };
      notify(messages[status] || "Offer updated.", "success");
      setDetailModal(null);
      setCounterModal(null);
      setCounterPrice("");
      setCounterError("");
      setRevision((v) => v + 1);
    } catch (err) {
      notify(err.message || "Failed to respond to offer.", "error");
    } finally {
      setBusy(false);
    }
  };

  const openCounterModal = (offer) => {
    setCounterModal(offer);
    setCounterPrice(offer.counterPrice || "");
    setCounterError("");
  };

  const submitCounter = (e) => {
    e.preventDefault();
    const val = parseFloat(counterPrice);
    if (isNaN(val) || val <= 0) {
      setCounterError("Please enter a valid counter price greater than 0");
      return;
    }
    handleRespond(counterModal.id, "countered", val);
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">BARGAINING CONTROL</span>
          <h1>Offers</h1>
          <p>
            {tab === "all"
              ? "Oversee and manage buyer price negotiations across all vendor stores."
              : "Review and respond to bargain offers on products in your administrator stores."}
          </p>
        </div>
      </div>

      <div className="admin-content-tabs">
        <button
          type="button"
          className={tab === "all" ? "active" : ""}
          onClick={() => handleTabChange("all")}
        >
          <Tag size={16} /> Vendors Offers
        </button>
        <button
          type="button"
          className={tab === "mine" ? "active" : ""}
          onClick={() => handleTabChange("mine")}
        >
          <Tag size={16} /> My Offers
        </button>
      </div>

      <section className="admin-card">
        {/* Status Filter Pills */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {["", "pending", "accepted", "rejected", "countered", "completed"].map(
            (s) => {
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusFilter(s)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    border: active ? "1px solid #df5a23" : "1px solid #e2e8f0",
                    background: active ? "#df5a23" : "#fff",
                    color: active ? "#fff" : "#475569",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
                </button>
              );
            },
          )}
        </div>

        {resource.loading ? (
          <Skeleton className="admin-table-skeleton" />
        ) : resource.error ? (
          <div className="admin-error">{resource.error.message}</div>
        ) : !offers.length ? (
          <EmptyState
            title="No offers found"
            description={
              statusFilter
                ? `There are no ${statusFilter} offers in this tab.`
                : "No customer bargain offers have been submitted yet."
            }
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#64748b",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={{ padding: "12px 14px" }}>Buyer</th>
                  <th style={{ padding: "12px 14px" }}>Product</th>
                  <th style={{ padding: "12px 14px" }}>Listed Price</th>
                  <th style={{ padding: "12px 14px" }}>Offered Price</th>
                  <th style={{ padding: "12px 14px" }}>Counter Price</th>
                  <th style={{ padding: "12px 14px" }}>Message</th>
                  <th style={{ padding: "12px 14px" }}>Status</th>
                  <th style={{ padding: "12px 14px" }}>Date</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const buyer = offer.buyer || offer.user || {};
                  const buyerName =
                    [buyer.firstName, buyer.lastName]
                      .filter(Boolean)
                      .join(" ") ||
                    buyer.name ||
                    "Customer";
                  const product = offer.product || {};
                  const statusInfo =
                    STATUS_BADGES[offer.status?.toLowerCase()] ||
                    STATUS_BADGES.pending;

                  return (
                    <tr
                      key={offer.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* Buyer */}
                      <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                        <strong
                          style={{
                            display: "block",
                            color: "#1e293b",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {buyerName}
                        </strong>
                        <small style={{ color: "#8593a5", fontSize: 11 }}>
                          {buyer.email || "—"}
                        </small>
                      </td>

                      {/* Product */}
                      <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            maxWidth: 240,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 6,
                              background: "#f1f5f9",
                              overflow: "hidden",
                              flexShrink: 0,
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            {product.image_url || product.image ? (
                              <img
                                src={product.image_url || product.image}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <Box size={16} color="#94a3b8" />
                            )}
                          </div>
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontWeight: 500,
                              color: "#334155",
                            }}
                            title={product.name || "Product"}
                          >
                            {product.name || "Product"}
                          </span>
                        </div>
                      </td>

                      {/* Listed Price */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                          color: "#64748b",
                        }}
                      >
                        ₦ {formatNaira(product.price || 0)}
                      </td>

                      {/* Offered Price */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                          fontWeight: 700,
                          color: "#df5a23",
                        }}
                      >
                        ₦ {formatNaira(offer.offeredPrice)}
                      </td>

                      {/* Counter Price */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {offer.counterPrice ? (
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#2563eb",
                            }}
                          >
                            ₦ {formatNaira(offer.counterPrice)}
                          </span>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
                      </td>

                      {/* Message */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          maxWidth: 160,
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: "#64748b",
                            fontSize: 12,
                          }}
                          title={offer.message || ""}
                        >
                          {offer.message || <span style={{ color: "#cbd5e1" }}>—</span>}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 9px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            background: statusInfo.bg,
                            color: statusInfo.color,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                          color: "#94a3b8",
                          fontSize: 12,
                        }}
                      >
                        {offer.createdAt
                          ? new Date(offer.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          textAlign: "right",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            type="button"
                            title="View details"
                            onClick={() => setDetailModal(offer)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 6,
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                              color: "#475569",
                              display: "grid",
                              placeItems: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Eye size={15} />
                          </button>

                          {/* Action controls for pending offers on My Offers tab */}
                          {tab === "mine" && offer.status === "pending" && (
                            <>
                              <button
                                type="button"
                                title="Accept offer"
                                disabled={busy}
                                onClick={() => handleRespond(offer.id, "accepted")}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 6,
                                  border: "1px solid #bbf7d0",
                                  background: "#f0fdf4",
                                  color: "#16a34a",
                                  display: "grid",
                                  placeItems: "center",
                                  cursor: "pointer",
                                }}
                              >
                                <Check size={15} />
                              </button>
                              <button
                                type="button"
                                title="Counter offer"
                                disabled={busy}
                                onClick={() => openCounterModal(offer)}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 6,
                                  border: "1px solid #bfdbfe",
                                  background: "#eff6ff",
                                  color: "#2563eb",
                                  display: "grid",
                                  placeItems: "center",
                                  cursor: "pointer",
                                }}
                              >
                                <Tag size={15} />
                              </button>
                              <button
                                type="button"
                                title="Reject offer"
                                disabled={busy}
                                onClick={() => handleRespond(offer.id, "rejected")}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 6,
                                  border: "1px solid #fecaca",
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  display: "grid",
                                  placeItems: "center",
                                  cursor: "pointer",
                                }}
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 16,
              marginTop: 16,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of{" "}
              {total} offers
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <Button
                variant="outline"
                disabled={page <= 1 || resource.loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ minHeight: 30, padding: "0 10px", fontSize: 12 }}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    border: p === page ? "1px solid #df5a23" : "1px solid #e2e8f0",
                    background: p === page ? "#df5a23" : "#fff",
                    color: p === page ? "#fff" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
              <Button
                variant="outline"
                disabled={page >= totalPages || resource.loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{ minHeight: 30, padding: "0 10px", fontSize: 12 }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Offer Detail Modal */}
      {detailModal && (
        <Modal
          title="Offer Details"
          onClose={() => setDetailModal(null)}
          footer={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Button variant="outline" onClick={() => setDetailModal(null)}>
                Close
              </Button>
              {tab === "mine" && detailModal.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="danger"
                    disabled={busy}
                    onClick={() => handleRespond(detailModal.id, "rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      const m = detailModal;
                      setDetailModal(null);
                      openCounterModal(m);
                    }}
                  >
                    Counter
                  </Button>
                  <Button
                    variant="primary"
                    loading={busy}
                    onClick={() => handleRespond(detailModal.id, "accepted")}
                  >
                    Accept
                  </Button>
                </div>
              )}
            </div>
          }
        >
          <div style={{ display: "grid", gap: 16 }}>
            {/* Origin Pill */}
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 600,
                  background: detailModal.product?.vendorId ? "#f3e8ff" : "#ffedd5",
                  color: detailModal.product?.vendorId ? "#7e22ce" : "#c2410c",
                }}
              >
                {detailModal.product?.vendorId ? "Vendor product" : "Admin product"}
              </span>
            </div>

            {/* Product Card */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  background: "#edf1f3",
                  overflow: "hidden",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {detailModal.product?.image_url || detailModal.product?.image ? (
                  <img
                    src={
                      detailModal.product.image_url || detailModal.product.image
                    }
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Box size={20} color="#94a3b8" />
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <strong
                  style={{
                    display: "block",
                    color: "#1e293b",
                    fontSize: 14,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {detailModal.product?.name || "Product"}
                </strong>
                <small style={{ color: "#64748b", fontSize: 12 }}>
                  Listed price:{" "}
                  <strong style={{ color: "#1e293b" }}>
                    ₦ {formatNaira(detailModal.product?.price || 0)}
                  </strong>
                </small>
              </div>
            </div>

            {/* Buyer Details */}
            <div
              style={{
                display: "grid",
                gap: 4,
                padding: 12,
                borderRadius: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: "0.05em",
                }}
              >
                Buyer Information
              </span>
              <strong style={{ fontSize: 14, color: "#1e293b" }}>
                {[detailModal.buyer?.firstName, detailModal.buyer?.lastName]
                  .filter(Boolean)
                  .join(" ") ||
                  detailModal.buyer?.name ||
                  "Customer"}
              </strong>
              <small style={{ color: "#64748b", fontSize: 12 }}>
                {detailModal.buyer?.email || "No email available"}
              </small>
              {detailModal.buyer?.phoneNumber && (
                <small style={{ color: "#64748b", fontSize: 12 }}>
                  {detailModal.buyer.phoneNumber}
                </small>
              )}
            </div>

            {/* Pricing Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              <div
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <small style={{ color: "#64748b", fontSize: 11, display: "block" }}>
                  Listed Price
                </small>
                <strong style={{ fontSize: 14, color: "#1e293b" }}>
                  ₦ {formatNaira(detailModal.product?.price || 0)}
                </strong>
              </div>
              <div
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: "#fff7ed",
                  border: "1px solid #ffedd5",
                }}
              >
                <small style={{ color: "#c2410c", fontSize: 11, display: "block" }}>
                  Offered Price
                </small>
                <strong style={{ fontSize: 14, color: "#ea580c" }}>
                  ₦ {formatNaira(detailModal.offeredPrice)}
                </strong>
              </div>
              <div
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: "#eff6ff",
                  border: "1px solid #dbeafe",
                }}
              >
                <small style={{ color: "#1e40af", fontSize: 11, display: "block" }}>
                  Counter Price
                </small>
                <strong style={{ fontSize: 14, color: "#2563eb" }}>
                  {detailModal.counterPrice ? (
                    `₦ ${formatNaira(detailModal.counterPrice)}`
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </strong>
              </div>
            </div>

            {/* Buyer Message */}
            {detailModal.message && (
              <div style={{ display: "grid", gap: 4 }}>
                <span
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: "#94a3b8",
                    letterSpacing: "0.05em",
                  }}
                >
                  Buyer's Message
                </span>
                <p
                  style={{
                    margin: 0,
                    padding: 10,
                    borderRadius: 8,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#334155",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {detailModal.message}
                </p>
              </div>
            )}

            {/* Status & Date */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 8,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background: (
                    STATUS_BADGES[detailModal.status?.toLowerCase()] ||
                    STATUS_BADGES.pending
                  ).bg,
                  color: (
                    STATUS_BADGES[detailModal.status?.toLowerCase()] ||
                    STATUS_BADGES.pending
                  ).color,
                }}
              >
                {(
                  STATUS_BADGES[detailModal.status?.toLowerCase()] ||
                  STATUS_BADGES.pending
                ).label}
              </span>
              <small style={{ color: "#94a3b8", fontSize: 12 }}>
                {detailModal.createdAt
                  ? new Date(detailModal.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </small>
            </div>
          </div>
        </Modal>
      )}

      {/* Counter Offer Modal */}
      {counterModal && (
        <Modal
          title="Send Counter Offer"
          onClose={() => !busy && setCounterModal(null)}
        >
          <form className="admin-content-form" onSubmit={submitCounter}>
            <div
              style={{
                display: "grid",
                gap: 6,
                padding: 12,
                borderRadius: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <strong style={{ fontSize: 13, color: "#1e293b" }}>
                {counterModal.product?.name || "Product"}
              </strong>
              <small style={{ color: "#64748b" }}>
                Buyer:{" "}
                <strong style={{ color: "#334155" }}>
                  {[counterModal.buyer?.firstName, counterModal.buyer?.lastName]
                    .filter(Boolean)
                    .join(" ") || "Customer"}
                </strong>
              </small>
              <small style={{ color: "#64748b" }}>
                Buyer's offer:{" "}
                <strong style={{ color: "#df5a23" }}>
                  ₦ {formatNaira(counterModal.offeredPrice)}
                </strong>
              </small>
            </div>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Counter Price (₦)
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: counterError ? "1px solid #ef4444" : "1px solid #cbd5e1",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    padding: "8px 12px",
                    background: "#f1f5f9",
                    color: "#64748b",
                    fontSize: 13,
                    fontWeight: 600,
                    borderRight: "1px solid #cbd5e1",
                  }}
                >
                  ₦
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="Enter counter price"
                  value={counterPrice}
                  onChange={(e) => {
                    setCounterPrice(e.target.value);
                    setCounterError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "none",
                    outline: "none",
                    fontSize: 13,
                  }}
                  autoFocus
                />
              </div>
              {counterError && (
                <span style={{ color: "#ef4444", fontSize: 11 }}>
                  {counterError}
                </span>
              )}
            </label>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 10,
              }}
            >
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setCounterModal(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={busy}>
                Send Counter
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export default AdminOffers;
