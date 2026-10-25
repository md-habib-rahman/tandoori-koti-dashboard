"use client";

import {
  CalendarClock,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
  User,
  Users,
} from "lucide-react";
import AdminModal from "./AdminModal";
import {
  ACTION_META,
  NEXT_STATUSES,
  StatusBadge,
  dayTag,
  formatFull,
  formatReceived,
} from "./reservationStatus";


function Detail({ Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {label}
        </p>
        <div className="mt-0.5 text-sm text-slate-900">{children}</div>
      </div>
    </div>
  );
}

export default function ReservationDetailsModal({
  reservation,
  onClose,
  onStatus,
  onDelete,
  busy,
}) {
  const r = reservation;
  const nextStatuses = r ? NEXT_STATUSES[r.status] || [] : [];
  const tag = r ? dayTag(r.reservationDate) : "";

  return (
    <AdminModal
      open={Boolean(r)}
      onClose={onClose}
      title="Reservation request"
      subtitle={
        r
          ? `${r.name} · ${r.guests} ${r.guests === 1 ? "guest" : "guests"}`
          : ""
      }
      footer={
        r && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onDelete(r)}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={15} aria-hidden="true" />
              Delete
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {nextStatuses.map((status) => {
                const meta = ACTION_META[status];
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatus(r, status)}
                    disabled={busy}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${meta.solid}`}
                  >
                    {busy ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <meta.Icon size={15} aria-hidden="true" />
                    )}
                    {meta.label}
                  </button>
                );
              })}
              {nextStatuses.length === 0 && (
                <span className="text-sm text-slate-500">
                  No further actions for this status.
                </span>
              )}
            </div>
          </div>
        )
      }
    >
      {r && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={r.status} />
            {tag && (
              <span className="rounded-md border border-violet-300 bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800">
                {tag}
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Detail Icon={User} label="Guest">
              <span className="font-semibold">{r.name}</span>
            </Detail>

            <Detail Icon={Users} label="Party size">
              {r.guests} {r.guests === 1 ? "guest" : "guests"}
            </Detail>

            <Detail Icon={Phone} label="Phone">
              <a
                href={`tel:${String(r.phone).replace(/\s+/g, "")}`}
                className="font-semibold text-amber-700 hover:underline"
              >
                {r.phone}
              </a>
            </Detail>

            <Detail Icon={Mail} label="Email">
              <a
                href={`mailto:${r.email}`}
                className="font-semibold break-all text-amber-700 hover:underline"
              >
                {r.email}
              </a>
            </Detail>

            <div className="sm:col-span-2">
              <Detail Icon={CalendarClock} label="Date and time">
                <span className="font-semibold">
                  {formatFull(r.reservationDate)}
                </span>
              </Detail>
            </div>
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <MessageSquare size={14} aria-hidden="true" />
              Special requests
            </p>
            {r.specialRequests ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm whitespace-pre-line text-amber-950">
                {r.specialRequests}
              </p>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400 italic">
                None
              </p>
            )}
          </div>

          {r.createdAt && (
            <p className="flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <Inbox size={14} aria-hidden="true" />
              Request received {formatReceived(r.createdAt)}
            </p>
          )}
        </div>
      )}
    </AdminModal>
  );
}
