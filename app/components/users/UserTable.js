"use client";

import { useState } from "react";
import { useApi } from "@/hook/useApi";

export default function UserTable({ users, meId, onUpdated, onDeleted }) {
  const { request, error, setError } = useApi();
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null); // row waiting for delete confirmation

  const changeRole = async (user, userRole) => {
    setBusyId(user.id);
    try {
      onUpdated(
        await request({
          method: "PATCH",
          url: `/users/${user.id}/role`,
          data: { userRole },
        }),
      );
    } catch {
      // useApi stores the message in `error`
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (user) => {
    setBusyId(user.id);
    try {
      await request({ method: "DELETE", url: `/users/${user.id}` });
      onDeleted(user.id);
    } catch {
      // useApi stores the message in `error`
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  return (
    <div>
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2 pr-4 font-medium">User</th>
              <th className="py-2 pr-4 font-medium">Role</th>
              <th className="py-2 pr-4 font-medium">Created</th>
              <th className="py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = u.id === meId;
              const busy = busyId === u.id;
              return (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 align-middle"
                >
                  <td className="py-3 pr-4">
                    <span className="block font-medium text-gray-900">
                      {u.fullName || u.username}
                      {isMe && (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                          You
                        </span>
                      )}
                    </span>
                    {u.fullName && (
                      <span className="text-xs text-gray-500">
                        @{u.username}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      aria-label={`Role for ${u.username}`}
                      value={u.userRole}
                      disabled={isMe || busy}
                      onChange={(e) => changeRole(u, e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    {isMe ? (
                      <span className="text-xs text-gray-400">
                        Cannot edit yourself
                      </span>
                    ) : confirmId === u.id ? (
                      <span className="inline-flex gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => remove(u)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                        >
                          {busy ? "Deleting…" : "Yes, delete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setConfirmId(u.id);
                        }}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
