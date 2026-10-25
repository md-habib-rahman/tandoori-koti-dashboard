"use client";

import { useState } from "react";
import { useApi } from "@/hook/useApi.js";
import { Bilingual, SaveBar, TextField } from "./HeroFields";

const DAYS = [
  [1, "Monday"],
  [2, "Tuesday"],
  [3, "Wednesday"],
  [4, "Thursday"],
  [5, "Friday"],
  [6, "Saturday"],
  [0, "Sunday"],
]; // stored index 0 = Sunday

const num = "w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm";

export default function BandEditor({ band, onSaved }) {
  const [draft, setDraft] = useState(band);
  const [saved, setSaved] = useState(band);
  const { request, isLoading: saving, error } = useApi();
  const [message, setMessage] = useState("");

  const set = (key) => (value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setMessage("");
  };
  const setHour = (day, pos, v) => {
    const hours = draft.hours.map((h) => [...h]);
    hours[day][pos] = v === "" ? "" : Number(v);
    set("hours")(hours);
  };
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const updated = await request({
        method: "PUT",
        url: "/admin/hero/band",
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
      <p className="text-sm text-gray-600">
        This band appears under every slide. Open or closed status is calculated
        from the hours below (Helsinki time).
      </p>

      <Bilingual
        label="Lunch buffet: heading"
        value={draft.buffetTitle}
        onChange={set("buffetTitle")}
        max={200}
      />
      <Bilingual
        label="Lunch buffet: text"
        value={draft.buffetDesc}
        onChange={set("buffetDesc")}
        max={200}
      />
      <Bilingual
        label="Opening hours: heading"
        value={draft.hoursTitle}
        onChange={set("hoursTitle")}
        max={200}
      />
      <Bilingual
        label="Opening hours: text shown before the status loads"
        value={draft.hoursFallback}
        onChange={set("hoursFallback")}
        max={200}
      />
      <Bilingual
        label="Order or book: heading"
        value={draft.orderTitle}
        onChange={set("orderTitle")}
        max={200}
      />
      <TextField
        label="Phone number"
        value={draft.phone}
        onChange={set("phone")}
        inputMode="tel"
      />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-800">
          Opening hours (24-hour clock)
        </legend>
        <div className="space-y-2">
          {DAYS.map(([day, name]) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-24 text-sm text-gray-700">{name}</span>
              <input
                type="number"
                min={0}
                max={23}
                aria-label={`${name} opens`}
                className={num}
                value={draft.hours[day][0]}
                onChange={(e) => setHour(day, 0, e.target.value)}
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="number"
                min={1}
                max={24}
                aria-label={`${name} closes`}
                className={num}
                value={draft.hours[day][1]}
                onChange={(e) => setHour(day, 1, e.target.value)}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <SaveBar saving={saving} message={message} error={error} dirty={dirty} />
    </form>
  );
}
