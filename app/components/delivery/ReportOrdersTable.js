"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, SkipBack, SkipForward } from "lucide-react";
import { STATUS_STYLES } from "./deliveryStatus";
import { money } from "./ReportSummary";

// Save as: src/components/admin/delivery/ReportOrdersTable.js

const PAGE_SIZE = 15;
const NOT_RECORDED = "__none__";

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("fi-FI", {
        timeZone: "Europe/Helsinki",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

// CSV for Finnish Excel: ";" between columns, a decimal comma, and a BOM so ä and ö show correctly
function buildCsv(orders) {
  const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = [
    "Order",
    "Ordered",
    "Delivered",
    "Status",
    "Customer",
    "Phone",
    "Address",
    "Postal code",
    "Delivery by",
    "Payment",
    "Total (EUR)",
    "Items",
    "Cancel reason",
  ];

  const rows = orders.map((o) =>
    [
      o.orderNumber,
      formatDateTime(o.createdAt),
      formatDateTime(o.deliveredAt),
      STATUS_STYLES[o.status]?.label || o.status,
      o.customerName,
      o.customerPhone,
      o.deliveryAddress,
      o.postalCode,
      o.deliveryMedium,
      o.paymentMethod === "CASH_ON_DELIVERY"
        ? "Cash on delivery"
        : o.paymentMethod,
      Number(o.totalPrice || 0)
        .toFixed(2)
        .replace(".", ","),
      o.items,
      o.cancelReason,
    ]
      .map(quote)
      .join(";"),
  );

  return "\uFEFF" + [header.map(quote).join(";"), ...rows].join("\r\n");
}

function downloadCsv(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ReportOrdersTable({ orders, from, to }) {
  const [medium, setMedium] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const mediumNames = useMemo(
    () =>
      [...new Set(orders.map((o) => o.deliveryMedium).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [orders],
  );

  const filtered = useMemo(
    () =>
      orders
        .filter((o) => {
          if (medium === "ALL") return true;
          if (medium === NOT_RECORDED) return !o.deliveryMedium;
          return o.deliveryMedium === medium;
        })
        .filter((o) => status === "ALL" || o.status === status)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, medium, status],
  );

  // Back to page 1 whenever the list changes
  useEffect(() => setPage(1), [orders, medium, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectClass =
    "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <header className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-bold text-slate-900">Orders</h2>
          <p className="text-xs text-slate-500">
            {filtered.length} of {orders.length} orders shown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            aria-label="Filter by delivery medium"
            className={selectClass}
          >
            <option value="ALL">All riders and services</option>
            {mediumNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value={NOT_RECORDED}>Not recorded</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className={selectClass}
          >
            <option value="ALL">All statuses</option>
            {Object.entries(STATUS_STYLES).map(([id, s]) => (
              <option key={id} value={id}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={filtered.length === 0}
            onClick={() =>
              downloadCsv(
                buildCsv(filtered),
                `delivery-report-${from}_${to}.csv`,
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={15} aria-hidden="true" />
            Download CSV
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <th className="py-2.5 pr-3">Order</th>
              <th className="px-3 py-2.5">Customer</th>
              <th className="px-3 py-2.5">Address</th>
              <th className="px-3 py-2.5">Delivery by</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Food Cost</th>
              <th className="py-2.5 pl-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  No orders match these filters.
                </td>
              </tr>
            ) : (
              visible.map((o) => {
                const s = STATUS_STYLES[o.status] || STATUS_STYLES.PENDING;
                return (
                  <tr key={o.id} className="align-top hover:bg-slate-50/60">
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">
                        #{o.orderNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(o.createdAt)}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <p className="font-medium text-slate-900">
                        {o.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {o.customerPhone}
                      </p>
                    </td>
                    <td className="max-w-[14rem] px-3 py-2.5 text-slate-700">
                      {o.deliveryAddress}
                      {o.postalCode ? `, ${o.postalCode}` : ""}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">
                      {o.deliveryMedium || (
                        <span className="text-slate-300">–</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${s.badge}`}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="py-2.5 pl-3 text-right font-semibold whitespace-nowrap text-slate-900">
                      {money(o.menuTotal)}
                    </td>
                    <td className="py-2.5 pl-3 text-right font-semibold whitespace-nowrap text-slate-900">
                      {money(o.totalPrice)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          Page <span className="font-semibold text-slate-800">{page}</span> of{" "}
          <span className="font-semibold text-slate-800">{pages}</span>
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SkipBack size={16} />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            aria-label="Next page"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SkipForward size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
