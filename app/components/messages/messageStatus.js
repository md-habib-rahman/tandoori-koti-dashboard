// Save as: src/components/admin/messages/messageStatus.js
import { Eye, EyeOff, Reply } from "lucide-react";

export const FILTERS = ["ALL", "UNREAD", "READ", "REPLIED"];

export const STATUS_STYLES = {
  UNREAD: {
    label: "Unread",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
  },
  READ: {
    label: "Read",
    badge: "bg-slate-100 text-slate-700 border-slate-300",
  },
  REPLIED: {
    label: "Replied",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
};

// Statuses a message can be moved to from its current one
export const NEXT_STATUSES = {
  UNREAD: ["READ", "REPLIED"],
  READ: ["REPLIED", "UNREAD"],
  REPLIED: ["READ", "UNREAD"],
};

export const ACTION_META = {
  READ: {
    label: "Mark read",
    Icon: Eye,
    solid: "bg-slate-700 text-white hover:bg-slate-800",
  },
  UNREAD: {
    label: "Mark unread",
    Icon: EyeOff,
    solid: "bg-amber-600 text-white hover:bg-amber-700",
  },
  REPLIED: {
    label: "Mark replied",
    Icon: Reply,
    solid: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
};

// The API may answer with "UNREAD" or "unread": treat both the same
export const normalizeStatus = (status) => String(status || "").toUpperCase();

// Messages can have an `id` or a Mongo-style `_id`
export const getMessageId = (message) => message.id || message._id;

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[normalizeStatus(status)] || STATUS_STYLES.READ;
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold ${style.badge}`}
    >
      {style.label}
    </span>
  );
}

// Dates in Finnish time
const TZ = "Europe/Helsinki";

// "17 Oct, 09:12"
export const formatShort = (date) =>
  new Date(date).toLocaleString("en-GB", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

// "Saturday 17 October 2026, 09:12"
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
