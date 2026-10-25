// Save as: src/components/admin/delivery/deliveryStatus.js

export const STATUS_STYLES = {
  PENDING: { label: "New", badge: "bg-amber-100 text-amber-800 border-amber-300" },
  PREPARING: { label: "Preparing", badge: "bg-sky-100 text-sky-800 border-sky-300" },
  OUT_FOR_DELIVERY: { label: "On the way", badge: "bg-violet-100 text-violet-800 border-violet-300" },
  DELIVERED: { label: "Delivered", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  CANCELLED: { label: "Cancelled", badge: "bg-rose-100 text-rose-800 border-rose-300" },
};

// The one button that moves an order forward
export const NEXT_ACTION = {
  PENDING: { to: "PREPARING", label: "Accept order" },
  PREPARING: { to: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  OUT_FOR_DELIVERY: { to: "DELIVERED", label: "Mark delivered" },
};

// Statuses where the order can still be cancelled
export const CAN_CANCEL = ["PENDING", "PREPARING", "OUT_FOR_DELIVERY"];