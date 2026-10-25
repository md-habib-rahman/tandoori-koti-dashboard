"use client";

import { Clock, Eye, Trash2, Users } from "lucide-react";
import {
  ACTION_META,
  NEXT_STATUSES,
  StatusBadge,
  dayTag,
  formatWhen,
} from "./reservationStatus";

// Save as: src/components/admin/reservations/ReservationsTable.js
// A table on wide screens and stacked cards on phones.

function DayTag({ date }) {
  const tag = dayTag(date);
  if (!tag) return null;
  return (
    <span className="rounded-md border border-violet-300 bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-800">
      {tag}
    </span>
  );
}

// The row buttons: view, the status changes that make sense, and delete
function RowActions({
  reservation,
  busy,
  onView,
  onStatus,
  onDelete,
  withLabels = false,
}) {
  const base = withLabels
    ? "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors"
    : "grid h-8 w-8 place-items-center rounded-lg border transition-colors";

  return (
    <>
      <button
        type="button"
        onClick={() => onView(reservation)}
        title="View request"
        aria-label={`View request from ${reservation.name}`}
        className={`${base} border-slate-300 text-slate-700 hover:bg-slate-100`}
      >
        <Eye size={15} aria-hidden="true" />
        {withLabels && "View"}
      </button>

      {(NEXT_STATUSES[reservation.status] || []).map((status) => {
        const meta = ACTION_META[status];
        return (
          <button
            key={status}
            type="button"
            onClick={() => onStatus(reservation, status)}
            disabled={busy}
            title={meta.label}
            aria-label={`${meta.label}: ${reservation.name}`}
            className={`${base} bg-white disabled:cursor-not-allowed disabled:opacity-50 ${meta.icon}`}
          >
            <meta.Icon size={15} aria-hidden="true" />
            {withLabels && meta.label.split(" ")[0]}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onDelete(reservation)}
        disabled={busy}
        title="Delete"
        aria-label={`Delete reservation from ${reservation.name}`}
        className={`${base} border-rose-200 bg-white text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <Trash2 size={15} aria-hidden="true" />
        {withLabels && "Delete"}
      </button>
    </>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-hidden="true">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
        >
          <div className="h-10 flex-1 rounded-lg bg-slate-100" />
          <div className="h-10 w-24 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function ReservationsTable({
  reservations,
  loading,
  busyId,
  onView,
  onStatus,
  onDelete,
}) {
  if (loading && reservations.length === 0) return <Skeleton />;

  if (reservations.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400">
        No reservations found.
      </p>
    );
  }

  return (
    <div
      className={
        loading ? "opacity-60 transition-opacity" : "transition-opacity"
      }
    >
      {/* Wide screens: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <th className="px-3 py-3">Guest</th>
              <th className="px-3 py-3">Party</th>
              <th className="px-3 py-3">Date and time</th>
              <th className="px-3 py-3">Special requests</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {reservations.map((r) => (
              <tr
                key={r.id}
                className={`transition-colors hover:bg-slate-50/70 ${r.status === "PENDING" ? "bg-amber-50/40" : ""}`}
              >
                <td className="px-3 py-3">
                  <p className="font-semibold text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-500">
                    {r.phone} · {r.email}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                    <Users
                      size={14}
                      className="text-amber-700"
                      aria-hidden="true"
                    />
                    {r.guests}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <Clock
                      size={14}
                      className="text-amber-700"
                      aria-hidden="true"
                    />
                    {formatWhen(r.reservationDate)}
                  </span>
                  <span className="mt-1 inline-block">
                    <DayTag date={r.reservationDate} />
                  </span>
                </td>
                <td className="max-w-[16rem] px-3 py-3 text-xs text-slate-600">
                  {r.specialRequests ? (
                    <p className="line-clamp-2">{r.specialRequests}</p>
                  ) : (
                    <span className="text-slate-300 italic">None</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <RowActions
                      reservation={r}
                      busy={busyId === r.id}
                      onView={onView}
                      onStatus={onStatus}
                      onDelete={onDelete}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: cards */}
      <div className="space-y-3 md:hidden">
        {reservations.map((r) => (
          <article
            key={r.id}
            className={`space-y-3 rounded-xl border p-3.5 ${
              r.status === "PENDING"
                ? "border-amber-300 bg-amber-50/40"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {r.name}
                </p>
                <p className="truncate text-xs text-slate-500">{r.phone}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-800">
              <span className="inline-flex items-center gap-1.5">
                <Clock
                  size={14}
                  className="text-amber-700"
                  aria-hidden="true"
                />
                {formatWhen(r.reservationDate)}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Users
                  size={14}
                  className="text-amber-700"
                  aria-hidden="true"
                />
                {r.guests}
              </span>
              <DayTag date={r.reservationDate} />
            </div>

            {r.specialRequests && (
              <p className="line-clamp-2 text-xs text-slate-600">
                {r.specialRequests}
              </p>
            )}

            <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
              <RowActions
                reservation={r}
                busy={busyId === r.id}
                onView={onView}
                onStatus={onStatus}
                onDelete={onDelete}
                withLabels
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
