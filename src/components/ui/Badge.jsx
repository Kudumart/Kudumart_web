const tones = {
  ACTIVE: "status-badge--active",
  SUCCESS: "status-badge--active",
  DRAFT: "status-badge--neutral",
  INVITED: "status-badge--info",
  PAUSED: "status-badge--warning",
  SUSPENDED: "status-badge--warning",
  SCHEDULED: "status-badge--info",
  ENDED: "status-badge--neutral",
  ARCHIVED: "status-badge--neutral",
  REVOKED: "status-badge--danger",
  EXPIRED: "status-badge--danger",
  TERMINATED: "status-badge--danger",
  PENDING: "status-badge--warning",
  AVAILABLE: "status-badge--active",
  PAID: "status-badge--info",
  REVERSED: "status-badge--danger",
  CANCELLED: "status-badge--danger",
  APPROVED: "status-badge--info",
  PROCESSING: "status-badge--warning",
  FAILED: "status-badge--danger",
};

export default function Badge({ children, tone }) {
  const key = String(tone || children || "").toUpperCase();
  return <span className={`status-badge ${tones[key] || "status-badge--neutral"}`}>{["ACTIVE", "AVAILABLE"].includes(key) && <span className="status-badge__dot" />}{children}</span>;
}
