"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const currentPage =
    navItems.find((item) => item.href === pathname)?.name || "Dashboard";

  const SidebarContent = (
    <>
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
                onClick={() => setMobileNavOpen(false)}
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
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-col justify-between p-6 shadow-xs shrink-0">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer + Overlay */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <aside className="relative w-72 max-w-[80vw] bg-white flex flex-col justify-between p-6 shadow-xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile/tablet only */}
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="text-xs sm:text-sm font-medium text-slate-500 truncate">
              <span className="hidden sm:inline">Control Center / </span>
              {currentPage}
            </span>
          </div>

          {/* User Status & Header Logout Button */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
              <span className="text-sm font-medium text-slate-700">
                tandoori_admin
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
