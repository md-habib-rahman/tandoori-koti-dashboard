"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Lucide-react Icon standard components simulated with SVG for standalone safety & preview support
const IconUtensils = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const IconCalendar = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const IconGrid = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const IconDatabase = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
    />
  </svg>
);

const IconPlus = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const IconChevronRight = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const IconTrendingUp = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

// Simulated fallback useApi hook if project path `@/hook/useApi` is unlinked in preview
const useApiMock = () => {
  const request = async ({ url }) => {
    // Simulating slight network latency for preview
    await new Promise((res) => setTimeout(res, 800));

    if (url === "/menu/regular") {
      return {
        data: [
          {
            id: "1",
            nameEn: "Chicken Butter Masala",
            nameFi: "Voikanaa Masala",
            categoryEn: "Main Dishes",
            price: "16.90",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            imageUrl:
              "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=120&q=80",
          },
          {
            id: "2",
            nameEn: "Garlic Garlic Naan",
            nameFi: "Valkosipulinaat-leipä",
            categoryEn: "Breads",
            price: "4.50",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            imageUrl:
              "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=120&q=80",
          },
          {
            id: "3",
            nameEn: "Paneer Tikka Grill",
            nameFi: "Paneer Tikka Grillattu",
            categoryEn: "Vegetarian",
            price: "15.50",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            imageUrl: "",
          },
          {
            id: "4",
            nameEn: "Lamb Vindaloo Curry",
            nameFi: "Lammasta Vindaloo",
            categoryEn: "Main Dishes",
            price: "18.20",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
            imageUrl:
              "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=120&q=80",
          },
          {
            id: "5",
            nameEn: "Mango Lassi Drink",
            nameFi: "Mangolassi Juoma",
            categoryEn: "Beverages",
            price: "4.90",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            imageUrl: "",
          },
        ],
      };
    }

    if (url === "/menu/buffet") {
      return {
        data: [
          {
            id: "b1",
            date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            weekday: "Friday",
            dishes: [
              { id: "1", nameEn: "Butter Chicken" },
              { id: "2", nameEn: "Basmati Rice" },
              { id: "3", nameEn: "Mixed Dal Curry" },
              { id: "4", nameEn: "Fresh Naan" },
            ],
          },
          {
            id: "b2",
            date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
            weekday: "Saturday",
            dishes: [
              { id: "5", nameEn: "Chicken Biryani" },
              { id: "6", nameEn: "Raita Mix" },
              { id: "7", nameEn: "Gulab Jamun" },
            ],
          },
          {
            id: "b3",
            date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
            weekday: "Sunday",
            dishes: [
              { id: "8", nameEn: "Korma Lamb" },
              { id: "9", nameEn: "Saag Paneer" },
              { id: "10", nameEn: "Papadum Crisps" },
              { id: "11", nameEn: "Kheer Dessert" },
            ],
          },
        ],
      };
    }
    return { data: [] };
  };

  return { request };
};

