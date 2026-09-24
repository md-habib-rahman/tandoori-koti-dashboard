"use client";

import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hook/useApi";
import {
  Search,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Clock,
} from "lucide-react";

export default function AdminReservationsPage() {
  const { request } = useApi();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    pages: 1,
    total: 0,
    pendingCount: 0,
  });

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await request({
        url: "/reservations/admin",
        method: "GET",
        params: {
          status: statusFilter === "ALL" ? undefined : statusFilter,
          search: search.trim() || undefined,
          page,
          limit: 10,
        },
      });

      if (res?.success) {
        setReservations(res.data || []);
        setPagination(
          res.pagination || { pages: 1, total: 0, pendingCount: 0 },
        );
      }
    } catch (err) {
      console.error("Failed to load reservations:", err);
    } finally {
      setLoading(false);
    }
  }, [request, statusFilter, search, page]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const updateStatus = async (id, status) => {
    try {
      await request({
        url: `/reservations/admin/${id}`,
        method: "PATCH",
        data: { status },
      });

      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
      fetchReservations();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const deleteReservation = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this reservation?",
      )
    )
      return;
    try {
      await request({
        url: `/reservations/admin/${id}`,
        method: "DELETE",
      });
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-brand-cream">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-gold/15 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-gold">
            Table Reservations
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Review guest booking requests and manage table allocations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-semibold">
            {pagination.pendingCount} Pending
          </span>
          <button
            onClick={fetchReservations}
            disabled={loading}
            className="p-2 border border-brand-gold/30 rounded-xl hover:bg-brand-card text-brand-gold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-card/80 border border-brand-gold/20 rounded-xl pl-10 pr-4 py-2 text-xs text-brand-cream focus:outline-none focus:border-brand-gold"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-sans font-semibold tracking-wider transition-all ${
                  statusFilter === st
                    ? "bg-brand-gold text-brand-darker"
                    : "bg-brand-card/60 text-brand-muted border border-brand-gold/15 hover:text-brand-cream"
                }`}
              >
                {st}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="border border-brand-gold/15 rounded-2xl bg-brand-card/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-brand-darker/60 border-b border-brand-gold/15 uppercase text-[10px] tracking-wider text-brand-muted">
              <tr>
                <th className="p-4">Guest</th>
                <th className="p-4">Party</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Special Requests</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/10">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-brand-gold/5">
                  <td className="p-4">
                    <p className="font-semibold text-brand-cream">{r.name}</p>
                    <p className="text-[11px] text-brand-muted">
                      {r.phone} • {r.email}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-brand-gold">
                      <Users className="w-3.5 h-3.5" /> {r.guests}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-brand-cream">
                      <Clock className="w-3.5 h-3.5 text-brand-gold" />
                      {new Date(r.reservationDate).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="p-4 text-brand-muted max-w-xs truncate">
                    {r.specialRequests || (
                      <span className="opacity-40 italic">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        r.status === "CONFIRMED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : r.status === "CANCELLED"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {r.status !== "CONFIRMED" && (
                      <button
                        onClick={() => updateStatus(r.id, "CONFIRMED")}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300"
                        title="Confirm Booking"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {r.status !== "CANCELLED" && (
                      <button
                        onClick={() => updateStatus(r.id, "CANCELLED")}
                        className="p-1.5 text-amber-400 hover:text-amber-300"
                        title="Cancel Booking"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteReservation(r.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
