"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hook/useApi"; // use the same import path as your hero components
import ChangePasswordForm from "./ChangePasswordForm";
import CreateUserForm from "./CreateUserForm";
import UserTable from "./UserTable";

export default function UsersManager() {
  const { request, error } = useApi();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const profile = await request({ url: "/users/me" });
        setMe(profile);
        if (profile.userRole === "ADMIN")
          setUsers(await request({ url: "/users" }));
      } catch {
        // useApi stores the message in `error`
      }
    })();
  }, [request]);

  if (error && !me)
    return (
      <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {error}
      </p>
    );
  if (!me) return <p className="text-sm text-gray-500">Loading…</p>;

  const isAdmin = me.userRole === "ADMIN";

  return (
    <div className="space-y-10">
      <section
        aria-labelledby="pw-heading"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2
          id="pw-heading"
          className="mb-1 text-lg font-semibold text-gray-900"
        >
          Change my password
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Signed in as <strong>{me.username}</strong> (
          {me.userRole === "ADMIN" ? "Admin" : "User"})
        </p>
        <ChangePasswordForm />
      </section>

      {isAdmin && (
        <>
          <section
            aria-labelledby="create-heading"
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <h2
              id="create-heading"
              className="mb-4 text-lg font-semibold text-gray-900"
            >
              Add a user
            </h2>
            <CreateUserForm
              onCreated={(u) => setUsers((list) => [...list, u])}
            />
          </section>

          <section
            aria-labelledby="list-heading"
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <h2
              id="list-heading"
              className="mb-4 text-lg font-semibold text-gray-900"
            >
              All users ({users.length})
            </h2>
            <UserTable
              users={users}
              meId={me.id}
              onUpdated={(u) =>
                setUsers((list) => list.map((x) => (x.id === u.id ? u : x)))
              }
              onDeleted={(id) =>
                setUsers((list) => list.filter((x) => x.id !== id))
              }
            />
          </section>
        </>
      )}
    </div>
  );
}
