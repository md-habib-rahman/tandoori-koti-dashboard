// Save as: src/components/admin/reservations/reservationStatus.js
import { CheckCheck, CheckCircle, XCircle } from "lucide-react";

export const FILTERS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

export const STATUS_STYLES = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
  },
  CONFIRMED: {
    label: "Confirmed",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-sky-100 text-sky-800 border-sky-300",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
  },
};

// Which statuses a reservation can be moved to from its current one
export const NEXT_STATUSES = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: ["CONFIRMED"], // lets staff reopen a booking that was cancelled by mistake
};

// How each target status looks on a button. `icon` is for the small icon buttons, `solid` for text buttons.
export const ACTION_META = {
  CONFIRMED: {
    label: "Confirm",
    Icon: CheckCircle,
    icon: "text-emerald-700 hover:bg-emerald-50 border-emerald-200",
    solid: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  COMPLETED: {
    label: "Mark completed",
    Icon: CheckCheck,
    icon: "text-sky-700 hover:bg-sky-50 border-sky-200",
    solid: "bg-sky-600 text-white hover:bg-sky-700",
  },
  CANCELLED: {
    label: "Cancel booking",
    Icon: XCircle,
    icon: "text-amber-700 hover:bg-amber-50 border-amber-200",
    solid: "bg-amber-600 text-white hover:bg-amber-700",
  },
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold ${style.badge}`}
    >
      {style.label}
    </span>
  );
}

// ---- Dates: always shown in Finnish time ----
const TZ = "Europe/Helsinki";

// "Sat 17 Oct, 18:30"
export const formatWhen = (date) =>
  new Date(date).toLocaleString("en-GB", {
    timeZone: TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

// "Saturday 17 October 2026, 18:30"
export const formatFull = (date) =>
  new Date(date).toLocaleString("en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// "17 Oct 2026, 09:12"
export const formatReceived = (date) =>
  new Date(date).toLocaleString("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const dayKey = (date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(date));

// "Today" or "Tomorrow" for bookings that are coming up soon, otherwise ""
export function dayTag(date) {
  const target = dayKey(date);
  const now = new Date();
  if (target === dayKey(now)) return "Today";
  if (target === dayKey(new Date(now.getTime() + 24 * 60 * 60 * 1000)))
    return "Tomorrow";
  return "";
}
