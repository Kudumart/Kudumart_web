import { useState, useMemo } from "react";
import {
  CalendarClock,
  SlidersHorizontal,
  ShieldCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  PackageCheck,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { adminApi } from "../../api/admin";
import {
  Button,
  Badge,
  Modal,
  EmptyState,
  Skeleton,
} from "../../components/ui";
import { useResource } from "../../hooks/useResource";
import { useApp } from "../../contexts/AppContext";

const STATUS_BADGES = {
  active: { tone: "warning", label: "Active (Holding)" },
  completed: { tone: "success", label: "Completed (Paid)" },
  defaulted: { tone: "danger", label: "Defaulted" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

const MODE_LABELS = {
  disabled: {
    title: "Disabled",
    desc: "Installment payments are turned off across the marketplace.",
  },
  layaway_only: {
    title: "Layaway Only (Hold Inventory)",
    desc: "Hold product exclusively in stock until buyer finishes 100% payments. Ships on final milestone.",
  },
  bnpl_only: {
    title: "Buy Now Pay Later (BNPL)",
    desc: "Dispatches product immediately upon deposit/approval. Subsequent milestones collected over time.",
  },
  hybrid: {
    title: "Hybrid (Layaway & BNPL)",
    desc: "Configurable per product or seller eligibility.",
  },
};

const formatNaira = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "₦0";
  return `₦${num.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export function AdminInstallments() {
  const { notify } = useApp();
  const [activeTab, setActiveTab] = useState("config"); // "config" | "plans"
  const [revision, setRevision] = useState(0);

  // Plans Filter State
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Fetch Config
  const configResource = useResource(
    (signal) => adminApi.installmentConfig(signal),
    [revision],
  );

  // Fetch Plans
  const plansResource = useResource(
    (signal) => {
      const params = { page, limit: 12 };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      return adminApi.installmentPlans(params, signal);
    },
    [page, statusFilter, searchQuery, revision],
  );

  // Detail Modal Resource
  const planDetailResource = useResource(
    (signal) => {
      if (!selectedPlanId) return Promise.resolve(null);
      return adminApi.installmentPlanDetail(selectedPlanId, signal);
    },
    [selectedPlanId],
  );

  // Form State initialized from configResource
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync loaded config to form
  useMemo(() => {
    if (configResource.data?.data && !formData) {
      setFormData(configResource.data.data);
    }
  }, [configResource.data]);

  const handleConfigChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    try {
      await adminApi.saveInstallmentConfig(formData);
      notify({ message: "Installment settings updated successfully", type: "success" });
      setRevision((r) => r + 1);
    } catch (err) {
      notify({ message: err.message || "Failed to update settings", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const addTenureOption = () => {
    const existing = formData.allowed_tenures || [];
    const count = existing.length + 1;
    const newTenure = {
      id: `${count}_payments`,
      label: `${count} Payments (${count * 30} Days)`,
      installments: count,
      tenure_days: count * 30,
      interval_days: 30,
      is_active: true,
    };
    setFormData((prev) => ({
      ...prev,
      allowed_tenures: [...existing, newTenure],
    }));
  };

  const toggleTenure = (index) => {
    const updated = [...(formData.allowed_tenures || [])];
    updated[index] = {
      ...updated[index],
      is_active: !updated[index].is_active,
    };
    setFormData((prev) => ({
      ...prev,
      allowed_tenures: updated,
    }));
  };

  const removeTenure = (index) => {
    const updated = [...(formData.allowed_tenures || [])];
    updated.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      allowed_tenures: updated,
    }));
  };

  const plansPayload = plansResource.data?.data;
  const plans = plansPayload?.plans || [];
  const totalPlans = plansPayload?.total || 0;
  const totalPages = plansPayload?.totalPages || 1;

  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">COMMERCE & FINANCING</span>
          <h1>Installment & Layaway Management</h1>
          <p>
            Configure inventory layaway policies, BNPL switching, deposit thresholds, tenure limits,
            and monitor buyer installment timelines.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => setRevision((r) => r + 1)}
            loading={configResource.loading || plansResource.loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-content-tabs">
        <button
          type="button"
          className={activeTab === "config" ? "active" : ""}
          onClick={() => setActiveTab("config")}
        >
          <SlidersHorizontal size={16} /> Configuration & Policy Rules
        </button>
        <button
          type="button"
          className={activeTab === "plans" ? "active" : ""}
          onClick={() => setActiveTab("plans")}
        >
          <CalendarClock size={16} /> Buyer Plans ({totalPlans})
        </button>
      </div>

      {/* TAB 1: Configuration */}
      {activeTab === "config" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {configResource.loading && !formData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Skeleton className="skeleton-box" style={{ height: "120px" }} />
              <Skeleton className="skeleton-box" style={{ height: "200px" }} />
            </div>
          ) : !formData ? (
            <EmptyState
              icon={AlertTriangle}
              title="Unable to load configuration"
              description="Could not connect to the installment configuration service."
              action={
                <Button onClick={() => setRevision((r) => r + 1)}>Retry</Button>
              }
            />
          ) : (
            <form onSubmit={handleSaveConfig} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Card 1: Operating Mode */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Layers size={20} color="#0f172a" />
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>System Operating Mode</h3>
                </div>
                <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: "14px" }}>
                  Choose how KuduMart fulfills installment purchases. You can operate in traditional layaway (hold item until fully paid), instant dispatch BNPL, or a hybrid setup.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {Object.entries(MODE_LABELS).map(([key, item]) => {
                    const isSelected = formData.system_mode === key;
                    return (
                      <div
                        key={key}
                        onClick={() => handleConfigChange("system_mode", key)}
                        style={{
                          padding: "16px",
                          borderRadius: "10px",
                          border: isSelected ? "2px solid #0f172a" : "1px solid #e2e8f0",
                          background: isSelected ? "#f8fafc" : "#fff",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontWeight: 600, fontSize: "14px", color: isSelected ? "#0f172a" : "#334155" }}>
                            {item.title}
                          </span>
                          <span
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              border: isSelected ? "5px solid #0f172a" : "2px solid #cbd5e1",
                              display: "inline-block",
                            }}
                          />
                        </div>
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.45 }}>
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "14px 18px",
                    borderRadius: "8px",
                    background: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <PackageCheck size={18} color="#334155" />
                  <div style={{ fontSize: "13px", color: "#334155" }}>
                    <strong>Fulfillment Trigger:</strong>{" "}
                    {formData.fulfillment_trigger === "on_completion" ? (
                      <span><strong>Hold in inventory</strong> until final payment is settled (Layaway default)</span>
                    ) : (
                      <span><strong>Immediate dispatch</strong> upon initial deposit confirmation (BNPL)</span>
                    )}
                  </div>
                  <select
                    value={formData.fulfillment_trigger}
                    onChange={(e) => handleConfigChange("fulfillment_trigger", e.target.value)}
                    style={{
                      marginLeft: "auto",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      background: "#fff",
                    }}
                  >
                    <option value="on_completion">Ship on 100% completion (Layaway)</option>
                    <option value="on_deposit">Ship immediately on deposit (BNPL)</option>
                  </select>
                </div>
              </div>

              {/* Card 2: Order Bounds & Deposit Rules */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <DollarSign size={20} color="#0f172a" />
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>Order Limits & Deposit Thresholds</h3>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <label className="field">
                    <span className="field__label">Minimum Order Value (₦)</span>
                    <input
                      type="number"
                      className="field__input"
                      value={formData.min_order_amount}
                      onChange={(e) => handleConfigChange("min_order_amount", e.target.value)}
                      min="1000"
                      step="1000"
                    />
                    <span className="field__hint">Products below this price cannot be paid in installments</span>
                  </label>

                  <label className="field">
                    <span className="field__label">Maximum Order Value (₦)</span>
                    <input
                      type="number"
                      className="field__input"
                      value={formData.max_order_amount}
                      onChange={(e) => handleConfigChange("max_order_amount", e.target.value)}
                      min="10000"
                      step="10000"
                    />
                    <span className="field__hint">Cap per installment transaction</span>
                  </label>

                  <label className="field">
                    <span className="field__label">Minimum Initial Deposit (%)</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="number"
                        className="field__input"
                        value={formData.min_deposit_percentage}
                        onChange={(e) => handleConfigChange("min_deposit_percentage", e.target.value)}
                        min="10"
                        max="90"
                      />
                      <span style={{ fontWeight: 600, color: "#475569" }}>%</span>
                    </div>
                    <span className="field__hint">Percentage buyer must pay up-front to reserve the item</span>
                  </label>

                  <label className="field">
                    <span className="field__label">Financing / Interest Fee (%)</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="number"
                        className="field__input"
                        value={formData.financing_fee_percentage}
                        onChange={(e) => handleConfigChange("financing_fee_percentage", e.target.value)}
                        min="0"
                        max="50"
                        step="0.5"
                      />
                      <span style={{ fontWeight: 600, color: "#475569" }}>%</span>
                    </div>
                    <span className="field__hint">Set 0% for zero-interest layaway</span>
                  </label>
                </div>
              </div>

              {/* Card 3: Default Policies & Inventory Release */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Clock size={20} color="#0f172a" />
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>Default Policies & Inventory Release</h3>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <label className="field">
                    <span className="field__label">Grace Period (Days)</span>
                    <input
                      type="number"
                      className="field__input"
                      value={formData.grace_period_days}
                      onChange={(e) => handleConfigChange("grace_period_days", e.target.value)}
                      min="1"
                      max="30"
                    />
                    <span className="field__hint">Days after missed milestone before product returns to inventory</span>
                  </label>

                  <label className="field">
                    <span className="field__label">Cancellation / Restocking Fee (%)</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="number"
                        className="field__input"
                        value={formData.cancellation_fee_percentage}
                        onChange={(e) => handleConfigChange("cancellation_fee_percentage", e.target.value)}
                        min="0"
                        max="50"
                        step="0.5"
                      />
                      <span style={{ fontWeight: 600, color: "#475569" }}>%</span>
                    </div>
                    <span className="field__hint">Deducted from buyer's refund when plan defaults or is cancelled</span>
                  </label>

                  <label className="field">
                    <span className="field__label">Vendor Fee Compensation Split (%)</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="number"
                        className="field__input"
                        value={formData.vendor_split_percentage}
                        onChange={(e) => handleConfigChange("vendor_split_percentage", e.target.value)}
                        min="0"
                        max="100"
                        step="5"
                      />
                      <span style={{ fontWeight: 600, color: "#475569" }}>%</span>
                    </div>
                    <span className="field__hint">Portion of restocking fee credited to vendor for holding inventory</span>
                  </label>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#334155" }}>Refund Destination</span>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "8px" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(formData.refund_to_wallet)}
                        onChange={(e) => handleConfigChange("refund_to_wallet", e.target.checked)}
                      />
                      <span style={{ fontSize: "14px", color: "#1e293b" }}>Refund balance directly to Buyer's KuduMart Wallet</span>
                    </label>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      Instant deposit for immediate re-use on KuduMart
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: Tenure Options */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CalendarClock size={20} color="#0f172a" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>Available Tenure Durations</h3>
                      <p style={{ margin: "2px 0 0 0", color: "#64748b", fontSize: "13px" }}>
                        Options presented to buyers in the checkout installment calculator.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    onClick={addTenureOption}
                  >
                    Add Tenure
                  </Button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Option Label</th>
                        <th>Milestones</th>
                        <th>Total Tenure</th>
                        <th>Interval</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData.allowed_tenures || []).map((tenure, idx) => (
                        <tr key={tenure.id || idx}>
                          <td>
                            <strong>{tenure.label}</strong>
                          </td>
                          <td>{tenure.installments} Payments</td>
                          <td>{tenure.tenure_days} Days</td>
                          <td>Every {tenure.interval_days} Days</td>
                          <td>
                            <Badge tone={tenure.is_active !== false ? "success" : "neutral"}>
                              {tenure.is_active !== false ? "Enabled" : "Disabled"}
                            </Badge>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "6px" }}>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toggleTenure(idx)}
                              >
                                {tenure.is_active !== false ? "Disable" : "Enable"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                icon={Trash2}
                                onClick={() => removeTenure(idx)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card 5: Vendor Eligibility */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <ShieldCheck size={20} color="#0f172a" />
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>Vendor Restrictions</h3>
                </div>

                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="vendor_restriction"
                      checked={formData.vendor_restriction === "all_vendors"}
                      onChange={() => handleConfigChange("vendor_restriction", "all_vendors")}
                    />
                    <span style={{ fontSize: "14px", color: "#1e293b" }}>All active sellers can offer layaway</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="vendor_restriction"
                      checked={formData.vendor_restriction === "verified_only"}
                      onChange={() => handleConfigChange("vendor_restriction", "verified_only")}
                    />
                    <span style={{ fontSize: "14px", color: "#1e293b" }}>Verified KYC sellers only</span>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <Button
                  type="submit"
                  loading={isSaving}
                  size="lg"
                  icon={CheckCircle2}
                >
                  Save Installment Configuration
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: Customer Plans */}
      {activeTab === "plans" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filters Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              background: "#fff",
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["", "active", "completed", "defaulted", "cancelled"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: statusFilter === st ? "1px solid #0f172a" : "1px solid #cbd5e1",
                    background: statusFilter === st ? "#0f172a" : "#fff",
                    color: statusFilter === st ? "#fff" : "#475569",
                    fontSize: "13px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {st || "All Plans"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ position: "relative" }}>
                <Search
                  size={16}
                  style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
                />
                <input
                  type="text"
                  placeholder="Search buyer name/email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    padding: "7px 12px 7px 32px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    minWidth: "220px",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {plansResource.loading ? (
            <div style={{ background: "#fff", padding: "24px", borderRadius: "10px" }}>
              <Skeleton className="skeleton-box" style={{ height: "300px" }} />
            </div>
          ) : plans.length === 0 ? (
            <div style={{ background: "#fff", padding: "32px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <EmptyState
                icon={CalendarClock}
                title="No installment plans found"
                description={
                  statusFilter
                    ? `No installment plans with status "${statusFilter}".`
                    : "When customers choose layaway or installment payments at checkout, they will appear here."
                }
              />
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Buyer</th>
                    <th>Product</th>
                    <th>Mode</th>
                    <th>Total / Remaining</th>
                    <th>Progress</th>
                    <th>Reserved Until</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => {
                    const paidMilestones = (plan.milestones || []).filter((m) => m.status === "paid").length;
                    const totalMilestones = (plan.milestones || []).length || plan.numberOfInstallments;
                    const progressPercent = Math.min(
                      100,
                      Math.round(((Number(plan.totalAmount) - Number(plan.remainingBalance)) / Number(plan.totalAmount)) * 100) || 0,
                    );
                    const statusMeta = STATUS_BADGES[plan.status] || { tone: "neutral", label: plan.status };

                    return (
                      <tr key={plan.id}>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <strong style={{ fontSize: "14px" }}>
                              {plan.buyer?.firstName} {plan.buyer?.lastName}
                            </strong>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              {plan.buyer?.email}
                            </span>
                            {plan.buyer?.phoneNumber && (
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                {plan.buyer?.phoneNumber}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {plan.product?.image_url && (
                              <img
                                src={plan.product.image_url}
                                alt=""
                                style={{ width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover" }}
                              />
                            )}
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "13px", fontWeight: 500 }}>
                                {plan.product?.name || "Product"}
                              </span>
                              <span style={{ fontSize: "11px", color: "#64748b" }}>
                                Sold by {plan.vendor?.firstName} {plan.vendor?.lastName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge tone={plan.mode === "bnpl" ? "info" : "neutral"}>
                            {plan.mode === "bnpl" ? "BNPL" : "Layaway"}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <strong style={{ fontSize: "13px" }}>{formatNaira(plan.totalAmount)}</strong>
                            <span style={{ fontSize: "11px", color: "#e11d48" }}>
                              Bal: {formatNaira(plan.remainingBalance)}
                            </span>
                          </div>
                        </td>
                        <td style={{ minWidth: "120px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
                              <span>{paidMilestones}/{totalMilestones} paid</span>
                              <span>{progressPercent}%</span>
                            </div>
                            <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                              <div
                                style={{
                                  width: `${progressPercent}%`,
                                  height: "100%",
                                  background: progressPercent === 100 ? "#10b981" : "#3b82f6",
                                  transition: "width 0.3s ease",
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "#475569" }}>
                            {plan.reservedUntil ? new Date(plan.reservedUntil).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        <td>
                          <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Button
                            size="sm"
                            variant="outline"
                            icon={Eye}
                            onClick={() => setSelectedPlanId(plan.id)}
                          >
                            Details
                          </Button>
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
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span style={{ fontSize: "13px", alignSelf: "center", color: "#64748b" }}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Plan Details Modal */}
      {selectedPlanId && (
        <Modal
          title="Installment Plan Breakdown"
          onClose={() => setSelectedPlanId(null)}
        >
          {planDetailResource.loading || !planDetailResource.data?.data ? (
            <Skeleton className="skeleton-box" style={{ height: "240px" }} />
          ) : (() => {
            const plan = planDetailResource.data.data;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Product & Buyer Summary */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                      Buyer Information
                    </span>
                    <div style={{ marginTop: "4px", fontSize: "14px" }}>
                      <strong>{plan.buyer?.firstName} {plan.buyer?.lastName}</strong>
                      <div>{plan.buyer?.email}</div>
                      <div>{plan.buyer?.phoneNumber || "No phone provided"}</div>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                      Product & Store
                    </span>
                    <div style={{ marginTop: "4px", fontSize: "14px" }}>
                      <strong>{plan.product?.name}</strong>
                      <div>Vendor: {plan.vendor?.firstName} {plan.vendor?.lastName}</div>
                      <div>Mode: <Badge tone={plan.mode === "bnpl" ? "info" : "neutral"}>{plan.mode}</Badge></div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ padding: "12px", background: "#f1f5f9", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Total Plan Value</div>
                    <strong style={{ fontSize: "16px", color: "#0f172a" }}>{formatNaira(plan.totalAmount)}</strong>
                  </div>
                  <div style={{ padding: "12px", background: "#f0fdf4", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#166534" }}>Amount Paid</div>
                    <strong style={{ fontSize: "16px", color: "#166534" }}>
                      {formatNaira(Number(plan.totalAmount) - Number(plan.remainingBalance))}
                    </strong>
                  </div>
                  <div style={{ padding: "12px", background: "#fff1f2", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#9f1239" }}>Remaining Balance</div>
                    <strong style={{ fontSize: "16px", color: "#9f1239" }}>
                      {formatNaira(plan.remainingBalance)}
                    </strong>
                  </div>
                </div>

                {/* Milestone Schedule */}
                <div>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 600 }}>Payment Milestones</h4>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Amount</th>
                          <th>Due Date</th>
                          <th>Paid Date</th>
                          <th>Status</th>
                          <th>Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(plan.milestones || []).map((m) => (
                          <tr key={m.id}>
                            <td>
                              <strong>#{m.installmentNumber}</strong> {m.installmentNumber === 1 && "(Deposit)"}
                            </td>
                            <td>{formatNaira(m.amount)}</td>
                            <td>{new Date(m.dueDate).toLocaleDateString()}</td>
                            <td>{m.paidAt ? new Date(m.paidAt).toLocaleDateString() : "—"}</td>
                            <td>
                              <Badge tone={m.status === "paid" ? "success" : m.status === "overdue" ? "danger" : "warning"}>
                                {m.status}
                              </Badge>
                            </td>
                            <td>
                              <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                                {m.paymentReference || "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Holding & Delivery Policy */}
                <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#eff6ff", fontSize: "13px", color: "#1e40af" }}>
                  <strong>Inventory Status:</strong>{" "}
                  {plan.fulfillment_trigger === "on_completion" ? (
                    <span>
                      Item is held in inventory reserved for this customer until{" "}
                      <strong>{plan.reservedUntil ? new Date(plan.reservedUntil).toLocaleDateString() : "due date"}</strong>.
                      Upon final payment completion, order fulfillment will trigger immediately.
                    </span>
                  ) : (
                    <span>
                      Item dispatched on deposit. Outstanding milestones will be charged to the buyer's saved card on schedule.
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </>
  );
}

export default AdminInstallments;
