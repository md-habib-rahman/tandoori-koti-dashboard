"use client";

import { Bike, CalendarDays, ChefHat } from "lucide-react";
import { money } from "./ReportSummary";
import { formatDate } from "./reportDates";

// Save as: src/components/admin/delivery/ReportBreakdowns.js

const minutes = (value) =>
  value === null || value === undefined ? "–" : `${Math.round(value)} min`;

function Panel({ title, note, Icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <header className="mb-4 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
          <Icon size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          {note && <p className="text-xs text-slate-500">{note}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

const weekday = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  });

export default function ReportBreakdowns({ byMedium, byDay, topDishes }) {
  const maxRevenue = Math.max(1, ...byDay.map((d) => d.revenue));
  const totalDeliveries = byMedium.reduce((sum, m) => sum + m.deliveries, 0);
  const totalCash = byMedium.reduce((sum, m) => sum + m.cash, 0);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* Per rider or delivery service */}
      <Panel
        title="By delivery medium"
        note="Deliveries and the cash each rider or service should hand in (all orders are paid on delivery)"
        Icon={Bike}
      >
        {byMedium.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No delivered orders in this period.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  <th className="py-2.5 pr-3">Rider / service</th>
                  <th className="px-3 py-2.5 text-right">Deliveries</th>
                  <th className="px-3 py-2.5 text-right">Cash collected</th>
                  <th className="py-2.5 pl-3 text-right">Avg time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byMedium.map((m) => (
                  <tr key={m.name ?? "none"}>
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">
                      {m.name || (
                        <span className="font-normal text-slate-400 italic">
                          Not recorded
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-700">
                      {m.deliveries}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-900">
                      {money(m.cash)}
                    </td>
                    <td className="py-2.5 pl-3 text-right text-slate-600">
                      {minutes(m.averageMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 font-bold text-slate-900">
                  <td className="py-2.5 pr-3">Total</td>
                  <td className="px-3 py-2.5 text-right">{totalDeliveries}</td>
                  <td className="px-3 py-2.5 text-right">{money(totalCash)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Panel>

      {/* Per day */}
      <Panel
        title="By day"
        note="Orders placed each day and the cash collected on delivered ones"
        Icon={CalendarDays}
      >
        <ul className="space-y-2.5">
          {byDay.map((d) => (
            <li
              key={d.date}
              className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 text-sm"
            >
              <span className="text-slate-700">
                <span className="font-semibold">{weekday(d.date)}</span>{" "}
                <span className="text-slate-500">
                  {formatDate(d.date).slice(0, 5)}
                </span>
              </span>
              <span
                className="h-3 overflow-hidden rounded-full bg-slate-100"
                aria-hidden="true"
              >
                <span
                  className="block h-full rounded-full bg-amber-500"
                  style={{ width: `${(d.revenue / maxRevenue) * 100}%` }}
                />
              </span>
              <span className="text-right whitespace-nowrap">
                <span className="font-semibold text-slate-900">
                  {money(d.revenue)}
                </span>{" "}
                <span className="text-xs text-slate-500">
                  ({d.delivered}/{d.orders})
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400">
          In brackets: delivered / orders placed that day.
        </p>
      </Panel>

      {/* Top dishes */}
      <Panel
        title="Top dishes"
        note="Most ordered dishes on delivered orders"
        Icon={ChefHat}
      >
        {topDishes.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No delivered orders in this period.
          </p>
        ) : (
          <ol className="space-y-2">
            {topDishes.map((dish, i) => (
              <li key={dish.nameEn} className="flex items-center gap-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-900">
                    {dish.nameEn}
                  </span>
                  {dish.nameFi && dish.nameFi !== dish.nameEn && (
                    <span className="block truncate text-xs text-slate-500">
                      {dish.nameFi}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-semibold text-slate-900">
                    {dish.quantity} pcs
                  </span>
                  <span className="block text-xs text-slate-500">
                    {money(dish.revenue)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}
