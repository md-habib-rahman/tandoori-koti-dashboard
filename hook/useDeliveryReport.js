"use client";

import { useEffect, useRef, useState } from "react";
import { useApi } from "@/hook/useApi";

// Save as: src/hook/useDeliveryReport.js
// Returns { data, loading, error }. Loads again whenever `from` or `to` changes.

// Change `reloadKey` (for example a counter) to load the same range again.
export default function useDeliveryReport(from, to, reloadKey = 0) {
  const { request } = useApi();
  const requestRef = useRef(request);
  requestRef.current = request;

  const [state, setState] = useState({ data: null, loading: true, error: "" });

  useEffect(() => {
    if (!from || !to || from > to) return;
    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true, error: "" }));

    (async () => {
      try {
        const res = await requestRef.current({
          method: "GET",
          url: `/delivery/admin/report?from=${from}&to=${to}`,
        });
        if (!cancelled)
          setState({ data: res?.data || null, loading: false, error: "" });
      } catch (err) {
        if (cancelled) return;
        setState({
          data: null,
          loading: false,
          error:
            err.response?.data?.message ||
            "Could not load the report. Please try again.",
        });
      }
    })();

    // A newer request (another range) makes this one's answer irrelevant
    return () => {
      cancelled = true;
    };
  }, [from, to, reloadKey]);

  return state;
}
