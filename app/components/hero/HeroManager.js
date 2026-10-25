"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hook/useApi";
import SlideEditor from "./SlideEditor";
import BandEditor from "./BandEditor";

export default function HeroManager() {
  const [data, setData] = useState(null);
  const { request, error } = useApi();
  const [tab, setTab] = useState(0); // 0..2 = slides, 3 = bottom band

  useEffect(() => {
    request({ url: "/admin/hero" })
      .then(setData)
      .catch(() => {});
  }, [request]);

  if (error)
    return (
      <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {error}
      </p>
    );
  if (!data) return <p className="text-sm text-gray-500">Loading hero…</p>;

  const tabs = [
    ...data.slides.map((s, i) => ({
      label: `Slide ${i + 1}`,
      badge: s.isActive ? null : "Hidden",
    })),
    { label: "Bottom band" },
  ];

  const replaceSlide = (updated) =>
    setData((d) => ({
      ...d,
      slides: d.slides.map((s) => (s.id === updated.id ? updated : s)),
    }));

  return (
    <div>
      <div
        role="tablist"
        aria-label="Hero sections"
        className="mb-6 flex flex-wrap gap-2 border-b border-gray-200"
      >
        {tabs.map((item, i) => (
          <button
            key={item.label}
            role="tab"
            type="button"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === i
                ? "border-amber-500 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {item.label}
            {item.badge && (
              <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab < data.slides.length ? (
          <SlideEditor
            key={data.slides[tab].id}
            slide={data.slides[tab]}
            onSaved={replaceSlide}
          />
        ) : (
          <BandEditor
            band={data.band}
            onSaved={(band) => setData((d) => ({ ...d, band }))}
          />
        )}
      </div>
    </div>
  );
}
