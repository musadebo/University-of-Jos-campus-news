/**
 * Build a Google Calendar "Add Event" URL pre-filled with event data.
 * Opens in a new tab — no OAuth required.
 *
 * Docs: https://calendar.google.com/calendar/r/eventedit?...
 */

function toGCalDate(iso: string): string {
  // Google Calendar uses: YYYYMMDDTHHmmssZ  (UTC)
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export interface CalendarEventInput {
  title: string;
  startsAt: string;  // ISO string
  endsAt?: string | null;
  venue?: string | null;
  description?: string | null;
  eventId?: string;  // used to build the event URL in description
}

export function buildGoogleCalendarUrl(event: CalendarEventInput): string {
  const start = toGCalDate(event.startsAt);

  // If no end time, default to 1 hour after start
  const endIso =
    event.endsAt ??
    new Date(new Date(event.startsAt).getTime() + 60 * 60 * 1000).toISOString();
  const end = toGCalDate(endIso);

  const appUrl =
    typeof window !== "undefined" ? window.location.origin : "https://campus-events.app";
  const eventUrl = event.eventId ? `${appUrl}/events/${event.eventId}` : appUrl;

  const details = [
    event.description ?? "",
    "",
    `View event: ${eventUrl}`,
    "Added via Campus Events",
  ]
    .join("\n")
    .trim();

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    ...(event.venue ? { location: event.venue } : {}),
    details,
  });

  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
}

export function addToGoogleCalendar(event: CalendarEventInput): void {
  const url = buildGoogleCalendarUrl(event);
  window.open(url, "_blank", "noopener,noreferrer");
}
