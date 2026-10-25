"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Save as: src/components/admin/delivery/PrintTicket.js
//
// A receipt-style ticket that is invisible on screen and is the ONLY thing that appears when the
// browser prints. It is added straight to <body>, and a print rule hides everything else on the page.
//
//   <PrintTicket job={{ order, type }} paperWidth={80} />      type: "kitchen" | "delivery" | "full"

const RESTAURANT_NAME = "Tandoori Koti";

// Printable width of the roll. Printers cannot print edge to edge, so this is a bit less than the paper.
const PAPER = {
  80: { width: "72mm", font: 12 },
  58: { width: "48mm", font: 11 },
};

const TITLES = {
  kitchen: "KITCHEN TICKET",
  delivery: "DELIVERY SLIP",
  full: "ORDER",
};

const money = (value) => `€${Number(value || 0).toFixed(2)}`;

const formatTime = (date) =>
  new Date(date).toLocaleString("fi-FI", {
    timeZone: "Europe/Helsinki",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

// A fake order for the "Test print" button
export function makeSampleOrder() {
  return {
    id: "sample",
    orderNumber: "TEST-0001",
    createdAt: new Date().toISOString(),
    customerName: "Test Customer",
    customerPhone: "+358 40 123 4567",
    deliveryAddress: "Testikatu 1 A 2",
    postalCode: "00100",
    notes: "No onions. Door code 1234.",
    paymentMethod: "CASH_ON_DELIVERY",
    totalPrice: 34.8,
    items: [
      {
        id: "1",
        quantity: 2,
        dishNameEn: "Butter Chicken",
        dishNameFi: "Voikana",
        unitPrice: 17.4,
      },
    ],
  };
}

function ticketCss(paperWidth) {
  const { width, font } = PAPER[paperWidth] || PAPER[80];
  const lg = Math.round(font * 1.35);
  const xl = Math.round(font * 2);

  return `
    .pos-print-root { display: none; }

    @media print {
      /* No "size:" rule on purpose: one value would make the page square.
         Set the paper size to your roll (80 mm or 58 mm) in the printer settings instead. */
      @page { margin: 0; }
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      body > *:not(.pos-print-root) { display: none !important; }
      .pos-print-root { display: block; }
    }

    .pos-ticket {
      width: ${width};
      margin: 0 auto;
      padding: 3mm 0 12mm;
      color: #000;
      background: #fff;
      font-family: "Courier New", ui-monospace, monospace;
      font-size: ${font}px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .pos-ticket .c { text-align: center; }
    .pos-ticket .b { font-weight: 700; }
    .pos-ticket .sm { font-size: ${font - 1}px; }
    .pos-ticket .lg { font-size: ${lg}px; }
    .pos-ticket .xl { font-size: ${xl}px; line-height: 1.15; }
    .pos-ticket .rule { border-top: 1px dashed #000; margin: 2.5mm 0; }
    .pos-ticket .row { display: flex; justify-content: space-between; gap: 2mm; }
    .pos-ticket .item { margin: 1.5mm 0; }
    .pos-ticket .notes {
      border: 1.5px solid #000;
      padding: 1.5mm;
      margin: 2mm 0;
      font-weight: 700;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .pos-ticket .wrap { word-break: break-word; }
  `;
}

export default function PrintTicket({ job, paperWidth = 80 }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const order = job?.order;
  const type = job?.type || "full";

  const showCustomer = type === "delivery" || type === "full"; // the driver needs the address
  const priced = type !== "kitchen"; // the kitchen does not need prices
  const bigItems = type !== "delivery";

  const collect = order?.paymentMethod === "CASH_ON_DELIVERY";

  return createPortal(
    <div className="pos-print-root" aria-hidden="true">
      <style>{ticketCss(paperWidth)}</style>

      {order && (
        <div className="pos-ticket">
          {/* Header */}
          <div className="c b lg">{RESTAURANT_NAME}</div>
          <div className="c">{TITLES[type]}</div>
          <div className="c b xl">#{order.orderNumber}</div>
          <div className="c sm">Ordered {formatTime(order.createdAt)}</div>

          <div className="rule" />

          {/* Customer and address */}
          {showCustomer && (
            <>
              <div className="b lg wrap">{order.customerName}</div>
              <div className="b">{order.customerPhone}</div>
              <div className="b lg wrap" style={{ marginTop: "1.5mm" }}>
                {order.deliveryAddress}
                {order.postalCode ? `, ${order.postalCode}` : ""}
              </div>
              <div className="rule" />
            </>
          )}

          {/* Items */}
          {order.items?.map((item) => (
            <div key={item.id} className="item">
              <div className={`row b ${bigItems ? "lg" : ""}`}>
                <span className="wrap">
                  {item.quantity} x {item.dishNameEn}
                </span>
                {priced && <span>{money(item.unitPrice * item.quantity)}</span>}
              </div>
              {item.dishNameFi && item.dishNameFi !== item.dishNameEn && (
                <div className="sm wrap">{item.dishNameFi}</div>
              )}
            </div>
          ))}

          {/* Customer note: allergies, door code... */}
          {order.notes && <div className="notes">NOTE: {order.notes}</div>}

          {/* Total and payment (delivery slip and full order) */}
          {showCustomer && (
            <>
              <div className="rule" />
              <div className="row b lg">
                <span>TOTAL</span>
                <span>{money(order.totalPrice)}</span>
              </div>
              <div className="c b" style={{ marginTop: "2mm" }}>
                {collect
                  ? `CASH ON DELIVERY - COLLECT ${money(order.totalPrice)}`
                  : order.paymentMethod}
              </div>
            </>
          )}

          <div className="rule" />
          <div className="c sm">Printed {formatTime(new Date())}</div>
        </div>
      )}
    </div>,
    document.body,
  );
}
