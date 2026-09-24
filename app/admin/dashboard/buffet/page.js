"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useApi } from "@/hook/useApi";

const WEEKDAYS = [
  "Maanantai / Monday",
  "Tiistai / Tuesday",
  "Keskiviikko / Wednesday",
  "Torstai / Thursday",
  "Perjantai / Friday",
  "Lauantai / Saturday",
  "Sunnuntai / Sunday",
];

export default function BuffetManagerPage() {
  const { request } = useApi();

  const [allDishes, setAllDishes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Schedule Form State
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedWeekday, setSelectedWeekday] = useState(WEEKDAYS[0]);
  const [selectedDishIds, setSelectedDishIds] = useState([]);

  // Dish Picker Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const loadData = async () => {
    setLoading(true);
    try {
      const [dishesRes, schedRes] = await Promise.all([
        request({ method: "GET", url: "/menu/regular" }),
        request({ method: "GET", url: "/menu/buffet" }),
      ]);
      setAllDishes(dishesRes?.data || []);
      setSchedules(schedRes?.data || []);
    } catch (err) {
      console.error("Failed to load buffet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    setSelectedDate(dateStr);
    if (!dateStr) return;

    const dayIndex = new Date(dateStr).getDay();
    const mapDayToWeekday = [
      "Sunnuntai / Sunday",
      "Maanantai / Monday",
      "Tiistai / Tuesday",
      "Keskiviikko / Wednesday",
      "Torstai / Thursday",
      "Perjantai / Friday",
      "Lauantai / Saturday",
    ];
    setSelectedWeekday(mapDayToWeekday[dayIndex]);
  };

  const toggleDishSelection = (id) => {
    setSelectedDishIds((prev) =>
      prev.includes(id) ? prev.filter((dishId) => dishId !== id) : [...prev, id]
    );
  };

  // Extract unique bilingual categories from the loaded dishes
  const categories = useMemo(() => {
    const unique = new Map();
    allDishes.forEach((d) => {
      if (d.categoryEn && !unique.has(d.categoryEn)) {
        unique.set(d.categoryEn, d.categoryFi || d.categoryEn);
      }
    });

    return [
      { en: "ALL", fi: "Kaikki" },
      ...Array.from(unique.entries()).map(([en, fi]) => ({ en, fi })),
    ];
  }, [allDishes]);

  // Safe bilingual filter check
  const filteredDishes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allDishes.filter((dish) => {
      if (!dish) return false;

      const matchesCategory =
        categoryFilter === "ALL" ||
        dish.categoryEn === categoryFilter ||
        dish.categoryFi === categoryFilter;

      const matchesSearch =
        !query ||
        dish.nameEn?.toLowerCase().includes(query) ||
        dish.nameFi?.toLowerCase().includes(query) ||
        dish.categoryEn?.toLowerCase().includes(query) ||
        dish.categoryFi?.toLowerCase().includes(query) ||
        dish.preparationEn?.toLowerCase().includes(query) ||
        dish.preparationFi?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [allDishes, categoryFilter, searchQuery]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      setMessage({ text: "Please pick a calendar date.", type: "error" });
      return;
    }
    if (selectedDishIds.length === 0) {
      setMessage({
        text: "Please select at least one dish from the list below.",
        type: "error",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ text: "", type: "" });

      await request({
        method: "POST",
        url: "/menu/buffet",
        data: {
          date: selectedDate,
          weekday: selectedWeekday,
          dishIds: selectedDishIds,
        },
      });

      setMessage({ text: "Buffet schedule successfully saved!", type: "success" });
      setSelectedDate("");
      setSelectedDishIds([]);
      loadData();
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || "Failed to schedule buffet.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (id, dateStr) => {
    if (!window.confirm(`Delete buffet schedule for ${new Date(dateStr).toLocaleDateString()}?`))
      return;
    try {
      await request({ method: "DELETE", url: `/menu/buffet/${id}` });
      loadData();
    } catch (err) {
      console.error("Failed to delete buffet schedule:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Buffet Schedule Manager
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Pick a date, select dishes directly from your catalog, and assign them to the daily buffet.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Schedule Configuration Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 md:p-8 space-y-6">
        <form onSubmit={handleScheduleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Buffet Date
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Weekday
              </label>
              <select
                value={selectedWeekday}
                onChange={(e) => setSelectedWeekday(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
              >
                {WEEKDAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dish Selection Workspace */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Choose Dishes ({selectedDishIds.length} Selected)
              </label>

              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-amber-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.en} value={cat.en}>
                      {cat.en === "ALL" ? "All Categories / Kaikki" : `${cat.en} — ${cat.fi}`}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Filter dishes (EN / FI)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Dishes Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {loading ? (
                <p className="text-xs text-slate-400 col-span-full py-8 text-center">
                  Loading dishes catalog...
                </p>
              ) : allDishes.length === 0 ? (
                <p className="text-xs text-slate-400 col-span-full py-8 text-center">
                  No dishes registered yet. Add dishes in the "Add New Dish" tab first.
                </p>
              ) : filteredDishes.length === 0 ? (
                <p className="text-xs text-slate-400 col-span-full py-8 text-center">
                  No dishes match the filter criteria.
                </p>
              ) : (
                filteredDishes.map((dish) => {
                  const isSelected = selectedDishIds.includes(dish.id);
                  return (
                    <div
                      key={dish.id}
                      onClick={() => toggleDishSelection(dish.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-amber-50 border-amber-300 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 pointer-events-none"
                      />
                      {dish.imageUrl ? (
                        <Image
                          src={dish.imageUrl}
                          alt={dish.nameEn || "Dish image"}
                          width={36}
                          height={36}
                          unoptimized
                          className="w-9 h-9 object-cover rounded-lg shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                          N/A
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                          {dish.nameEn}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {dish.nameFi}
                        </p>
                        <span className="inline-block text-[9px] text-amber-800 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/50 mt-1">
                          {dish.categoryEn}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-xs hover:shadow-md disabled:opacity-60"
          >
            {submitting ? "Saving Buffet..." : "Publish Daily Buffet Schedule"}
          </button>
        </form>
      </div>

      {/* Active Schedules Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 md:p-8">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-4">
          Active Scheduled Buffets
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Weekday</th>
                <th className="py-3 px-3">Dishes Included (EN / FI)</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Loading schedules...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No buffets scheduled yet.
                  </td>
                </tr>
              ) : (
                schedules.map((sched) => (
                  <tr key={sched.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {new Date(sched.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {sched.weekday}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1.5">
                        {sched.dishes?.map((dish) => (
                          <span
                            key={dish.id}
                            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-lg"
                          >
                            {dish.imageUrl && (
                              <Image
                                src={dish.imageUrl}
                                alt={dish.nameEn || "Dish image"}
                                width={16}
                                height={16}
                                unoptimized
                                className="w-4 h-4 rounded-full object-cover shrink-0"
                              />
                            )}
                            <span>
                              <strong>{dish.nameEn}</strong>{" "}
                              <span className="text-amber-700/80">({dish.nameFi})</span>
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteSchedule(sched.id, sched.date)}
                        className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}