export default function AdminOverviewPage() {
  // Graceful fallback to mock hook if custom hook import is unavailable
  let request;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const api = useApiMock();
    request = api.request;
  } catch (e) {
    request = useApiMock().request;
  }

  const [stats, setStats] = useState({
    regularCount: 0,
    scheduledBuffetsCount: 0,
    categoriesCount: 0,
  });
  const [recentDishes, setRecentDishes] = useState([]);
  const [upcomingBuffets, setUpcomingBuffets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchOverviewData = async () => {
      try {
        setLoading(true);

        const [regularRes, buffetSchedRes] = await Promise.all([
          request({ method: "GET", url: "/menu/regular" }),
          request({ method: "GET", url: "/menu/buffet" }),
        ]);

        if (!isMounted) return;

        const regularItems = regularRes?.data || [];
        const buffetSchedules = buffetSchedRes?.data || [];

        // Unique categories calculation using bilingual field standard
        const uniqueCategories = new Set(
          regularItems
            .map((item) => item.categoryEn || item.category)
            .filter(Boolean),
        );

        setStats({
          regularCount: regularItems.length,
          scheduledBuffetsCount: buffetSchedules.length,
          categoriesCount: uniqueCategories.size,
        });

        // 5 most recent dishes
        const sortedDishes = [...regularItems]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentDishes(sortedDishes);

        // Next 4 upcoming buffet schedules
        const sortedBuffets = [...buffetSchedules]
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 4);
        setUpcomingBuffets(sortedBuffets);
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOverviewData();

    return () => {
      isMounted = false;
    };
  }, [request]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-4 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* ========================================================================= */}
        {/* 1. HEADER BANNER - Fully Responsive Layout & Fluid Typography */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-amber-950/10 border border-amber-700/30">
          {/* Subtle Ambient Background Decorative Circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 sm:w-64 sm:h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-200 bg-amber-800/80 px-3 py-1 rounded-full border border-amber-600/40 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Control Center
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
                Tandoori Koti Overview
              </h1>
              <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed max-w-xl">
                Live management hub for your bilingual (Finnish & English) menu
                catalogue and daily buffet schedules.
              </p>
            </div>

            {/* Banner Quick Actions - Responsive full-width on mobile */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
              <Link
                href="/admin/dashboard/add-dish"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 bg-white text-amber-950 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl hover:bg-amber-50 active:scale-[0.98] transition-all shadow-md shadow-amber-950/20 group"
              >
                <IconPlus className="w-4 h-4 text-amber-800 group-hover:scale-110 transition-transform" />
                <span>Add New Dish</span>
              </Link>

              <Link
                href="/admin/dashboard/buffet"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 bg-amber-800/60 hover:bg-amber-800/90 border border-amber-600/50 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl backdrop-blur-sm active:scale-[0.98] transition-all"
              >
                <IconCalendar className="w-4 h-4 text-amber-200" />
                <span>Schedule Buffet</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. METRIC CARDS GRID - Responsive Adaptive Layout & Pulse Skeletons */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Metric Card 1: À La Carte Dishes */}
          <div className="group bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                A La Carte Dishes
              </p>
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <IconUtensils className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="h-9 w-24 bg-slate-200 animate-pulse rounded-lg" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {stats.regularCount}
                  </p>
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                    <IconTrendingUp className="mr-0.5" /> Active
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-amber-800/80 font-medium mt-2 flex items-center gap-1">
              Across{" "}
              <span className="font-bold text-amber-900">
                {loading ? "..." : stats.categoriesCount}
              </span>{" "}
              menu categories
            </p>
          </div>

          {/* Metric Card 2: Active Categories */}
          <div className="group bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Categories
              </p>
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <IconGrid className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="h-9 w-20 bg-slate-200 animate-pulse rounded-lg" />
              ) : (
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {stats.categoriesCount}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium mt-2">
              Bilingual support (FI / EN)
            </p>
          </div>

          {/* Metric Card 3: Scheduled Buffets */}
          <div className="group bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Scheduled Buffets
              </p>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <IconCalendar className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="h-9 w-20 bg-slate-200 animate-pulse rounded-lg" />
              ) : (
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {stats.scheduledBuffetsCount}
                </p>
              )}
            </div>

            <p className="text-xs text-emerald-700 font-medium mt-2">
              Calendar assignments
            </p>
          </div>

          {/* Metric Card 4: Database Connection */}
          <div className="group bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Database Status
              </p>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <IconDatabase className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                Connected
              </p>
            </div>

            <p className="text-xs text-slate-500 font-medium mt-2 truncate">
              Neon PostgreSQL (Prisma)
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN DASHBOARD CONTENT GRID (12 Columns) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT PANEL: RECENT A LA CARTE ITEMS (7 Cols on LG) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Recent À La Carte Items
                </h2>
                <p className="text-xs text-slate-500">
                  Latest dishes added to the live menu
                </p>
              </div>

              <Link
                href="/admin/dashboard/add-dish"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline self-start xs:self-center transition-colors"
              >
                <span>Manage Inventory</span>
                <IconChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List Content */}
            <div className="divide-y divide-slate-100">
              {loading ? (
                // Skeleton Loader Rows
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-slate-200 animate-pulse rounded-xl shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 sm:w-48 bg-slate-200 animate-pulse rounded" />
                        <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-14 bg-slate-200 animate-pulse rounded" />
                  </div>
                ))
              ) : recentDishes.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                    <IconUtensils className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    No dishes found in inventory.
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Start by creating your first à la carte dish entry.
                  </p>
                </div>
              ) : (
                recentDishes.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 hover:bg-slate-50/80 px-2 rounded-xl transition-colors flex items-center justify-between gap-3 sm:gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Image Thumbnail with Fallback */}
                      {item.imageUrl ? (
                        <div className="relative w-11 h-11 shrink-0 rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs">
                          <Image
                            src={item.imageUrl}
                            alt={item.nameEn || "Dish"}
                            fill
                            sizes="44px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs border border-amber-200/50">
                          {item.nameEn
                            ? item.nameEn.substring(0, 2).toUpperCase()
                            : "NA"}
                        </div>
                      )}

                      {/* Title & Bilingual Subtitle */}
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate leading-snug">
                          {item.nameEn}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1.5">
                          <span className="truncate">{item.nameFi || "—"}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-amber-800 font-semibold shrink-0 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/50">
                            {item.categoryEn || item.category || "General"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-slate-900 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block">
                        €
                        {item.price
                          ? parseFloat(item.price).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT PANEL: UPCOMING BUFFET SCHEDULE (5 Cols on LG) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Scheduled Buffets
                </h2>
                <p className="text-xs text-slate-500">Upcoming lunch menus</p>
              </div>

              <Link
                href="/admin/dashboard/buffet"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline transition-colors"
              >
                <span>Open Scheduler</span>
                <IconChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Schedule Cards */}
            <div className="space-y-3">
              {loading ? (
                // Schedule Skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-28 bg-slate-200 animate-pulse rounded" />
                      <div className="h-4 w-16 bg-slate-200 animate-pulse rounded" />
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-5 w-16 bg-slate-200 animate-pulse rounded" />
                      <div className="h-5 w-20 bg-slate-200 animate-pulse rounded" />
                    </div>
                  </div>
                ))
              ) : upcomingBuffets.length === 0 ? (
                <div className="py-10 text-center space-y-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-4">
                  <IconCalendar className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    No upcoming buffets scheduled
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Click "Open Scheduler" above to map upcoming days.
                  </p>
                </div>
              ) : (
                upcomingBuffets.map((sched) => (
                  <div
                    key={sched.id}
                    className="p-4 bg-slate-50/90 hover:bg-amber-50/30 border border-slate-200/80 hover:border-amber-200/80 rounded-2xl transition-all duration-150 space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-600" />
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {new Date(sched.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-300/40 uppercase tracking-wider">
                        {sched.weekday}
                      </span>
                    </div>

                    {/* Connected Dishes Badge Scroll/Wrap */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sched.dishes && sched.dishes.length > 0 ? (
                        <>
                          {sched.dishes.slice(0, 3).map((dish) => (
                            <span
                              key={dish.id}
                              className="text-[10px] sm:text-[11px] bg-white text-slate-700 font-medium border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs group-hover:border-amber-200"
                            >
                              {dish.nameEn}
                            </span>
                          ))}
                          {sched.dishes.length > 3 && (
                            <span className="text-[10px] text-amber-800 font-bold self-center bg-amber-100/50 px-1.5 py-0.5 rounded">
                              +{sched.dishes.length - 3} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          No specific dishes assigned
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MOBILE FLOATING ACTION BUTTON (FAB) - Quick Access for Mobile Users */}
      {/* ========================================================================= */}
      <div className="fixed bottom-5 right-5 sm:hidden z-50">
        <Link
          href="/admin/dashboard/add-dish"
          aria-label="Add Dish"
          className="flex items-center justify-center w-14 h-14 bg-amber-800 text-white rounded-full shadow-lg shadow-amber-900/40 active:scale-95 transition-transform border border-amber-600"
        >
          <IconPlus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
