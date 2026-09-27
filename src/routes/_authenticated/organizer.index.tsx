import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { organizerEvents } from "@/services/campus";
import { useAuth } from "@/hooks/useAuth";
import { formatEventTime, formatLongDate } from "@/lib/campus-format";
import { PageShell } from "@/components/campus/PageShell";
import { GlassLink, SectionLabel, StatusChip } from "@/components/campus/primitives";

export const Route = createFileRoute("/_authenticated/organizer/")({
  head: () => ({
    meta: [
      { title: "Organizer console — Campus Events" },
      { name: "description", content: "Create events, manage registrations and track attendance." },
      { property: "og:title", content: "Organizer console — Campus Events" },
      {
        property: "og:description",
        content: "Create events, manage registrations and track attendance.",
      },
    ],
  }),
  component: OrganizerHome,
});

function OrganizerHome() {
  const { user, hasRole } = useAuth();
  const uid = user?.id;
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["organizer-events", uid],
    queryFn: () => organizerEvents(uid!),
    enabled: !!uid,
  });

  const allowed = hasRole("organizer") || hasRole("admin");

  return (
    <PageShell
      label="ORGANIZER / CONSOLE"
      title={
        <>
          Organizer
          <br />
          console.
        </>
      }
      intro="Publish events, watch your roster fill in real time and check students in on the day."
      aside={
        allowed ? (
          <GlassLink to="/organizer/events/create" variant="solid" withArrow>
            CREATE EVENT
          </GlassLink>
        ) : (
          <StatusChip tone="urgent">ORGANIZER ACCESS REQUIRED</StatusChip>
        )
      }
    >
      {!allowed && (
        <div className="glass mb-8 rounded-lg p-6">
          <SectionLabel>LIMITED ACCESS</SectionLabel>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account doesn&apos;t have organizer permissions yet, so creating events will be
            rejected. Ask a campus administrator to upgrade your account.
          </p>
        </div>
      )}

      {isLoading ? (
        <p className="label-sys text-center">LOADING YOUR EVENTS…</p>
      ) : events.length === 0 ? (
        <div className="glass rounded-lg p-10 text-center">
          <SectionLabel>NO EVENTS YET</SectionLabel>
          <p className="mt-3 text-sm text-muted-foreground">Your published events will appear here.</p>
        </div>
      ) : (
        <div className="glass divide-y divide-border rounded-lg">
          {events.map((e) => (
            <div key={e.id} className="px-4 py-4 sm:px-5 sm:py-5">
              {/* Top: title + status */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <SectionLabel className="truncate text-[0.5625rem] text-steel">
                    {formatLongDate(e.starts_at)} · {formatEventTime(e.starts_at)}
                  </SectionLabel>
                  <p className="label-sys mt-0.5 truncate text-[0.5rem] text-steel/70">{e.venue}</p>
                  <Link
                    to="/organizer/events/$id"
                    params={{ id: e.id }}
                    className="font-display mt-1.5 block text-base font-bold uppercase leading-tight tracking-[-0.03em] text-ink hover:text-deep sm:text-lg"
                  >
                    {e.title}
                  </Link>
                </div>
                <StatusChip tone={e.status === "cancelled" ? "urgent" : "open"} className="shrink-0">
                  {e.status.toUpperCase()}
                </StatusChip>
              </div>
              {/* Action */}
              <div className="mt-3">
                <GlassLink
                  to="/organizer/events/$id"
                  params={{ id: e.id }}
                  variant="ghost"
                  size="sm"
                  withArrow
                  className="w-full justify-center sm:w-auto sm:justify-start"
                >
                  MANAGE EVENT
                </GlassLink>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
