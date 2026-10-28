"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hook/useApi";
import { alert } from "@/lib/alert";

const FIELDS = [
  { name: "lunchBuffetPrice", label: "Lunch Buffet Price" },
  { name: "lunchChildPrice", label: "Lunch Child Price" },
  { name: "luchTakewayPrice", label: "Lunch Takeaway Price" },
];

export default function LunchPriceForm() {
  const { request, isLoading } = useApi();

  const [settings, setSettings] = useState(null);
  const [values, setValues] = useState({
    lunchBuffetPrice: "",
    lunchChildPrice: "",
    luchTakewayPrice: "",
  });
  const [initializing, setInitializing] = useState(true);

  const syncValues = (data) =>
    setValues({
      lunchBuffetPrice: data.lunchBuffetPrice ?? "",
      lunchChildPrice: data.lunchChildPrice ?? "",
      luchTakewayPrice: data.luchTakewayPrice ?? "",
    });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await request({ url: "/settings", method: "GET" });
        setSettings(res.data);
        syncValues(res.data);
      } catch (err) {
        alert.error(
          "Failed to load settings",
          err.response?.data?.error || err.message,
        );
      } finally {
        setInitializing(false);
      }
    };
    load();
  }, [request]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!settings) return;

    // "" -> null, otherwise Number
    const parsed = {};
    for (const { name, label } of FIELDS) {
      const raw = values[name];
      if (raw === "" || raw === null) {
        parsed[name] = null;
        continue;
      }
      const num = Number(raw);
      if (!Number.isFinite(num) || num < 0) {
        return alert.error(`${label} must be a non-negative number.`);
      }
      parsed[name] = num;
    }

    try {
      // Backend validates and overwrites the whole record,
      // so send the existing settings plus the 3 changed fields.
      const res = await request({
        url: "/settings/admin",
        method: "PUT",
        data: { ...settings, ...parsed },
      });

      setSettings(res.data);
      syncValues(res.data);
      alert.success(res.message || "Prices updated successfully.");
    } catch (err) {
      alert.error(
        "Failed to update prices",
        err.response?.data?.error || err.message,
      );
    }
  };

  const disabled = initializing || isLoading;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-slate-900 p-5 shadow-xl md:flex-row md:items-end"
    >
      {FIELDS.map(({ name, label }) => (
        <div key={name} className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor={name}
            className="text-xs font-semibold uppercase tracking-wider text-amber-400"
          >
            {label}
          </label>
          <input
            id={name}
            name={name}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            value={values[name]}
            onChange={handleChange}
            disabled={disabled}
            className="h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-60"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={disabled}
        className="h-11 cursor-pointer rounded-xl bg-amber-600 px-6 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading && !initializing ? "Saving..." : "Update"}
      </button>
    </form>
  );
}
