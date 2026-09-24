"use client";

import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hook/useApi";
import {
  Search,
  Mail,
  Phone,
  Trash2,
  CheckCircle,
  Eye,
  RefreshCw,
  X,
  MailOpen,
  MessageSquare,
} from "lucide-react";

export default function AdminMessagesPage() {
  const { request } = useApi();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    pages: 1,
    total: 0,
    unreadCount: 0,
  });
  const [selectedMessage, setSelectedMessage] = useState(null);

  // 1. Fetch Contact Messages using useApi hook
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await request({
        url: "/contact/admin",
        method: "GET",
        params: {
          status:
            statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
          search: search.trim() || undefined,
          page,
          limit: 10,
        },
      });

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
      console.error("Failed to load contact messages:", err);
    } finally {
      setLoading(false);
    }
  }, [request, statusFilter, search, page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 2. Update Status (UNREAD / READ / REPLIED / ARCHIVED)
  const updateStatus = async (id, rawStatus) => {
    const newStatus = rawStatus.toUpperCase();
    try {
      await request({
        url: `/contact/admin/${id}/status`,
        method: "PATCH",
        data: { status: newStatus },
      });

      // Update state locally
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id || msg._id === id ? { ...msg, status: newStatus } : msg,
        ),
      );

      // Keep active modal in sync
      setSelectedMessage((prev) => {
        if (!prev) return null;
        if (prev.id === id || prev._id === id) {
          return { ...prev, status: newStatus };
        }
        return prev;
      });

      // Update unread count indicator
      setPagination((prev) => {
        const wasUnread = messages.find(
          (m) => (m.id === id || m._id === id) && m.status === "UNREAD",
        );
        if (wasUnread && newStatus !== "UNREAD") {
          return { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) };
        }
        if (!wasUnread && newStatus === "UNREAD") {
          return { ...prev, unreadCount: prev.unreadCount + 1 };
        }
        return prev;
      });
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // 3. Delete Message
  const deleteMessage = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this message?",
      )
    ) {
      return;
    }
    try {
      await request({
        url: `/contact/admin/${id}`,
        method: "DELETE",
      });

      // Remove from list
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== id && msg._id !== id),
      );

      if (
        selectedMessage &&
        (selectedMessage.id === id || selectedMessage._id === id)
      ) {
        setSelectedMessage(null);
      }

      fetchMessages();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // 4. Open Message Modal & auto-mark as read
  const openMessageModal = (msg) => {
    setSelectedMessage(msg);
    const msgId = msg.id || msg._id;
    if (msg.status === "UNREAD" || msg.status === "unread") {
      updateStatus(msgId, "READ");
    }
  };

  const getMessageId = (msg) => msg.id || msg._id;

  return (
    <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto text-brand-cream">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-gold/15 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-gold">
            Inquiries & Messages
          </h1>
          <p className="text-xs text-brand-muted mt-1 font-sans">
            Review and manage client contact submissions and table booking
            requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-semibold">
            {pagination.unreadCount} Unread
          </span>
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="p-2 border border-brand-gold/30 rounded-xl hover:bg-brand-card transition-colors text-brand-gold disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold" />
          <input
            type="text"
            placeholder="Search by name, email, or content..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-brand-card/80 border border-brand-gold/20 rounded-xl pl-10 pr-4 py-2 text-xs text-brand-cream focus:outline-none focus:border-brand-gold placeholder:text-brand-muted/60"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "unread", "read", "replied"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs uppercase font-sans tracking-wider font-semibold transition-all ${
                statusFilter === tab
                  ? "bg-brand-gold text-brand-darker shadow-sm"
                  : "bg-brand-card/60 text-brand-muted border border-brand-gold/15 hover:text-brand-cream"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Table */}
      <div className="border border-brand-gold/15 rounded-2xl bg-brand-card/50 overflow-hidden backdrop-blur-sm">
        {loading && messages.length === 0 ? (
          <div className="p-16 text-center text-xs text-brand-muted">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="p-16 text-center text-xs text-brand-muted">
            No messages found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-brand-darker/60 border-b border-brand-gold/15 uppercase text-[10px] tracking-wider text-brand-muted">
                <tr>
                  <th className="p-4">Sender</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Snippet</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/10">
                {messages.map((msg) => {
                  const id = getMessageId(msg);
                  const isUnread =
                    msg.status === "UNREAD" || msg.status === "unread";
                  const isReplied =
                    msg.status === "REPLIED" || msg.status === "replied";

                  return (
                    <tr
                      key={id}
                      className={`hover:bg-brand-gold/5 transition-colors ${
                        isUnread ? "bg-brand-gold/10 font-semibold" : ""
                      }`}
                    >
                      <td className="p-4 text-brand-cream">
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0" />
                          )}
                          <span>{msg.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-brand-muted space-y-0.5">
                        <p className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="w-3 h-3 text-brand-gold shrink-0" />{" "}
                          {msg.email}
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3 h-3 text-brand-gold shrink-0" />{" "}
                          {msg.phone}
                        </p>
                      </td>
                      <td className="p-4 text-brand-muted max-w-xs truncate">
                        {msg.message || (
                          <span className="italic opacity-60">
                            No message text
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            isUnread
                              ? "bg-amber-500/20 text-amber-500 border border-amber-500/40"
                              : isReplied
                                ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
                                : "bg-slate-500/20 text-slate-500 border border-slate-500/30"
                          }`}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td className="p-4 text-brand-muted text-[11px]">
                        {new Date(msg.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openMessageModal(msg)}
                          className="p-1.5 hover:text-brand-gold transition-colors text-brand-muted"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMessage(id)}
                          className="p-1.5 hover:text-rose-400 transition-colors text-brand-muted"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Modal Preview */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-[100] backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-brand-darker border rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-6 right-6 text-brand-muted hover:text-brand-cream transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-bold">
                  Message Details
                </span>
                <span
                  className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                    selectedMessage.status?.toUpperCase() === "UNREAD"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : selectedMessage.status?.toUpperCase() === "REPLIED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                  }`}
                >
                  {selectedMessage.status}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-brand-cream">
                {selectedMessage.name}
              </h2>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-brand-card/70 border border-brand-gold/15 text-xs text-brand-muted">
              <div>
                <span className="block text-brand-cream font-medium">
                  Email
                </span>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="hover:text-brand-gold underline truncate block"
                >
                  {selectedMessage.email}
                </a>
              </div>
              <div>
                <span className="block text-brand-cream font-medium">
                  Phone
                </span>
                <a
                  href={`tel:${selectedMessage.phone}`}
                  className="hover:text-brand-gold underline block"
                >
                  {selectedMessage.phone}
                </a>
              </div>
            </div>

            {/* Content body */}
            <div className="space-y-2">
              <span className="text-xs text-brand-gold uppercase tracking-wider font-semibold">
                Message Content
              </span>
              <div className="p-4 rounded-xl bg-brand-card/90 border border-brand-gold/15 text-sm text-brand-cream leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedMessage.message || (
                  <span className="text-brand-muted italic">
                    No text provided with this contact request.
                  </span>
                )}
              </div>
            </div>

            {/* Action Bar (Mark Read, Unread, Replied, Delete, Email) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brand-gold/15 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {selectedMessage.status?.toUpperCase() !== "REPLIED" && (
                  <button
                    onClick={() =>
                      updateStatus(getMessageId(selectedMessage), "REPLIED")
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 hover:bg-emerald-500/30 font-semibold transition-colors"
                  >
                    Mark Replied
                  </button>
                )}

                {selectedMessage.status?.toUpperCase() === "READ" ? (
                  <button
                    onClick={() =>
                      updateStatus(getMessageId(selectedMessage), "UNREAD")
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40 hover:bg-amber-500/30 font-semibold transition-colors"
                  >
                    Mark Unread
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      updateStatus(getMessageId(selectedMessage), "READ")
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-slate-500/20 text-slate-500 border border-slate-500/30 hover:bg-slate-500/40 font-semibold transition-colors"
                  >
                    Mark Read
                  </button>
                )}

                <button
                  onClick={() => deleteMessage(getMessageId(selectedMessage))}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-500 border border-rose-500/30 hover:bg-rose-500/30 font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>

              <a
                href={`mailto:${selectedMessage.email}?subject=Regarding your inquiry at Tandoori Koti`}
                className="w-full sm:w-auto text-center px-5 py-2 rounded-xl bg-brand-gold text-brand-darker hover:bg-brand-goldLight font-bold uppercase tracking-wider text-[11px] transition-colors"
              >
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
