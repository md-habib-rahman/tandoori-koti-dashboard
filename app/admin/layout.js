"use client";

// Save as: src/app/admin/layout.js  (replaces your current one)

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarCheck,
  CalendarClock,
  ExternalLink,
  Flame,
  ImageIcon,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Star,
  Truck,
  UtensilsCrossed,
  X,
} from "lucide-react";

// Navigation, grouped by what the owner is doing. A group without a label is a single stand-alone link.
const NAV_GROUPS = [
  {
    label: null,
    items: [
      { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Menu and content",
    items: [
      { name: "Home Banner", href: "/admin/dashboard/hero", icon: ImageIcon },
      {
        name: "Add / Edit Dish",
        href: "/admin/dashboard/add-dish",
        icon: UtensilsCrossed,
      },
      {
        name: "Buffet Schedule",
        href: "/admin/dashboard/buffet",
        icon: CalendarClock,
      },
      { name: "Gallery", href: "/admin/dashboard/gallery", icon: Images },
      { name: "Set Reviews", href: "/admin/dashboard/reviews", icon: Star },
    ],
  },
  {
    label: "Guests and orders",
    items: [
      {
        name: "User Messages",
        href: "/admin/dashboard/messages",
        icon: MessageSquare,
      },
      {
        name: "Reservations",
        href: "/admin/dashboard/reservations",
        icon: CalendarCheck,
      },
      { name: "Delivery", href: "/admin/dashboard/delivery", icon: Truck },
    ],
  },
  {
    label: null,
    items: [
      { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2A93B]";

function NavItem({ item, active, collapsed, onNavigate }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.name : undefined}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${focusRing} ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "bg-[#F2A93B]/14 text-[#F2A93B]"
          : "text-[#D9C6A8] hover:bg-white/5 hover:text-[#F3E7D3]"
      }`}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#F2A93B]"
        />
      )}
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {collapsed ? (
        <span className="sr-only">{item.name}</span>
      ) : (
        <span className="truncate">{item.name}</span>
      )}
    </Link>
  );
}

function SidebarContent({
  collapsed = false,
  isActive,
  onNavigate,
  onLogout,
  onClose,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Brand */}
      <div
        className={`flex items-center gap-3 px-4 pb-5 pt-6 ${collapsed ? "justify-center px-2" : ""}`}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2A93B] text-[#2A1206] shadow-lg shadow-black/30">
          <Flame className="h-5 w-5" aria-hidden="true" />
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg font-bold leading-tight text-[#F3E7D3]">
              Tandoori Koti
            </p>
            <p className="truncate text-xs text-[#D9C6A8]/70">
              Restaurant admin
            </p>
          </div>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#D9C6A8] transition-colors hover:bg-white/10 hover:text-[#F3E7D3] ${focusRing}`}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        aria-label="Admin"
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-4"
      >
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi === 0 ? "" : "mt-5"}>
            {group.label &&
              (collapsed ? (
                <div
                  className="mx-3 mb-2 border-t border-white/10"
                  aria-hidden="true"
                />
              ) : (
                <p className="mb-1.5 px-3 text-xs font-medium text-[#D9C6A8]/55">
                  {group.label}
                </p>
              ))}
            {!group.label && gi !== 0 && collapsed && (
              <div
                className="mx-3 mb-2 border-t border-white/10"
                aria-hidden="true"
              />
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Account */}
      <div className="border-t border-white/10 p-3">
        <div
          className={`flex items-center gap-3 rounded-xl px-2 py-2 ${collapsed ? "justify-center" : ""}`}
        >
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#3B1511] font-serif text-base font-bold text-[#F2A93B] ring-1 ring-[#F2A93B]/40"
          >
            T
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#F3E7D3]">
                tandoori_admin
              </p>
              <p className="truncate text-xs text-[#D9C6A8]/70">
                Administrator
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Sign out" : undefined}
          className={`mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/15 hover:text-rose-200 ${focusRing} ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {collapsed ? (
            <span className="sr-only">Sign out</span>
          ) : (
            <span>Sign out</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Close the drawer when the route changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // While the drawer is open: Escape closes it and the page behind it does not scroll
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  // If on the login page, render the clean full-screen form without sidebar/header
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Comprehensive cookie cleanup and redirect
  const handleLogout = () => {
    Cookies.remove("admin_token", { path: "/" });
    document.cookie =
      "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/admin/login");
    router.refresh();
  };

  // The Overview link only matches exactly; every other link also matches its sub-pages
  const isActive = (href) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const currentItem = ALL_ITEMS.find((item) => isActive(item.href));
  const CurrentIcon = currentItem?.icon ?? LayoutDashboard;
  const currentPage = currentItem?.name ?? "Dashboard";

  const drawerTransition = {
    duration: reduce ? 0 : 0.28,
    ease: [0.22, 1, 0.36, 1],
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 bg-[#1C0D0A] shadow-xl shadow-black/20 transition-[width] duration-300 lg:block ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <SidebarContent
          collapsed={collapsed}
          isActive={isActive}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile drawer + overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}
        {mobileNavOpen && (
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#1C0D0A] shadow-2xl lg:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={drawerTransition}
          >
            <SidebarContent
              isActive={isActive}
              onNavigate={() => setMobileNavOpen(false)}
              onLogout={handleLogout}
              onClose={() => setMobileNavOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* Hamburger: phones and tablets */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileNavOpen}
              className={`-ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden ${focusRing}`}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Collapse toggle: desktop */}
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
              className={`-ml-2 hidden h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:grid ${focusRing}`}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-200/70">
              <CurrentIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>

            <div className="min-w-0 leading-tight">
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                Control Center
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {currentPage}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View website (opens in a new tab)"
              className={`inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 ${focusRing}`}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">View site</span>
            </a>

            <div className="hidden items-center gap-2.5 border-l border-slate-200 pl-3 sm:flex">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 place-items-center rounded-full bg-[#1C0D0A] font-serif text-base font-bold text-[#F2A93B]"
              >
                T
              </span>
              <div className="leading-tight">
                <p className="text-sm font-medium text-slate-800">
                  tandoori_admin
                </p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  Online
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
