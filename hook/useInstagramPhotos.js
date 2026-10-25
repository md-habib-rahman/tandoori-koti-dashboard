"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// Save as: src/hooks/useInstagramPhotos.js
// Returns { photos, loading, error }. `photos` is in the order the staff chose (at most 6).

export default function useInstagramPhotos() {
  const [state, setState] = useState({
    photos: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
        const res = await axios.get(`${baseUrl}/instagram`);
        if (cancelled) return;
        setState({
          photos: Array.isArray(res.data?.data) ? res.data.data : [],
          loading: false,
          error: false,
        });
      } catch (err) {
        console.error(
          "Failed to load Instagram photos:",
          err?.response?.data || err.message,
        );
        if (!cancelled) setState({ photos: [], loading: false, error: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
