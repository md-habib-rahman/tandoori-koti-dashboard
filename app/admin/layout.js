"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // 1. If on login page, render clean full-screen form without sidebar/header
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // 2. Comprehensive cookie cleanup and redirect
  const handleLogout = () => {
    Cookies.remove("admin_token", { path: "/" });
    document.cookie =
      "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    { name: "Overview", href: "/admin/dashboard" },
    { name: "Add / Edit Dish", href: "/admin/dashboard/add-dish" },
    { name: "Buffet Schedule", href: "/admin/dashboard/buffet" },
    { name: "User Messages", href: "/admin/dashboard/messages" },
    { name: "Reservations", href: "/admin/dashboard/reservations" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-6 shadow-xs shrink-0">
        <div className="space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
              Restaurant CMS
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-3 tracking-tight">
              Tandoori Koti
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin Management Portal
            </p>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-50 text-amber-800 font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-8">
          <span className="text-sm font-medium text-slate-500">
            Control Center / Dashboard
          </span>

          {/* User Status & Header Logout Button */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
              <span className="text-sm font-medium text-slate-700">
                tandoori_admin
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
