"use client";

import { Eye, EyeOff, PenLine, Star, Trash2 } from "lucide-react";

// Save as: src/components/admin/reviews/ReviewsTable.js
// A table on wide screens and stacked cards on phones.

const SOURCE_LABELS = {
  GOOGLE: "Google",
  FACEBOOK: "Facebook",
  OTHER: "Other",
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    timeZone: "Europe/Helsinki",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function Stars({ count }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${count} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={
            n <= count ? "fill-amber-500 text-amber-500" : "text-slate-300"
          }
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function StatusBadges({ review }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${
          review.isPublished
            ? "border-emerald-300 bg-emerald-100 text-emerald-800"
            : "border-slate-300 bg-slate-100 text-slate-600"
        }`}
      >
        {review.isPublished ? "Published" : "Hidden"}
      </span>
      {review.onHomepage && (
        <span className="rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
          On home page
        </span>
      )}
    </div>
  );
}

function RowActions({
  review,
  busy,
  onEdit,
  onTogglePublished,
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
        onClick={() => onEdit(review)}
        title="Edit"
        aria-label={`Edit review from ${review.authorName}`}
        className={`${base} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}
      >
        <PenLine size={15} aria-hidden="true" />
        {withLabels && "Edit"}
      </button>
      <button
        type="button"
        onClick={() => onTogglePublished(review)}
        disabled={busy}
        title={
          review.isPublished ? "Hide from the website" : "Show on the website"
        }
        aria-label={`${review.isPublished ? "Hide" : "Publish"} review from ${review.authorName}`}
        className={`${base} border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50`}
      >
        {review.isPublished ? (
          <EyeOff size={15} aria-hidden="true" />
        ) : (
          <Eye size={15} aria-hidden="true" />
        )}
        {withLabels && (review.isPublished ? "Hide" : "Publish")}
      </button>
      <button
        type="button"
        onClick={() => onDelete(review)}
        disabled={busy}
        title="Delete"
        aria-label={`Delete review from ${review.authorName}`}
        className={`${base} border-rose-200 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50`}
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

export default function ReviewsTable({
  reviews,
  loading,
  busyId,
  onEdit,
  onTogglePublished,
  onDelete,
}) {
  if (loading && reviews.length === 0) return <Skeleton />;

  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400">
        No reviews found.
      </p>
    );
  }

  const actionProps = { onEdit, onTogglePublished, onDelete };

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
              <th className="px-3 py-3">Review</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {reviews.map((r) => (
              <tr
                key={r.id}
                className={`transition-colors hover:bg-slate-50/70 ${r.onHomepage ? "bg-amber-50/40" : ""}`}
              >
                <td className="px-3 py-3">
                  <p className="font-semibold text-slate-900">{r.authorName}</p>
                  <Stars count={r.rating} />
                </td>
                <td className="max-w-sm px-3 py-3 text-xs text-slate-600">
                  <p className="line-clamp-2">{r.text}</p>
                </td>
                <td className="px-3 py-3 text-xs text-slate-600">
                  {SOURCE_LABELS[r.source] || r.source}
                </td>
                <td className="px-3 py-3 text-xs whitespace-nowrap text-slate-600">
                  {formatDate(r.reviewedAt)}
                </td>
                <td className="px-3 py-3">
                  <StatusBadges review={r} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <RowActions
                      review={r}
                      busy={busyId === r.id}
                      {...actionProps}
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
        {reviews.map((r) => (
          <article
            key={r.id}
            className={`space-y-3 rounded-xl border p-3.5 ${r.onHomepage ? "border-amber-300 bg-amber-50/40" : "border-slate-200 bg-white"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {r.authorName}
                </p>
                <Stars count={r.rating} />
              </div>
              <span className="shrink-0 text-xs text-slate-500">
                {formatDate(r.reviewedAt)}
              </span>
            </div>
            <p className="line-clamp-3 text-xs text-slate-600">{r.text}</p>
            <div className="flex items-center justify-between gap-2">
              <StatusBadges review={r} />
              <span className="text-xs text-slate-500">
                {SOURCE_LABELS[r.source] || r.source}
              </span>
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
              <RowActions
                review={r}
                busy={busyId === r.id}
                withLabels
                {...actionProps}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
