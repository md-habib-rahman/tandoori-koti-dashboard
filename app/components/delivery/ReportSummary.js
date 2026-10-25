"use client";

import {
  Banknote,
  CheckCircle2,
  Clock,
  Hourglass,
  Receipt,
  XCircle,
} from "lucide-react";

// Save as: src/components/admin/delivery/ReportSummary.js

export const money = (value) => `€${Number(value || 0).toFixed(2)}`;
const minutes = (value) =>
  value === null || value === undefined ? "–" : `${Math.round(value)} min`;

export default function ReportSummary({ summary }) {
  const cards = [
    {
      label: "Delivered",
      value: summary.delivered,
      note: `of ${summary.totalOrders} orders placed`,
      Icon: CheckCircle2,
      tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Cash collected",
      value: money(summary.revenue),
      note: "total of delivered orders",
      Icon: Banknote,
      tone: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      label: "Average order",
      value: money(summary.averageOrder),
      note: "per delivered order",
      Icon: Receipt,
      tone: "text-sky-700 bg-sky-50 border-sky-200",
    },
    {
      label: "Average delivery time",
      value: minutes(summary.averageDeliveryMinutes),
      note: "from order to delivered",
      Icon: Clock,
      tone: "text-violet-700 bg-violet-50 border-violet-200",
    },
    {
      label: "Cancelled",
      value: summary.cancelled,
      note: summary.cancelled
        ? `${money(summary.cancelledValue)} not collected`
        : "none",
      Icon: XCircle,
      tone: "text-rose-700 bg-rose-50 border-rose-200",
    },
    {
      label: "Still open",
      value: summary.inProgress,
      note: "new, preparing or on the way",
      Icon: Hourglass,
      tone: "text-slate-700 bg-slate-50 border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ label, value, note, Icon, tone }) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <span
            className={`grid h-9 w-9 place-items-center rounded-xl border ${tone}`}
          >
            <Icon size={18} aria-hidden="true" />
          </span>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500">{note}</p>
        </div>
      ))}
    </div>
  );
}
