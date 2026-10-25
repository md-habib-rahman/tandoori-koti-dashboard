"use client";

import { Eye, Mail, Phone, Trash2 } from "lucide-react";
import { StatusBadge, formatShort, getMessageId, normalizeStatus } from "./messageStatus";

// Save as: src/components/admin/messages/MessagesTable.js
// A table on wide screens and stacked cards on phones. Unread messages are highlighted.

function RowActions({ message, busy, onView, onDelete, withLabels = false }) {
  const base = withLabels
    ? "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors"
    : "grid h-8 w-8 place-items-center rounded-lg border transition-colors";

  return (
    <>
      <button
        type="button"
        onClick={() => onView(message)}
        title="View message"
        aria-label={`View message from ${message.name}`}
        className={`${base} border-slate-300 text-slate-700 hover:bg-slate-100`}
      >
        <Eye size={15} aria-hidden="true" />
        {withLabels && "View"}
      </button>
      <button
        type="button"
        onClick={() => onDelete(message)}
        disabled={busy}
        title="Delete"
        aria-label={`Delete message from ${message.name}`}
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
        <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
          <div className="h-10 flex-1 rounded-lg bg-slate-100" />
          <div className="h-10 w-24 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

const UnreadDot = () => (
  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-label="Unread" role="img" />
);

export default function MessagesTable({ messages, loading, busyId, onView, onDelete }) {
  if (loading && messages.length === 0) return <Skeleton />;

  if (messages.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400">
        No messages found.
      </p>
    );
  }

  return (
    <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
      {/* Wide screens: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <th className="px-3 py-3">Sender</th>
              <th className="px-3 py-3">Contact</th>
              <th className="px-3 py-3">Message</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Received</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {messages.map((msg) => {
              const id = getMessageId(msg);
              const unread = normalizeStatus(msg.status) === "UNREAD";
              return (
                <tr
                  key={id}
                  className={`transition-colors hover:bg-slate-50/70 ${unread ? "bg-amber-50/40" : ""}`}
                >
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2">
                      {unread && <UnreadDot />}
                      <span className={unread ? "font-bold text-slate-900" : "font-medium text-slate-800"}>
                        {msg.name}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Mail size={12} className="shrink-0 text-amber-700" aria-hidden="true" />
                      {msg.email}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5">
                      <Phone size={12} className="shrink-0 text-amber-700" aria-hidden="true" />
                      {msg.phone}
                    </p>
                  </td>
                  <td className="max-w-xs px-3 py-3 text-xs text-slate-600">
                    {msg.message ? (
                      <p className={`line-clamp-2 ${unread ? "font-medium text-slate-800" : ""}`}>{msg.message}</p>
                    ) : (
                      <span className="text-slate-300 italic">No message text</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={msg.status} />
                  </td>
                  <td className="px-3 py-3 text-xs whitespace-nowrap text-slate-600">{formatShort(msg.createdAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <RowActions message={msg} busy={busyId === id} onView={onView} onDelete={onDelete} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phones: cards */}
      <div className="space-y-3 md:hidden">
        {messages.map((msg) => {
          const id = getMessageId(msg);
          const unread = normalizeStatus(msg.status) === "UNREAD";
          return (
            <article
              key={id}
              className={`space-y-3 rounded-xl border p-3.5 ${
                unread ? "border-amber-300 bg-amber-50/40" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  {unread && <UnreadDot />}
                  <span className={`truncate text-sm ${unread ? "font-bold text-slate-900" : "font-medium text-slate-800"}`}>
                    {msg.name}
                  </span>
                </span>
                <StatusBadge status={msg.status} />
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <p className="flex items-center gap-1.5 truncate">
                  <Mail size={12} className="shrink-0 text-amber-700" aria-hidden="true" />
                  <span className="truncate">{msg.email}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone size={12} className="shrink-0 text-amber-700" aria-hidden="true" />
                  {msg.phone}
                </p>
              </div>

              <p className="line-clamp-2 text-xs text-slate-600">
                {msg.message || <span className="text-slate-300 italic">No message text</span>}
              </p>

              <p className="text-[11px] text-slate-500">{formatShort(msg.createdAt)}</p>

              <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                <RowActions message={msg} busy={busyId === id} onView={onView} onDelete={onDelete} withLabels />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}