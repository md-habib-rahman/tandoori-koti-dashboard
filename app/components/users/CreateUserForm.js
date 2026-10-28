"use client";

import { useState } from "react";
import { useApi } from "@/hook/useApi";
import { inputClass } from "./ChangePasswordForm";

const EMPTY = { fullName: "", username: "", password: "", userRole: "USER" };

export default function CreateUserForm({ onCreated }) {
  const { request, isLoading, error } = useApi();
  const [form, setForm] = useState(EMPTY);
  const [done, setDone] = useState("");

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setDone("");
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await request({ method: "POST", url: "/users", data: form });
      onCreated(user);
      setForm(EMPTY);
      setDone(`User "${user.username}" created`);
    } catch {
      // useApi stores the message in `error`
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-800">
            Full name (optional)
          </span>
          <input
            className={inputClass}
            maxLength={100}
            value={form.fullName}
            onChange={set("fullName")}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-800">
            Username
          </span>
          <input
            required
            autoComplete="off"
            className={inputClass}
            value={form.username}
            onChange={set("username")}
          />
          <span className="mt-1 block text-xs text-gray-500">
            3 to 30 characters: letters, numbers, . - _
          </span>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-800">
            Temporary password
          </span>
          <input
            required
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={form.password}
            onChange={set("password")}
          />
          <span className="mt-1 block text-xs text-gray-500">
            8 to 72 characters. They can change it after logging in.
          </span>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-800">
            Role
          </span>
          <select
            className={inputClass}
            value={form.userRole}
            onChange={set("userRole")}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-50"
        >
          {isLoading ? "Creating…" : "Create user"}
        </button>
        {done && (
          <p role="status" className="text-sm text-green-700">
            {done}
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
