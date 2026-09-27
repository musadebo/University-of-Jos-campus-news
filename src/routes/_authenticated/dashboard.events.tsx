import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cancelRegistration, myRegistrations } from "@/services/campus";
import { useAuth } from "@/hooks/useAuth";
import { formatEventTime, formatLongDate } from "@/lib/campus-format";
import { addToGoogleCalendar } from "@/lib/calendar";
import { PageShell } from "@/components/campus/PageShell";
import { GlassButton, GlassLink, SectionLabel, StatusChip } from "@/components/campus/primitives";
import { CalendarIcon } from "@/components/icons";

const FILTERS = ["UPCOMING", "PAST", "CANCELLED"] as const;

export const Route = createFileRoute("/_authenticated/dashboard/events")({
  head: () => ({
    meta: [
      { title: "My events — Campus Events" },
      {
        name: "description",
        content: "Every event you have registered for, with attendance status.",
      },
    ],
  }),
  component: MyEvents,
});

function MyEvents() {
  const { user } = useAuth();
  const uid = user?.id;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("UPCOMING");

  const { data: regs = [], isLoading } = useQuery({
    queryKey: ["my-registrations", uid],
    queryFn: () => myRegistrations(uid!),
    enabled: !!uid,
  });

  const cancel = useMutation({
    mutationFn: (eventId: string) => cancelRegistration(eventId, uid!),
    onSuccess: () => {
      toast.success("Registration cancelled");
      void queryClient.invalidateQueries({ queryKey: ["my-registrations", uid] });
    },
    onError: (e: Error) => toast.error("Could not cancel", { description: e.message }),
  });

  const now = Date.now();
  const rows = regs.filter((r) => {
    const starts = r.events ? new Date(r.events.starts_at).getTime() : 0;
    if (filter === "CANCELLED") return r.status === "cancelled";
    if (filter === "PAST") return r.status === "registered" && starts < now;
    return r.status === "registered" && starts >= now;
  });

  /* Sort upcoming by nearest first, past by most recent */
  rows.sort((a, b) => {
    const aT = a.events ? new Date(a.events.starts_at).getTime() : 0;
    const bT = b.events ? new Date(b.events.starts_at).getTime() : 0;
    return filter === "PAST" ? bT - aT : aT - bT;
  });

  return (
    <PageShell
      label="DASHBOARD / MY EVENTS"
      title={
        <>
          My
          <br />
          registrations.
        </>
      }
      intro="Every event you have reserved a place for, with your check-in record."
      aside={
        <GlassLink to="/dashboard" variant="ghost" size="sm">
          BACK TO OVERVIEW
        </GlassLink>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`label-sys rounded-sm border px-4 py-2.5 text-[0.5625rem] transition-colors ${
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white/50 text-deep hover:bg-white"
            }`}
          >
            {f}
            {f === "UPCOMING" && (
              <span className="ml-1.5 opacity-60">
                ({regs.filter((r) => r.status === "registered" && r.events && new Date(r.events.starts_at).getTime() >= now).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="label-sys mt-16 text-center">LOADING YOUR EVENTS…</p>
      ) : rows.length === 0 ? (
        <div className="glass mt-8 rounded-lg p-10 text-center">
          <SectionLabel>NOTHING HERE</SectionLabel>
          <p className="mt-3 text-sm text-muted-foreground">No registrations in this view.</p>
          <GlassLink to="/events" variant="solid" withArrow className="mt-6">
            BROWSE EVENTS
          </GlassLink>
        </div>
      ) : (
        <div className="glass mt-6 divide-y divide-border rounded-lg">
          {rows.map((r) => {
            const ev = r.events;
            const isPast = ev ? new Date(ev.starts_at).getTime() < now : false;
            return (
              <div key={r.id} className="px-4 py-4 sm:px-5 sm:py-5">
                {/* Top row: info + status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <SectionLabel className="truncate text-[0.5625rem] text-steel">
                      {ev ? `${formatLongDate(ev.starts_at)} · ${formatEventTime(ev.starts_at)}` : "—"}
                    </SectionLabel>
                    <Link
                      to="/events/$id"
                      params={{ id: r.event_id }}
                      className="font-display mt-1.5 block text-base font-bold uppercase leading-tight tracking-tight text-ink hover:text-deep sm:text-lg"
                    >
                      {ev?.title ?? "Event"}
                    </Link>
                    {ev?.venue && (
                      <p className="label-sys mt-0.5 truncate text-[0.5625rem] text-steel">{ev.venue}</p>
                    )}
                  </div>
                  <StatusChip
                    tone={
                      r.status === "cancelled" ? "urgent"
                        : r.checked_in_at ? "live"
                        : isPast ? "muted"
                        : "open"
                    }
                    className="shrink-0"
                  >
                    {r.status === "cancelled" ? "CANCELLED"
                      : r.checked_in_at ? "CHECKED IN"
                      : isPast ? "PAST"
                      : "REGISTERED"}
                  </StatusChip>
                </div>

                {/* Actions: stack on mobile, row on desktop */}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {r.status === "registered" && ev && !isPast && (
                    <button
                      onClick={() =>
                        addToGoogleCalendar({
                          title: ev.title,
                          startsAt: ev.starts_at,
                          endsAt: (ev as { ends_at?: string | null }).ends_at,
                          venue: ev.venue,
                          description: (ev as { description?: string | null }).description,
                          eventId: r.event_id,
                        })
                      }
                      className="label-sys flex w-full items-center justify-center gap-2 rounded-md border border-deep/30 bg-deep/8 px-3 py-2.5 text-[0.5625rem] text-deep transition-all hover:border-deep hover:bg-deep/15 sm:w-auto"
                    >
                      <CalendarIcon size={13} className="shrink-0" />
                      ADD TO GOOGLE CALENDAR
                    </button>
                  )}
                  {r.status === "registered" && !isPast && (
                    <GlassButton
                      size="sm"
                      variant="danger"
                      disabled={cancel.isPending}
                      className="w-full justify-center sm:w-auto"
                      onClick={() => cancel.mutate(r.event_id)}
                    >
                      CANCEL REGISTRATION
                    </GlassButton>
                  )}
                  <Link
                    to="/events/$id"
                    params={{ id: r.event_id }}
                    className="label-sys flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-white/60 px-3 py-2.5 text-[0.5625rem] text-deep transition-all hover:bg-white sm:w-auto"
                  >
                    VIEW EVENT
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
