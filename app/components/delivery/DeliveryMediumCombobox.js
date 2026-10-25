"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

// Save as: src/components/admin/delivery/DeliveryMediumCombobox.js
//
// A text box with a list underneath. The list holds every rider or delivery service used before;
// typing filters it, and a name that is not in the list can simply be typed and chosen as new.
//
//   <DeliveryMediumCombobox value={medium} onChange={setMedium} options={["Ali", "Wolt"]} />
//
// Works with the keyboard: arrow keys move, Enter picks, Escape closes.

const MAX_LENGTH = 60;

export default function DeliveryMediumCombobox({
  value,
  onChange,
  options,
  disabled = false,
  label,
}) {
  const inputId = useId();
  const listId = useId();
  const rootRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const typed = value.trim();
  const query = typed.toLowerCase();
  const exact = options.some((o) => o.toLowerCase() === query);

  // When the box already holds a known name, show the whole list so another can be picked easily
  const shown =
    exact || !query
      ? options
      : options.filter((o) => o.toLowerCase().includes(query));
  const items = [
    ...shown.map((name) => ({ kind: "existing", name })),
    ...(typed && !exact ? [{ kind: "new", name: typed }] : []),
  ];

  // Close when clicking elsewhere
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const choose = (name) => {
    onChange(name);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      // Never submits anything: Enter only picks the highlighted entry
      e.preventDefault();
      if (open && active >= 0 && items[active]) choose(items[active].name);
      else setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <label
        htmlFor={inputId}
        className="mb-1 block text-xs font-semibold text-slate-600"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && active >= 0 ? `${listId}-${active}` : undefined
          }
          autoComplete="off"
          maxLength={MAX_LENGTH}
          disabled={disabled}
          value={value}
          placeholder="Type a name or pick from the list"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-9 pl-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          aria-label="Show the list"
          className="absolute top-1/2 right-1.5 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>

      {open && items.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {items.map((item, i) => (
            <li
              key={`${item.kind}-${item.name}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={item.name === value}
              // pointerdown runs before the input loses focus, so the click is not lost
              onPointerDown={(e) => {
                e.preventDefault();
                choose(item.name);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                i === active ? "bg-amber-50" : ""
              } ${item.kind === "new" ? "font-semibold text-amber-800" : "text-slate-800"}`}
            >
              {item.kind === "new" ? (
                <>
                  <Plus size={14} aria-hidden="true" />
                  Add &ldquo;{item.name}&rdquo; as new
                </>
              ) : (
                item.name
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
