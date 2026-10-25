"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useApi } from "@/hook/useApi";


const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

const toText = (value) =>
  value === null || value === undefined ? "" : String(value);


function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-600 uppercase"
      >
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-semibold text-rose-700">{error}</p>
      )}
    </div>
  );
}

export default function ReviewSettingsCard() {
  const { request } = useApi();

  const [form, setForm] = useState({
    googleRating: "",
    googleReviewCount: "",
    googleReviewsUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await request({
          method: "GET",
          url: "/reviews/admin/settings",
        });
        if (cancelled) return;
        setForm({
          googleRating: toText(res?.data?.googleRating),
          googleReviewCount: toText(res?.data?.googleReviewCount),
          googleReviewsUrl: toText(res?.data?.googleReviewsUrl),
        });
      } catch (err) {
        if (!cancelled) setMessage("Could not load the rating settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key) => (e) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setSaved(false);

    try {
      setSaving(true);
      await request({
        method: "PUT",
        url: "/reviews/admin/settings",
        data: form,
      });
      setSaved(true);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      setMessage(data?.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5"
    >
      <div>
        <h2 className="font-bold text-slate-900">
          Rating shown above the reviews
        </h2>
        <p className="text-xs text-slate-500">
          Copy these from the restaurant&apos;s Google profile. Update them now
          and then, since Google&apos;s numbers change.
        </p>
      </div>

      {message && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-800"
        >
          {message}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-[8rem_10rem_1fr]">
        <Field
          id="google-rating"
          label="Rating"
          error={errors.googleRating}
          hint="For example 4.6"
        >
          <input
            id="google-rating"
            type="text"
            inputMode="decimal"
            disabled={loading}
            value={form.googleRating}
            onChange={setField("googleRating")}
            className={inputClass}
          />
        </Field>
        <Field
          id="google-count"
          label="Number of reviews"
          error={errors.googleReviewCount}
          hint="For example 128"
        >
          <input
            id="google-count"
            type="text"
            inputMode="numeric"
            disabled={loading}
            value={form.googleReviewCount}
            onChange={setField("googleReviewCount")}
            className={inputClass}
          />
        </Field>
        <Field
          id="google-url"
          label="Link to all reviews"
          error={errors.googleReviewsUrl}
          hint="The Google reviews page. Leave empty to hide the button."
        >
          <input
            id="google-url"
            type="url"
            placeholder="https://g.page/..."
            disabled={loading}
            value={form.googleReviewsUrl}
            onChange={setField("googleReviewsUrl")}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          )}
          Save
        </button>
        {saved && (
          <span
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700"
            role="status"
          >
            <CheckCircle2 size={15} aria-hidden="true" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
