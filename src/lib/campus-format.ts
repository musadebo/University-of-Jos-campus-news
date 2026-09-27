export function formatEventDate(iso: string) {
  const d = new Date(iso);
  return d
    .toLocaleDateString("en-GB", { month: "short", day: "2-digit" })
    .toUpperCase()
    .replace(",", "");
}

export function formatEventTime(iso: string) {
  return new Date(iso)
    .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })
    .toUpperCase();
}

export function formatLongDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
}

export function formatMonthYear(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    .toUpperCase();
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins} MIN AGO`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} HR AGO`;
  return `${Math.round(hrs / 24)} D AGO`;
}

export function pad(n: number, len = 3) {
  return String(n).padStart(len, "0");
}
