"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApi } from "@/hook/useApi";
import { alert } from "@/lib/alert";
import {
  Plus,
  RefreshCw,
  Search,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import ReviewSettingsCard from "./ReviewSettingsCard";
import ReviewsTable from "./ReviewsTable";
import ReviewFormModal from "./ReviewFormModal";

// Save as: src/components/admin/reviews/AdminReviewsPage.js
// Mount it on an admin page, for example src/app/admin/dashboard/reviews/page.js:  <AdminReviewsPage />

const PAGE_SIZE = 10;
const FILTERS = [
  { id: "ALL", label: "All", value: undefined },
  { id: "PUBLISHED", label: "Published", value: "true" },
  { id: "HIDDEN", label: "Hidden", value: "false" },
];

export default function AdminReviewsPage() {
  const { request } = useApi();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    pages: 1,
    total: 0,
    homepageCount: 6,
  });
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null); // { review } where review is null for a new one

  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    try {
      setLoading(true);
      setError("");
      const res = await request({
        method: "GET",
        url: "/reviews/admin",
        params: {
          published: FILTERS.find((f) => f.id === filter)?.value,
          search: search.trim() || undefined,
          page,
          limit: PAGE_SIZE,
        },
      });
      if (requestId !== latestRequest.current) return;

      if (res?.success) {
        setReviews(res.data || []);
        setPagination(
          res.pagination || { pages: 1, total: 0, homepageCount: 6 },
        );
      }
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      console.error("Failed to load reviews:", err);
      setError("Could not load reviews. Please try again.");
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [request, filter, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Wait for a short pause in typing before searching, and start again from page 1
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const togglePublished = async (review) => {
    try {
      setBusyId(review.id);
      setError("");
      await request({
        method: "PATCH",
        url: `/reviews/admin/${review.id}/published`,
        data: { isPublished: !review.isPublished },
      });
      await load(); // reloading also refreshes which reviews are "On home page"
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the review.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (review) => {
    const result = await alert.confirm({
      title: "Delete this review?",
      text: `The review from ${review.authorName} will be permanently deleted. To keep it but hide it, use Hide instead.`,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
    });
    if (!result.isConfirmed) return;

    try {
      setBusyId(review.id);
      setError("");
      await request({ method: "DELETE", url: `/reviews/admin/${review.id}` });
      alert.success("Review deleted.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the review.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-3 py-4 sm:px-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Guest Reviews
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            The home page shows the {pagination.homepageCount} newest published
            reviews, one in focus at a time. They change by review date.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            aria-label="Refresh"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
              aria-hidden="true"
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setEditing({ review: null })}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700"
          >
            <Plus size={16} aria-hidden="true" />
            Add review
          </button>
        </div>
      </div>

      <ReviewSettingsCard />

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

      {/* List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-80">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="review-search" className="sr-only">
              Search reviews
            </label>
            <input
              id="review-search"
              type="text"
              placeholder="Search by name or review text..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div
            className="flex gap-1.5"
            role="group"
            aria-label="Filter by status"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilter(f.id);
                  setPage(1);
                }}
                aria-pressed={filter === f.id}
                className={`rounded-xl border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  filter === f.id
                    ? "border-amber-600 bg-amber-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {pagination.total} {pagination.total === 1 ? "review" : "reviews"}
        </p>

        <div className="mt-3">
          <ReviewsTable
            reviews={reviews}
            loading={loading}
            busyId={busyId}
            onEdit={(review) => setEditing({ review })}
            onTogglePublished={togglePublished}
            onDelete={remove}
          />
        </div>

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
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <ReviewFormModal
          key={editing.review?.id || "new"}
          review={editing.review}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            alert.success("Review saved.");
            load();
          }}
        />
      )}
    </div>
  );
}
