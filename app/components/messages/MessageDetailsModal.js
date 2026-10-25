"use client";

import {
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Trash2,
  User,
} from "lucide-react";

import {
  ACTION_META,
  NEXT_STATUSES,
  StatusBadge,
  formatFull,
  normalizeStatus,
} from "./messageStatus";
import AdminModal from "../reservations/AdminModal";

// Save as: src/components/admin/messages/MessageDetailsModal.js
//
//   message: the message to show, or null to keep the modal closed
//   onStatus(message, status), onDelete(message): the same handlers the table uses
//   busy: true while one of those is running

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

export default function MessageDetailsModal({
  message,
  onClose,
  onStatus,
  onDelete,
  busy,
}) {
  const m = message;
  const nextStatuses = m ? NEXT_STATUSES[normalizeStatus(m.status)] || [] : [];

  return (
    <AdminModal
      open={Boolean(m)}
      onClose={onClose}
      title="Message"
      subtitle={m ? `From ${m.name}` : ""}
      size="max-w-xl"
      footer={
        m && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {nextStatuses.map((status) => {
                const meta = ACTION_META[status];
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatus(m, status)}
                    disabled={busy}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${meta.solid}`}
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
              <button
                type="button"
                onClick={() => onDelete(m)}
                disabled={busy}
                className="ml-auto inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={15} aria-hidden="true" />
                Delete
              </button>
            </div>

            <a
              href={`mailto:${m.email}?subject=${encodeURIComponent("Regarding your inquiry at Tandoori Koti")}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-700"
            >
              <Send size={15} aria-hidden="true" />
              Reply via email
            </a>
          </div>
        )
      }
    >
      {m && (
        <div className="space-y-5">
          <StatusBadge status={m.status} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Detail Icon={User} label="Sender">
              <span className="font-semibold break-words">{m.name}</span>
            </Detail>

            <Detail Icon={Phone} label="Phone">
              <a
                href={`tel:${String(m.phone).replace(/\s+/g, "")}`}
                className="font-semibold text-amber-700 hover:underline"
              >
                {m.phone}
              </a>
            </Detail>

            <div className="sm:col-span-2">
              <Detail Icon={Mail} label="Email">
                <a
                  href={`mailto:${m.email}`}
                  className="font-semibold break-all text-amber-700 hover:underline"
                >
                  {m.email}
                </a>
              </Detail>
            </div>
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <MessageSquare size={14} aria-hidden="true" />
              Message
            </p>
            {m.message ? (
              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed break-words whitespace-pre-wrap text-slate-900">
                {m.message}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400 italic">
                No text was sent with this contact request.
              </p>
            )}
          </div>

          {m.createdAt && (
            <p className="flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <Inbox size={14} aria-hidden="true" />
              Received {formatFull(m.createdAt)}
            </p>
          )}
        </div>
      )}
    </AdminModal>
  );
}
