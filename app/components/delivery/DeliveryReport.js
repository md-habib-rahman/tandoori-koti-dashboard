"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import useDeliveryReport from "@/hook/useDeliveryReport";
import ReportSummary from "./ReportSummary";
import ReportBreakdowns from "./ReportBreakdowns";
import ReportOrdersTable from "./ReportOrdersTable";
import { PRESETS, formatDate, todayIso } from "./reportDates";

// Save as: src/components/admin/delivery/DeliveryReport.js
// Mount it on an admin page, for example src/app/admin/delivery/report/page.js:  <DeliveryReport />

// ADJUST: the admin address of the live dashboard
const DASHBOARD_PAGE_URL = "/admin/dashboard/delivery";

export default function DeliveryReport() {
  const today = useMemo(() => todayIso(), []);
  const thisWeek = PRESETS.find((p) => p.id === "thisWeek").range(today);

  const [from, setFrom] = useState(thisWeek.from);
  const [to, setTo] = useState(thisWeek.to);
  const [reloadKey, setReloadKey] = useState(0);

  const validRange = from && to && from <= to;
  const { data, loading, error } = useDeliveryReport(
    validRange ? from : "",
    validRange ? to : "",
    reloadKey,
  );

  const activePreset = PRESETS.find((p) => {
    const r = p.range(today);
    return r.from === from && r.to === to;
  })?.id;

  const applyPreset = (preset) => {
    const r = preset.range(today);
    setFrom(r.from);
    setTo(r.to);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-3 py-4 sm:px-4">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href={DASHBOARD_PAGE_URL}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:underline"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to live orders
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Delivery Report
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {validRange
              ? `Orders placed ${formatDate(from)}${from === to ? "" : ` – ${formatDate(to)}`} (Finnish time). Weeks run Sunday to Saturday.`
              : "Choose a valid date range."}
          </p>
        </div>

        {/* Date range */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                aria-pressed={activePreset === preset.id}
                className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors ${
                  activePreset === preset.id
                    ? "border-amber-600 bg-amber-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <label className="flex items-center gap-2">
              From
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </label>
            <label className="flex items-center gap-2">
              To
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Body */}
      {!validRange ? (
        <p className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400">
          The start date must not be after the end date.
        </p>
      ) : loading ? (
        <div className="space-y-4" aria-busy="true">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center"
        >
          <p className="font-semibold text-rose-800">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
          >
            Try again
          </button>
        </div>
      ) : data ? (
        <>
          {data.truncated && (
            <p className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              This period has more orders than the report can load, so the
              figures are incomplete. Choose a shorter period.
            </p>
          )}

          {data.summary.totalOrders === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
              No delivery orders in this period.
            </p>
          ) : (
            <>
              <ReportSummary summary={data.summary} />
              <ReportBreakdowns
                byMedium={data.byMedium}
                byDay={data.byDay}
                topDishes={data.topDishes}
              />
              <ReportOrdersTable
                orders={data.orders}
                from={data.range.from}
                to={data.range.to}
              />
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
