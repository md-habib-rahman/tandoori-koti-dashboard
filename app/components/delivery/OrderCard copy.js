"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bike,
  Clock,
  Loader2,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import { CAN_CANCEL, NEXT_ACTION, STATUS_STYLES } from "./deliveryStatus";
import PrintMenu from "./PrintMenu";
import DeliveryMediumCombobox from "./DeliveryMediumCombobox";

// Save as: src/components/admin/delivery/OrderCard.js

const money = (value) => `€${Number(value || 0).toFixed(2)}`;

function timeAgo(createdAt, now) {
  const minutes = Math.max(
    0,
    Math.floor((now - new Date(createdAt).getTime()) / 60000),
  );
  if (minutes < 1) return { text: "Just now", minutes };
  if (minutes < 60) return { text: `${minutes} min ago`, minutes };
  const hours = Math.floor(minutes / 60);
  return { text: `${hours} h ${minutes % 60} min ago`, minutes };
}

// order: a delivery order with its items. now: current time in ms (updates every 30 s in the parent)
//   mediums: names of riders and delivery services used before (for the dropdown)
export default function OrderCard({
  order,
  now,
  busy,
  onChangeStatus,
  onPrint,
  mediums = [],
}) {
  const style = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
  const next = NEXT_ACTION[order.status];
  const canCancel = CAN_CANCEL.includes(order.status);
  const isNew = order.status === "PENDING";

  // While an order is being prepared, staff choose who will deliver it
  const isPreparing = order.status === "PREPARING";
  const [medium, setMedium] = useState(order.deliveryMedium || "");
  const mediumMissing = isPreparing && medium.trim() === "";

  const waited = timeAgo(order.createdAt, now);
  // A new order that waits too long turns red so nobody misses it
  const waitColor = isNew
    ? waited.minutes >= 10
      ? "text-rose-600"
      : waited.minutes >= 5
        ? "text-amber-700"
        : "text-slate-500"
    : "text-slate-500";

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [order.deliveryAddress, order.postalCode].filter(Boolean).join(", "),
  )}`;

  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-xs ${
        isNew ? "border-amber-400 ring-2 ring-amber-300/60" : "border-slate-200"
      }`}
    >
      {/* Order number, time and status */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-slate-900 text-base leading-tight">
            #{order.orderNumber}
          </p>
          <p
            className={`mt-0.5 flex items-center gap-1 text-xs font-medium ${waitColor}`}
          >
            <Clock size={12} aria-hidden="true" />
            {waited.text}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${style.badge}`}
          >
            {style.label}
          </span>
          {onPrint && <PrintMenu order={order} onPrint={onPrint} />}
        </div>
      </header>

      {/* Customer */}
      <div className="mt-3 space-y-1.5 text-sm">
        <p className="font-semibold text-slate-900">{order.customerName}</p>
        <a
          href={`tel:${String(order.customerPhone).replace(/\s+/g, "")}`}
          className="flex items-center gap-2 text-amber-700 font-medium hover:underline"
        >
          <Phone size={14} aria-hidden="true" />
          {order.customerPhone}
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 text-slate-700 hover:text-amber-700"
        >
          <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {order.deliveryAddress}
            {order.postalCode ? `, ${order.postalCode}` : ""}
            <span className="ml-1 text-xs text-amber-700 underline">
              Open in Maps
            </span>
          </span>
        </a>
      </div>

      {/* Items */}
      <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
        {order.items?.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-md bg-slate-900 px-1 text-xs font-bold text-white">
              {item.quantity}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-slate-900 leading-tight">
                {item.dishNameEn}
              </span>
              {item.dishNameFi && item.dishNameFi !== item.dishNameEn && (
                <span className="block text-xs text-slate-500">
                  {item.dishNameFi}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* Customer note (allergies, door code...) */}
      {order.notes && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <AlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <span className="whitespace-pre-line">{order.notes}</span>
        </p>
      )}

      {order.status === "CANCELLED" && order.cancelReason && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          Cancelled: {order.cancelReason}
        </p>
      )}

      {/* Total and payment */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs font-semibold text-slate-500">
          {order.paymentMethod === "CASH_ON_DELIVERY"
            ? "Pay on delivery"
            : order.paymentMethod}
        </span>
        <span className="text-lg font-bold text-slate-900">
          {money(order.totalPrice)}
        </span>
      </div>

      {/* Who delivers: chosen while preparing, shown afterwards */}
      {isPreparing && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <DeliveryMediumCombobox
            label="Delivery by (rider or delivery service)"
            value={medium}
            onChange={setMedium}
            options={mediums}
            disabled={busy}
          />
        </div>
      )}
      {!isPreparing && order.deliveryMedium && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <Bike
            size={15}
            className="shrink-0 text-amber-700"
            aria-hidden="true"
          />
          <span>
            Delivery by{" "}
            <span className="font-semibold text-slate-900">
              {order.deliveryMedium}
            </span>
          </span>
        </p>
      )}

      {/* Actions */}
      {(next || canCancel) && (
        <div className="mt-3 flex items-center gap-2">
          {next && (
            <button
              type="button"
              onClick={() =>
                onChangeStatus(
                  order,
                  next.to,
                  next.to === "OUT_FOR_DELIVERY"
                    ? { deliveryMedium: medium.trim() }
                    : {},
                )
              }
              disabled={
                busy || (next.to === "OUT_FOR_DELIVERY" && mediumMissing)
              }
              title={
                next.to === "OUT_FOR_DELIVERY" && mediumMissing
                  ? "Choose who delivers this order first"
                  : undefined
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && (
                <Loader2
                  size={16}
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              {next.label}
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() => onChangeStatus(order, "CANCELLED")}
              disabled={busy}
              aria-label={`Cancel order ${order.orderNumber}`}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <XCircle size={16} aria-hidden="true" />
              <span className="hidden sm:inline">
                {isNew ? "Reject" : "Cancel"}
              </span>
            </button>
          )}
        </div>
      )}
    </article>
  );
}
