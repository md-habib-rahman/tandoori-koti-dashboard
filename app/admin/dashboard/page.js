"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApi } from "@/hook/useApi";

export default function AdminOverviewPage() {
  const { request } = useApi();

  const [stats, setStats] = useState({
    regularCount: 0,
    scheduledBuffetsCount: 0,
    categoriesCount: 0,
  });
  const [recentDishes, setRecentDishes] = useState([]);
  const [upcomingBuffets, setUpcomingBuffets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);

        // Fetch only active, valid endpoints
        const [regularRes, buffetSchedRes] = await Promise.all([
          request({ method: "GET", url: "/menu/regular" }),
          request({ method: "GET", url: "/menu/buffet" }),
        ]);

        const regularItems = regularRes?.data || [];
        const buffetSchedules = buffetSchedRes?.data || [];

        // Count unique categories using bilingual categoryEn
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
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [request]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-3 sm:px-4 lg:px-0 py-2">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-amber-200 bg-amber-800/60 px-2.5 sm:px-3 py-1 rounded-full border border-amber-600/50 inline-block">
            Control Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3 leading-tight">
            Tandoori Koti Overview
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl">
            Live management hub for your bilingual (Finnish & English) menu
            catalogue and daily buffet schedules.
          </p>
        </div>

        <div className="flex flex-col xs:flex-row sm:flex-row gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
          <Link
            href="/admin/dashboard/add-dish"
            className="px-4 py-2.5 bg-white text-amber-900 text-xs font-bold rounded-xl hover:bg-amber-50 active:scale-[0.98] transition-all shadow-xs text-center w-full md:w-auto"
          >
            + Add Dish
          </Link>
          <Link
            href="/admin/dashboard/buffet"
            className="px-4 py-2.5 bg-amber-800/80 border border-amber-600/60 text-white text-xs font-bold rounded-xl hover:bg-amber-800 active:scale-[0.98] transition-all text-center w-full md:w-auto"
          >
            Schedule Buffet
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            A La Carte Dishes
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 sm:mt-2">
            {loading ? "..." : stats.regularCount}
          </p>
          <span className="text-[10px] sm:text-[11px] text-amber-700 font-medium mt-1 inline-block">
            Across {stats.categoriesCount} categories
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Categories
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 sm:mt-2">
            {loading ? "..." : stats.categoriesCount}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 inline-block">
            Bilingual sections (FI/EN)
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            Scheduled Buffets
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 sm:mt-2">
            {loading ? "..." : stats.scheduledBuffetsCount}
          </p>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-1 inline-block">
            Calendar assignments
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            Database
          </p>
          <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
            <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500 shrink-0"></span>
            <p className="text-sm sm:text-lg font-bold text-slate-900">
              Connected
            </p>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 inline-block">
            Neon PostgreSQL (Prisma)
          </span>
        </div>
      </div>

      {/* Main Grid: Recent Bilingual Dishes & Upcoming Buffets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
        {/* RECENT DISHES */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Recent A La Carte Items
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden xs:block">
                Latest menu items published to the database
              </p>
            </div>
            <Link
              href="/admin/dashboard/add-dish"
              className="text-[11px] sm:text-xs font-semibold text-amber-700 hover:text-amber-800 shrink-0 whitespace-nowrap"
            >
              Manage →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="space-y-3 py-2 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentDishes.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No dishes added yet.
              </p>
            ) : (
              recentDishes.map((item) => (
                <div
                  key={item.id}
                  className="py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.nameEn || "Dish"}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-[10px] shrink-0 font-bold">
                        N/A
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight truncate">
                        {item.nameEn}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                        {item.nameFi} •{" "}
                        <span className="text-amber-700 font-medium">
                          {item.categoryEn}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-xs font-bold text-slate-900 shrink-0">
                    €{parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* UPCOMING BUFFET SCHEDULE */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Scheduled Buffets
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden xs:block">
                Upcoming lunch dates
              </p>
            </div>
            <Link
              href="/admin/dashboard/buffet"
              className="text-[11px] sm:text-xs font-semibold text-amber-700 hover:text-amber-800 shrink-0 whitespace-nowrap"
            >
              Scheduler →
            </Link>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {loading ? (
              <div className="space-y-2.5 animate-pulse">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2"
                  >
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : upcomingBuffets.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No upcoming buffets scheduled.
              </p>
            ) : (
              upcomingBuffets.map((sched) => (
                <div
                  key={sched.id}
                  className="p-3 sm:p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">
                      {new Date(sched.date).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      {sched.weekday}
                    </span>
                  </div>

                  {/* Dishes connected to this buffet */}
                  <div className="flex flex-wrap gap-1">
                    {sched.dishes?.slice(0, 3).map((dish) => (
                      <span
                        key={dish.id}
                        className="text-[9px] sm:text-[10px] bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded"
                      >
                        {dish.nameEn}
                      </span>
                    ))}
                    {sched.dishes?.length > 3 && (
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium self-center">
                        +{sched.dishes.length - 3} more
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
  );
}
