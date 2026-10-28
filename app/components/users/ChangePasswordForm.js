"use client";

import { useState } from "react";
import { useApi } from "@/hook/useApi";

export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30";

export default function ChangePasswordForm() {
  const { request, isLoading, error, setError } = useApi();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [done, setDone] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setDone(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm)
      return setError("The new passwords do not match.");
    try {
      await request({
        method: "PATCH",
        url: "/users/me/password",
        data: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
      });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      setDone(true);
    } catch {
      // useApi stores the message in `error`
    }
  };

  return (
    <form onSubmit={submit} className="grid max-w-md gap-4">
      {[
        ["currentPassword", "Current password", "current-password"],
        ["newPassword", "New password (8 to 72 characters)", "new-password"],
        ["confirm", "Repeat new password", "new-password"],
      ].map(([key, label, auto]) => (
        <label key={key} className="block">
          <span className="mb-1 block text-sm font-medium text-gray-800">
            {label}
          </span>
          <input
            type="password"
            required
            autoComplete={auto}
            className={inputClass}
            value={form[key]}
            onChange={set(key)}
          />
        </label>
      ))}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-50"
        >
          {isLoading ? "Saving…" : "Update password"}
        </button>
        {done && (
          <p role="status" className="text-sm text-green-700">
            Password updated
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
