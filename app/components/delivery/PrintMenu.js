"use client";

import { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";

// Save as: src/components/admin/delivery/PrintMenu.js
// A printer button that opens a small menu: Kitchen ticket, Delivery slip, Full order.

const OPTIONS = [
  {
    type: "kitchen",
    label: "Kitchen ticket",
    hint: "Items and notes in large text, no prices",
  },
  {
    type: "delivery",
    label: "Delivery slip",
    hint: "Address, phone and the amount to collect",
  },
  { type: "full", label: "Full order", hint: "Everything on one slip" },
];

export default function PrintMenu({ order, onPrint }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Close when clicking elsewhere or pressing Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (type) => {
    setOpen(false);
    onPrint(order, type);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Print options for order ${order.orderNumber}`}
        className="grid h-7 w-7 place-items-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-amber-700"
      >
        <Printer size={15} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1.5 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {OPTIONS.map((option) => (
            <button
              key={option.type}
              type="button"
              role="menuitem"
              onClick={() => choose(option.type)}
              className="block w-full px-3.5 py-2.5 text-left transition-colors hover:bg-amber-50 focus:bg-amber-50 focus:outline-none"
            >
              <span className="block text-sm font-semibold text-slate-900">
                {option.label}
              </span>
              <span className="block text-xs text-slate-500">
                {option.hint}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
