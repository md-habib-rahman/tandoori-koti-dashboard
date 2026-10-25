"use client";

import { useState } from "react";
import { useApi } from "@/hook/useApi";
import { Bilingual, ImageField, SaveBar, TextField } from "./HeroFields";

export default function SlideEditor({ slide, onSaved }) {
  const [draft, setDraft] = useState(slide);
  const [saved, setSaved] = useState(slide);
  const { request, isLoading: saving, error } = useApi();
  const [message, setMessage] = useState("");

  const set = (key) => (value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setMessage("");
  };
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const updated = await request({
        method: "PUT",
        url: `/admin/hero/slides/${slide.id}`,
        data: draft,
      });
      setDraft(updated);
      setSaved(updated);
      setMessage("Saved");
      onSaved?.(updated);
    } catch {
      // useApi stores the message in `error`
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(e) => set("isActive")(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <span className="text-sm font-medium text-gray-800">
          Show this slide on the website
        </span>
      </label>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ImageField
          label="Desktop image"
          kind="desktop"
          value={draft.imageDesktop}
          onChange={set("imageDesktop")}
          hint="1920 × 900 px, JPG or WebP. Keep the subject on the right half; the text sits on the left."
        />
        <ImageField
          label="Mobile image"
          kind="mobile"
          value={draft.imageMobile}
          onChange={set("imageMobile")}
          hint="900 × 1200 px (3:4). Keep the subject in the top half; the text sits at the bottom. Falls back to the desktop image if empty."
        />
      </div>

      <Bilingual
        label="Title"
        value={draft.title}
        onChange={set("title")}
        max={120}
      />
      <Bilingual
        label="Subtitle"
        value={draft.subtitle}
        onChange={set("subtitle")}
        multiline
        max={300}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Main button</h3>
          <Bilingual
            label="Label"
            value={draft.primaryLabel}
            onChange={set("primaryLabel")}
            max={40}
          />
          <TextField
            label="Link"
            value={draft.primaryHref}
            onChange={set("primaryHref")}
            hint="Page like /menu, section like /contact#reserve, or a full https:// address"
          />
        </div>
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Second button</h3>
          <Bilingual
            label="Label"
            value={draft.secondaryLabel}
            onChange={set("secondaryLabel")}
            max={40}
          />
          <TextField
            label="Link"
            value={draft.secondaryHref}
            onChange={set("secondaryHref")}
          />
        </div>
      </div>

      <SaveBar saving={saving} message={message} error={error} dirty={dirty} />
    </form>
  );
}
