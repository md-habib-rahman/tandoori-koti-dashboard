"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApi } from "@/hook/useApi";
import { RefreshCw, Search, SkipBack, SkipForward, X } from "lucide-react";
import { alert } from "../../../../lib/alert";

import {
  FILTERS,
  STATUS_STYLES,
  getMessageId,
  normalizeStatus,
} from "../../../components/messages/messageStatus";
import MessageDetailsModal from "../../../components/messages/MessageDetailsModal";
import MessagesTable from "../../../components/messages/MessagesTable";

const PAGE_SIZE = 10;

// Save as: src/app/admin/dashboard/messages/page.js  (the same place as your current page)
export default function AdminMessagesPage() {
  const { request } = useApi();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchInput, setSearchInput] = useState(""); // what is typed
  const [search, setSearch] = useState(""); // what is sent to the server, after a short pause
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    pages: 1,
    total: 0,
    unreadCount: 0,
  });

  const [selected, setSelected] = useState(null); // the message open in the modal
  const [busyId, setBusyId] = useState(null); // the message an action is running for

  // Only the newest request may update the screen (fast typing starts several)
  const latestRequest = useRef(0);
  // True when a status changed while the modal was open, so the list needs reloading afterwards
  const listIsStale = useRef(false);

  // 1. Load the messages
  const fetchMessages = useCallback(async () => {
    const requestId = ++latestRequest.current;
    try {
      setLoading(true);
      setError("");
      const res = await request({
        url: "/contact/admin",
        method: "GET",
        params: {
          status: statusFilter === "ALL" ? undefined : statusFilter,
          search: search.trim() || undefined,
          page,
          limit: PAGE_SIZE,
        },
      });
      if (requestId !== latestRequest.current) return;

      if (res?.success) {
        setMessages(res.data || []);
        setPagination(
          res.pagination || {
            pages: 1,
            total: res.data?.length || 0,
            unreadCount: 0,
          },
        );
      }
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      console.error("Failed to load contact messages:", err);
      setError("Could not load messages. Please try again.");
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [request, statusFilter, search, page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Wait for a short pause in typing before searching, and start again from page 1
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const changeFilter = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  // 2. Change a message's status (UNREAD / READ / REPLIED)
  const updateStatus = async (message, rawStatus) => {
    const id = getMessageId(message);
    const newStatus = normalizeStatus(rawStatus);
    const oldStatus = normalizeStatus(message.status);
    if (newStatus === oldStatus) return;

    try {
      setBusyId(id);
      setError("");
      await request({
        url: `/contact/admin/${id}/status`,
        method: "PATCH",
        data: { status: newStatus },
      });

      const patch = (m) =>
        getMessageId(m) === id ? { ...m, status: newStatus } : m;
      setMessages((prev) => prev.map(patch));
      setSelected((prev) =>
        prev && getMessageId(prev) === id ? patch(prev) : prev,
      );
      listIsStale.current = true;

      // Keep the "N unread" counter right
      setPagination((prev) => {
        if (oldStatus === "UNREAD" && newStatus !== "UNREAD") {
          return { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) };
        }
        if (oldStatus !== "UNREAD" && newStatus === "UNREAD") {
          return { ...prev, unreadCount: prev.unreadCount + 1 };
        }
        return prev;
      });
    } catch (err) {
      console.error("Status update error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not update the message.",
      );
    } finally {
      setBusyId(null);
    }
  };

  // 3. Delete a message
  const deleteMessage = async (message) => {
    const id = getMessageId(message);
    const result = await alert.confirm({
      title: "Are you sure?",
      text: "Are you sure you want to permanently delete this message?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
    });
    if (!result.isConfirmed) return;

    try {
      setBusyId(id);
      setError("");
      await request({ url: `/contact/admin/${id}`, method: "DELETE" });

      setMessages((prev) => prev.filter((m) => getMessageId(m) !== id));
      setSelected((prev) => (prev && getMessageId(prev) === id ? null : prev)); // close the modal
      alert.success("Message deleted successfully!");
      fetchMessages();
    } catch (err) {
      console.error("Delete failed:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not delete the message.",
      );
    } finally {
      setBusyId(null);
    }
  };

  // 4. Open a message. An unread one is marked as read automatically.
  const openMessage = (message) => {
    setSelected(message);
    if (normalizeStatus(message.status) === "UNREAD")
      updateStatus(message, "READ");
  };

  // When the modal closes after a status change, reload so the list matches the active filter
  const closeMessage = () => {
    setSelected(null);
    if (listIsStale.current) {
      listIsStale.current = false;
      fetchMessages();
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-3 py-4 sm:px-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Inquiries &amp; Messages
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Read and answer the messages guests send from the contact form.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pagination.unreadCount > 0 && (
            <span className="rounded-full bg-amber-500 px-3 py-1 text-sm font-bold text-white">
              {pagination.unreadCount} unread
            </span>
          )}
          <button
            type="button"
            onClick={fetchMessages}
            disabled={loading}
            aria-label="Refresh"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-800"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss"
            className="shrink-0 text-rose-600 hover:text-rose-800"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Card with filters, list and paging */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-80">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="message-search" className="sr-only">
              Search messages
            </label>
            <input
              id="message-search"
              type="text"
              placeholder="Search by name, email or content..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div
            className="-mx-1 flex gap-1.5 overflow-x-auto px-1"
            role="group"
            aria-label="Filter by status"
          >
            {FILTERS.map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => changeFilter(status)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-xl border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {status === "ALL" ? "All" : STATUS_STYLES[status].label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {pagination.total} {pagination.total === 1 ? "message" : "messages"}
        </p>

        <div className="mt-3">
          <MessagesTable
            messages={messages}
            loading={loading}
            busyId={busyId}
            onView={openMessage}
            onDelete={deleteMessage}
          />
        </div>

        {/* Paging */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-800">{page}</span> of{" "}
            <span className="font-semibold text-slate-800">
              {pagination.pages || 1}
            </span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              aria-label="Previous page"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SkipBack size={16} />
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((p) => Math.min(pagination.pages || 1, p + 1))
              }
              disabled={page >= (pagination.pages || 1) || loading}
              aria-label="Next page"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Message modal */}
      <MessageDetailsModal
        message={selected}
        onClose={closeMessage}
        onStatus={updateStatus}
        onDelete={deleteMessage}
        busy={selected ? busyId === getMessageId(selected) : false}
      />
    </div>
  );
}
