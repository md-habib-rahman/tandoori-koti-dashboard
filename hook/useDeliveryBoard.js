"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApi } from "@/hook/useApi";

// Save as: src/hook/useDeliveryBoard.js
//
// Loads the delivery board and refreshes it every `intervalMs`. It also refreshes right away when the
// browser tab becomes visible again or the internet connection returns.
//
// Returns { orders, loading, failures, lastUpdated, refresh, replaceOrder }
//   failures      number of refreshes in a row that failed (0 = healthy)
//   replaceOrder  put an updated order (from a status change) into the list without waiting for the next refresh

export default function useDeliveryBoard({ intervalMs = 8000 } = {}) {
  const { request } = useApi();
  const requestRef = useRef(request); // keeps the polling effect from restarting if `request` changes identity
  requestRef.current = request;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failures, setFailures] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const mountedRef = useRef(true);
  const timerRef = useRef(null);
  const runIdRef = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const res = await requestRef.current({
        method: "GET",
        url: "/delivery/admin/board",
      });
      if (!mountedRef.current) return;
      setOrders(Array.isArray(res?.data) ? res.data : []);
      setFailures(0);
      setLastUpdated(new Date());
    } catch (err) {
      if (!mountedRef.current) return;
      console.error(
        "Failed to load delivery board:",
        err?.response?.data || err.message,
      );
      setFailures((n) => n + 1);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Each (re)start gets a new id, so an older loop stops scheduling itself
    const start = () => {
      const runId = ++runIdRef.current;
      clearTimeout(timerRef.current);

      const tick = async () => {
        await refresh();
        if (mountedRef.current && runIdRef.current === runId) {
          timerRef.current = setTimeout(tick, intervalMs);
        }
      };
      tick();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") start();
    };

    start();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);

    return () => {
      mountedRef.current = false;
      runIdRef.current += 1;
      clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
    };
  }, [refresh, intervalMs]);

  const replaceOrder = useCallback((updated) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }, []);

  return { orders, loading, failures, lastUpdated, refresh, replaceOrder };
}
