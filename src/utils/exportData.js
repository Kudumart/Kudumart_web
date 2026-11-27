import * as XLSX from "xlsx";

/**
 * Normalizes a date value into a readable YYYY-MM-DD HH:mm string for spreadsheets.
 */
function formatExportDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().replace("T", " ").slice(0, 16);
}

/**
 * Maps raw API records into clean, human-readable spreadsheet columns by entity kind.
 */
export function mapRowsForExport(kind, rows = []) {
  if (kind === "vendors") {
    return rows.map((v) => ({
      "Full Name": [v.firstName, v.lastName].filter(Boolean).join(" ") || v.name || "",
      Email: v.email || "",
      Phone: v.phoneNumber || v.phone || "",
      "Tracking ID": v.trackingId || "",
      Status: v.status || "",
      Verified: v.isVerified ? "Yes" : "No",
      "Joined Date": formatExportDate(v.createdAt || v.created_at),
    }));
  }

  if (kind === "customers") {
    return rows.map((c) => ({
      "Full Name": [c.firstName, c.lastName].filter(Boolean).join(" ") || c.name || "",
      Email: c.email || "",
      Phone: c.phoneNumber || c.phone || "",
      Status: c.status || "",
      Verified: c.isVerified ? "Yes" : "No",
      "Joined Date": formatExportDate(c.createdAt || c.created_at),
    }));
  }

  if (kind === "products") {
    return rows.map((p) => ({
      "Product Name": p.name || "",
      SKU: p.sku || "",
      Price: Number(p.price || 0),
      "Discount Price": Number(p.discount_price ?? p.discountPrice ?? 0),
      Currency: p.store?.currency?.symbol || "₦",
      Quantity: Number(p.quantity ?? 0),
      Condition: (p.condition || "").replaceAll("_", " "),
      Status: p.status || "",
      Category: p.sub_category?.name || p.category?.name || "",
      Store: p.store?.name || "",
      Vendor: p.vendor
        ? [p.vendor.firstName, p.vendor.lastName].filter(Boolean).join(" ") || p.vendor.email
        : p.admin?.name || "Admin",
      "Created Date": formatExportDate(p.createdAt || p.created_at),
    }));
  }

  if (kind === "orders") {
    return rows.map((o) => ({
      "Order Ref": o.refId || o.trackingNumber || o.id || "",
      Customer: o.user
        ? [o.user.firstName, o.user.lastName].filter(Boolean).join(" ") || o.user.email
        : "",
      "Total Amount": Number(o.totalAmount ?? o.total ?? 0),
      Status: o.status || "",
      "Payment Status": o.paymentStatus || "",
      "Created Date": formatExportDate(o.createdAt || o.created_at),
    }));
  }

  return rows;
}

/**
 * Triggers a browser download of an Excel (.xlsx) or CSV (.csv) file.
 */
export function downloadSpreadsheet({ rows, filename, format = "xlsx", sheetName = "Data" }) {
  if (!rows || !rows.length) {
    throw new Error("No records available to export.");
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const safeBase = `${filename}-${stamp}`;

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths nicely for Excel
  const keys = Object.keys(rows[0] || {});
  worksheet["!cols"] = keys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.slice(0, 200).map((r) => String(r[key] ?? "").length),
    );
    return { wch: Math.min(48, Math.max(12, maxLen + 3)) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

  if (format === "csv") {
    XLSX.writeFile(workbook, `${safeBase}.csv`, { bookType: "csv" });
  } else {
    XLSX.writeFile(workbook, `${safeBase}.xlsx`, { bookType: "xlsx" });
  }
}
