"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useApi } from "@/hook/useApi";
import useDeliveryBoard from "@/hook/useDeliveryBoard";
import useAlertSound from "@/hook/useAlertSound";
import OrderCard from "./OrderCard";
import PrintTicket, { makeSampleOrder } from "./PrintTicket";
import { Bell, Printer, RefreshCw, Volume2, WifiOff, X } from "lucide-react";

// Save as: src/components/admin/delivery/DeliveryDashboard.js
// Mount it on an admin page, for example src/app/admin/delivery/page.js:  <DeliveryDashboard />

const POLL_MS = 8000; // how often the board refreshes
const REPEAT_BEEP_MS = 20000; // while a NEW order is waiting, beep again this often

const COLUMNS = [
  { id: "PENDING", title: "New", empty: "No new orders" },
  { id: "PREPARING", title: "Preparing", empty: "Nothing in the kitchen" },
  { id: "OUT_FOR_DELIVERY", title: "On the way", empty: "No deliveries out" },
  { id: "CLOSED", title: "Done (24 h)", empty: "Nothing finished yet" },
];

export default function DeliveryDashboard() {
  const { request } = useApi();
  const { orders, loading, failures, lastUpdated, refresh, replaceOrder } =
    useDeliveryBoard({
      intervalMs: POLL_MS,
    });
  const sound = useAlertSound();

  const [repeatAlert, setRepeatAlert] = useState(true);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [actionError, setActionError] = useState("");
  const [tab, setTab] = useState("PENDING"); // which column shows on small screens
  const [now, setNow] = useState(() => Date.now());

  // Printing: paper width, "print the kitchen ticket when an order is accepted", and the ticket being printed
  const [paperWidth, setPaperWidth] = useState(80); // 80 mm or 58 mm roll
  const [autoPrint, setAutoPrint] = useState(false);
  const [printJob, setPrintJob] = useState(null); // { order, type } while a ticket is being printed

  // Keeps "5 min ago" labels fresh
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  // Orders grouped into columns. Open orders: oldest first (they wait longest). Done: newest first.
  const grouped = useMemo(() => {
    const byOldest = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);
    const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    const of = (status) =>
      orders.filter((o) => o.status === status).sort(byOldest);
    return {
      PENDING: of("PENDING"),
      PREPARING: of("PREPARING"),
      OUT_FOR_DELIVERY: of("OUT_FOR_DELIVERY"),
      CLOSED: orders
        .filter((o) => o.status === "DELIVERED" || o.status === "CANCELLED")
        .sort(byNewest),
    };
  }, [orders]);

  const pendingCount = grouped.PENDING.length;

  // ---- Sound: beep as soon as an order we have not seen before shows up ----
  const seenRef = useRef(new Set());
  useEffect(() => {
    if (loading) return;
    const fresh = grouped.PENDING.filter((o) => !seenRef.current.has(o.id));
    if (fresh.length === 0) return;
    fresh.forEach((o) => seenRef.current.add(o.id));
    if (sound.enabled) sound.beep();
  }, [grouped.PENDING, loading, sound.enabled, sound.beep]);

  // ---- Sound: keep beeping until every new order has been accepted or rejected ----
  useEffect(() => {
    if (!sound.enabled || !repeatAlert || pendingCount === 0) return;
    const id = setInterval(sound.beep, REPEAT_BEEP_MS);
    return () => clearInterval(id);
  }, [sound.enabled, sound.beep, repeatAlert, pendingCount]);

  // ---- Browser tab title shows how many new orders are waiting ----
  useEffect(() => {
    const original = document.title;
    document.title =
      pendingCount > 0
        ? `(${pendingCount}) New orders – Delivery`
        : "Delivery orders";
    return () => {
      document.title = original;
    };
  }, [pendingCount]);

  // ---- Keep the screen awake while sound alerts are on (tablets would otherwise go to sleep) ----
  useEffect(() => {
    if (!sound.enabled || !("wakeLock" in navigator)) return;
    let lock = null;

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
      } catch {
        /* not allowed right now: ignore */
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release?.();
    };
  }, [sound.enabled]);

  // ---- Printing ----
  // Remember the print settings on this device (the kitchen tablet or the counter PC)
  useEffect(() => {
    try {
      const savedWidth = Number(localStorage.getItem("delivery-print-width"));
      if (savedWidth === 58 || savedWidth === 80) setPaperWidth(savedWidth);
      setAutoPrint(localStorage.getItem("delivery-auto-print") === "1");
    } catch {
      /* storage blocked: keep the defaults */
    }
  }, []);

  const changePaperWidth = (width) => {
    setPaperWidth(width);
    try {
      localStorage.setItem("delivery-print-width", String(width));
    } catch {}
  };

  const changeAutoPrint = (value) => {
    setAutoPrint(value);
    try {
      localStorage.setItem("delivery-auto-print", value ? "1" : "0");
    } catch {}
  };

  // Show the ticket (it is only visible when printing), open the print dialog, then clear it
  const printOrder = (order, type) => setPrintJob({ order, type });

  useEffect(() => {
    if (!printJob) return;

    const clear = () => setPrintJob(null);
    window.addEventListener("afterprint", clear, { once: true });

    // Two frames, so the ticket is on the page before the browser takes its snapshot
    let frame2;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => window.print());
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
      window.removeEventListener("afterprint", clear);
    };
  }, [printJob]);

  // ---- Change an order's status ----
  const handleChangeStatus = async (order, status) => {
    let cancelReason;
    if (status === "CANCELLED") {
      const input = window.prompt(
        `Cancel order #${order.orderNumber}?\n\nReason (optional). Press Cancel to keep the order.`,
        "",
      );
      if (input === null) return;
      cancelReason = input.trim() || undefined;
    }

    setActionError("");
    setBusyIds((prev) => new Set(prev).add(order.id));

    try {
      const res = await request({
        method: "PATCH",
        url: `/delivery/admin/orders/${order.id}/status`,
        data: { status, cancelReason },
      });
      if (res?.data) {
        replaceOrder(res.data);
        // "Accept order" moves a new order to PREPARING: print its kitchen ticket right away
        if (autoPrint && status === "PREPARING")
          printOrder(res.data, "kitchen");
      }
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Could not update the order. Please try again.",
      );
      // The order may have been changed by someone else: reload the board
      if (err.response?.status === 409) refresh();
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(order.id);
        return next;
      });
    }
  };

  const connectionLost = failures >= 2;

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 px-3 sm:px-4 py-4">
      {/* The ticket that gets printed. Invisible on screen; added to <body> so printing shows only this. */}
      <PrintTicket job={printJob} paperWidth={paperWidth} />

      {/* ---------------- Header ---------------- */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Delivery Orders
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-sm font-bold text-white">
                <Bell size={14} aria-hidden="true" />
                {pendingCount} new
              </span>
            )}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span
              aria-hidden="true"
              className={`inline-block h-2 w-2 rounded-full ${
                connectionLost ? "bg-rose-500" : "bg-emerald-500"
              }`}
            />
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
              : "Loading..."}
            <span className="text-slate-300">·</span>
            checks every {POLL_MS / 1000} seconds
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sound.enabled ? (
            <>
              <button
                type="button"
                onClick={sound.disable}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <Volume2 size={16} aria-hidden="true" />
                Sound on
              </button>
              <button
                type="button"
                onClick={sound.beep}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Test sound
              </button>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={repeatAlert}
                  onChange={(e) => setRepeatAlert(e.target.checked)}
                  className="h-4 w-4 accent-amber-600"
                />
                Repeat until accepted
              </label>
            </>
          ) : null}

          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Refresh
          </button>

          {/* Printing settings */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5">
            <Printer size={15} className="text-slate-500" aria-hidden="true" />
            <label className="flex items-center gap-1.5 text-sm text-slate-600">
              <span className="sr-only sm:not-sr-only">Paper</span>
              <select
                value={paperWidth}
                onChange={(e) => changePaperWidth(Number(e.target.value))}
                className="rounded-md border border-slate-300 bg-slate-50 px-1.5 py-1 text-sm font-semibold text-slate-700"
              >
                <option value={80}>80 mm</option>
                <option value={58}>58 mm</option>
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={autoPrint}
                onChange={(e) => changeAutoPrint(e.target.checked)}
                className="h-4 w-4 accent-amber-600"
              />
              Print when accepted
            </label>
            <button
              type="button"
              onClick={() => printOrder(makeSampleOrder(), "full")}
              className="rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Test print
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Banners ---------------- */}
      {!sound.enabled && (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-amber-900">Sound alerts are off</p>
            <p className="text-sm text-amber-800">
              {sound.supported
                ? "Turn them on to hear a beep when a new order arrives. Browsers only allow sound after you tap this button once, so do it every time you open this page."
                : "This browser does not support sound alerts. Use Chrome, Edge or Safari."}
            </p>
          </div>
          {sound.supported && (
            <button
              type="button"
              onClick={sound.enable}
              className="shrink-0 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-700"
            >
              Turn on sound alerts
            </button>
          )}
        </div>
      )}

      {connectionLost && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 text-rose-900"
        >
          <WifiOff size={20} className="shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold">
            Connection problem. New orders may not appear or beep until the
            connection is back. Retrying automatically.
          </p>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-800"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            aria-label="Dismiss"
            className="shrink-0 text-rose-600 hover:text-rose-800"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ---------------- Tabs (small screens) ---------------- */}
      <div
        className="flex gap-1.5 overflow-x-auto md:hidden"
        role="tablist"
        aria-label="Order status"
      >
        {COLUMNS.map((col) => {
          const active = tab === col.id;
          return (
            <button
              key={col.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(col.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-amber-600 bg-amber-600 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {col.title}
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs font-bold ${
                  active
                    ? "bg-white text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {grouped[col.id].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---------------- Board ---------------- */}
      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">
          Loading orders...
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 md:items-start">
          {COLUMNS.map((col) => (
            <section
              key={col.id}
              aria-label={col.title}
              className={`${tab === col.id ? "block" : "hidden"} md:block rounded-2xl bg-slate-100/70 p-3`}
            >
              <h2 className="mb-3 hidden items-center justify-between px-1 text-sm font-bold uppercase tracking-wider text-slate-600 md:flex">
                {col.title}
                <span
                  className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold ${
                    col.id === "PENDING" && grouped.PENDING.length > 0
                      ? "bg-amber-500 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  {grouped[col.id].length}
                </span>
              </h2>

              <div className="space-y-3">
                {grouped[col.id].length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400">
                    {col.empty}
                  </p>
                ) : (
                  grouped[col.id].map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      now={now}
                      busy={busyIds.has(order.id)}
                      onChangeStatus={handleChangeStatus}
                      onPrint={printOrder}
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
