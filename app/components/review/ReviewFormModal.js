"use client";

import { useState } from "react";
import {
  CalendarClock,
  Check,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  MessageSquare,
  Star,
  User,
} from "lucide-react";
import { useApi } from "@/hook/useApi";
import AdminModal from "../reservations/AdminModal";

// 16px on phones (stops iOS zooming in on focus), 14px from the sm breakpoint up
const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder-slate-400 [color-scheme:light] transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 sm:text-sm";

const SOURCES = [
  { value: "GOOGLE", label: "Google" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "OTHER", label: "Other (no label shown)" },
];

// The date input wants "YYYY-MM-DD"
const toDateInput = (value) =>
  value
    ? new Date(value).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

// Same look as the reservation details rows: icon tile on the left, small label, then the content
function Field({ Icon, label, htmlFor, error, hint, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold tracking-wide text-slate-600 uppercase"
        >
          {label}
        </label>
        <div className="mt-1.5">{children}</div>
        {hint && !error && (
          <p className="mt-1.5 text-xs text-slate-600">{hint}</p>
        )}
        {error && (
          <p
            role="alert"
            className="mt-1.5 text-xs font-semibold text-rose-700"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ReviewFormModal({ review, onClose, onSaved }) {
  const { request } = useApi();

  const [form, setForm] = useState({
    authorName: review?.authorName || "",
    rating: review?.rating || 5,
    text: review?.text || "",
    source: review?.source || "GOOGLE",
    reviewedAt: toDateInput(review?.reviewedAt),
    isPublished: review ? Boolean(review.isPublished) : true,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    try {
      setSaving(true);
      const payload = { ...form, rating: Number(form.rating) };
      const res = review
        ? await request({
            method: "PUT",
            url: `/reviews/admin/${review.id}`,
            data: payload,
          })
        : await request({
            method: "POST",
            url: "/reviews/admin",
            data: payload,
          });
      onSaved(res?.data);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      setMessage(
        data?.message || "Could not save the review. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const sourceLabel = SOURCES.find((s) => s.value === form.source)?.label;
  const showSourceTag = form.source !== "OTHER" && sourceLabel;

  return (
    <AdminModal
      open
      onClose={onClose}
      title={review ? "Edit review" : "Add review"}
      subtitle={
        form.authorName.trim()
          ? `${form.authorName.trim()} · ${form.rating} / 5`
          : "Copy the review exactly as the guest wrote it"
      }
      size="max-w-xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="review-form"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <Check size={15} aria-hidden="true" />
            )}
            {saving ? "Saving..." : "Save review"}
          </button>
        </div>
      }
    >
      <form
        id="review-form"
        onSubmit={handleSubmit}
        className="space-y-5 text-slate-900"
      >
        {/* Live status, like the badges at the top of the reservation details */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold ${
              form.isPublished
                ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                : "border-slate-300 bg-slate-100 text-slate-700"
            }`}
          >
            {form.isPublished ? (
              <Eye size={12} aria-hidden="true" />
            ) : (
              <EyeOff size={12} aria-hidden="true" />
            )}
            {form.isPublished ? "Published" : "Hidden"}
          </span>
          {showSourceTag && (
            <span className="rounded-md border border-violet-300 bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800">
              {sourceLabel}
            </span>
          )}
        </div>

        {message && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
          >
            {message}
          </p>
        )}

        <Field
          Icon={User}
          label="Guest"
          htmlFor="review-author"
          error={errors.authorName}
          hint="As shown by the source, for example Matti K."
        >
          <input
            id="review-author"
            type="text"
            required
            maxLength={60}
            value={form.authorName}
            onChange={setField("authorName")}
            className={inputClass}
          />
        </Field>

        <Field Icon={Star} label="Rating" error={errors.rating}>
          <div
            className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2"
            role="radiogroup"
            aria-label="Rating"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={Number(form.rating) === n}
                aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                onClick={() => setForm((prev) => ({ ...prev, rating: n }))}
                className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                <Star
                  size={26}
                  className={
                    n <= Number(form.rating)
                      ? "fill-amber-500 text-amber-500"
                      : "text-slate-300"
                  }
                  aria-hidden="true"
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-semibold text-slate-800">
              {form.rating} / 5
            </span>
          </div>
        </Field>

        <Field
          Icon={MessageSquare}
          label="Review text"
          htmlFor="review-text"
          error={errors.text}
          hint={`${form.text.length} / 500 characters. Long reviews are shortened on the website.`}
        >
          <textarea
            id="review-text"
            required
            rows={6}
            maxLength={500}
            value={form.text}
            onChange={setField("text")}
            className={`${inputClass} resize-y leading-relaxed`}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            Icon={Globe}
            label="Source"
            htmlFor="review-source"
            error={errors.source}
          >
            <select
              id="review-source"
              value={form.source}
              onChange={setField("source")}
              className={inputClass}
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            Icon={CalendarClock}
            label="Review date"
            htmlFor="review-date"
            error={errors.reviewedAt}
            hint="The 6 newest dates are shown on the home page."
          >
            <input
              id="review-date"
              type="date"
              required
              value={form.reviewedAt}
              onChange={setField("reviewedAt")}
              className={inputClass}
            />
          </Field>
        </div>

        {/* Same amber box as "Special requests" in the reservation details */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isPublished: e.target.checked }))
            }
            className="mt-0.5 h-4 w-4 shrink-0 accent-amber-700"
          />
          <span>
            <span className="block text-sm font-semibold text-amber-950">
              Published
            </span>
            <span className="block text-xs text-amber-900/80">
              Untick to keep the review saved but hide it from the website.
            </span>
          </span>
        </label>
      </form>
    </AdminModal>
  );
}
