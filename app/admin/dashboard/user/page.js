import UsersManager from "@/app/components/users/UsersManager";

export const metadata = { title: "Users | Dashboard" };

export default function UsersDashboardPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-2xl font-semibold text-gray-900">Users</h1>
      <p className="mb-8 text-sm text-gray-600">
        Manage your password and, as an admin, the people who can log in.
      </p>
      <UsersManager />
    </main>
  );
}
