"use client";

import { useRef } from "react";
import { useApi } from "@/hook/useApi.js";

const input =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30";

export function TextField({ label, value, onChange, hint, ...rest }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-800">
        {label}
      </span>
      <input
        className={input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

// One value stored as { fi, en }
export function Bilingual({ label, value, onChange, multiline = false, max }) {
  const set = (lang, v) => onChange({ ...value, [lang]: v });
  const Tag = multiline ? "textarea" : "input";
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-gray-800">
        {label}
      </legend>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["fi", "Finnish"],
          ["en", "English"],
        ].map(([lang, name]) => (
          <label key={lang} className="block">
            <span className="mb-1 block text-xs text-gray-500">
              {name}
              {max ? ` (${value?.[lang]?.length ?? 0}/${max})` : ""}
            </span>
            <Tag
              className={input}
              rows={multiline ? 3 : undefined}
              maxLength={max}
              value={value?.[lang] ?? ""}
              onChange={(e) => set(lang, e.target.value)}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ImageField({ label, hint, kind, value, onChange }) {
  const ref = useRef(null);
  const { request, isLoading: busy, error } = useApi();

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { url } = await request({
        method: "POST",
        url: "/admin/hero/upload",
        params: { kind },
        data: fd,
      });
      onChange(url);
    } catch {
      // useApi stores the message in `error`
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-gray-800">
        {label}
      </span>
      <div
        className={`mb-2 overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 ${
          kind === "mobile"
            ? "aspect-[3/4] max-w-[200px]"
            : "aspect-[1920/900] w-full"
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-xs text-gray-500">
            No image yet
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => ref.current?.click()}
          className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Remove
          </button>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={pickFile}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function SaveBar({ saving, message, error, dirty }) {
  return (
    <div className="flex items-center gap-4 border-t border-gray-200 pt-4">
      <button
        type="submit"
        disabled={saving || !dirty}
        className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
      <p role="status" className="text-sm text-green-700">
        {message}
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
