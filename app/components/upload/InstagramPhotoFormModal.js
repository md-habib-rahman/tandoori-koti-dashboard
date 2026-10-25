"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useApi } from "@/hook/useApi";

import ImageUploadField from "./ImageUploadField";
import AdminModal from "../reservations/AdminModal";

// Save as: src/components/admin/instagram/InstagramPhotoFormModal.js
//
// Mount it only while adding or editing:  {editing && <InstagramPhotoFormModal photo={editing.photo} ... />}
//   photo: the photo being edited, or null for a new one

// The grid shows square tiles, so square photos work best
export const PHOTO_SPEC = {
  label: "Photo",
  width: 1080,
  height: 1080,
  minWidth: 600,
  minHeight: 600,
  maxBytes: 800 * 1024,
  hint: "Square photos fit best. The first photo in the list is shown large on the home page.",
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-600 uppercase">
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

export default function InstagramPhotoFormModal({ photo, onClose, onSaved }) {
  const { request } = useApi();

  const [form, setForm] = useState({
    altFi: photo?.altFi || "",
    altEn: photo?.altEn || "",
    postUrl: photo?.postUrl || "",
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    if (!file && !photo?.imageUrl) {
      setErrors({ imageUrl: "Choose a photo." });
      return;
    }

    try {
      setSaving(true);

      // 1. Upload the new image, if one was chosen (same upload endpoint as the dish images)
      let imageUrl = photo?.imageUrl;
      if (file) {
        const body = new FormData();
        body.append("image", file);
        const uploaded = await request({
          method: "POST",
          url: "/upload",
          data: body,
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploaded.url;
      }

      // 2. Save the photo
      const payload = { ...form, imageUrl };
      const res = photo
        ? await request({
            method: "PUT",
            url: `/instagram/admin/${photo.id}`,
            data: payload,
          })
        : await request({
            method: "POST",
            url: "/instagram/admin",
            data: payload,
          });

      onSaved(res?.data);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      setMessage(
        data?.message || "Could not save the photo. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      open
      onClose={onClose}
      title={photo ? "Edit photo" : "Add photo"}
      subtitle="Shown in the Instagram section on the home page"
      size="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="instagram-photo-form"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            )}
            {saving ? "Saving..." : "Save photo"}
          </button>
        </div>
      }
    >
      <form
        id="instagram-photo-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {message && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
          >
            {message}
          </p>
        )}

        <ImageUploadField
          spec={PHOTO_SPEC}
          value={photo?.imageUrl}
          file={file}
          onFile={setFile}
          error={errors.imageUrl}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Description (Suomeksi)"
            error={errors.altFi}
            hint="Read aloud by screen readers. Optional."
          >
            <input
              type="text"
              maxLength={150}
              placeholder="esim. Voikana ja naan"
              value={form.altFi}
              onChange={setField("altFi")}
              className={inputClass}
            />
          </Field>
          <Field
            label="Description (English)"
            error={errors.altEn}
            hint="Optional."
          >
            <input
              type="text"
              maxLength={150}
              placeholder="e.g. Butter chicken with naan"
              value={form.altEn}
              onChange={setField("altEn")}
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Link to the Instagram post"
          error={errors.postUrl}
          hint="Optional. When empty, the photo links to the restaurant's Instagram profile."
        >
          <input
            type="url"
            placeholder="https://www.instagram.com/p/..."
            value={form.postUrl}
            onChange={setField("postUrl")}
            className={inputClass}
          />
        </Field>
      </form>
    </AdminModal>
  );
}
