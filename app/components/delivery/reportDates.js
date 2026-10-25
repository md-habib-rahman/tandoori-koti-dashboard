// Save as: src/components/admin/delivery/reportDates.js
// Dates are "YYYY-MM-DD" strings in Finnish time. Weeks run Sunday to Saturday.

const TZ = "Europe/Helsinki";

export const todayIso = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());

export function addDays(iso, days) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function startOfWeek(iso) {
  const dayOfWeek = new Date(`${iso}T12:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(iso, -dayOfWeek);
}

const startOfMonth = (iso) => `${iso.slice(0, 7)}-01`;
const endOfMonth = (iso) => {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10); // day 0 of next month = last day of this one
};

export const PRESETS = [
  { id: "today", label: "Today", range: (t) => ({ from: t, to: t }) },
  {
    id: "yesterday",
    label: "Yesterday",
    range: (t) => ({ from: addDays(t, -1), to: addDays(t, -1) }),
  },
  {
    id: "thisWeek",
    label: "This week",
    range: (t) => ({ from: startOfWeek(t), to: addDays(startOfWeek(t), 6) }),
  },
  {
    id: "lastWeek",
    label: "Last week",
    range: (t) => ({
      from: addDays(startOfWeek(t), -7),
      to: addDays(startOfWeek(t), -1),
    }),
  },
  {
    id: "thisMonth",
    label: "This month",
    range: (t) => ({ from: startOfMonth(t), to: endOfMonth(t) }),
  },
  {
    id: "lastMonth",
    label: "Last month",
    range: (t) => {
      const lastDayPrev = addDays(startOfMonth(t), -1);
      return { from: startOfMonth(lastDayPrev), to: lastDayPrev };
    },
  },
];

// "11.10.2026"
export const formatDate = (iso) =>
  `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
