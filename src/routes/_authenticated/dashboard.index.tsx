import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  listAnnouncements,
  listEvents,
  listNotifications,
  myRegistrations,
} from "@/services/campus";
import { useAuth } from "@/hooks/useAuth";
import {
  formatEventDate,
  formatEventTime,
  formatLongDate,
  relativeTime,
} from "@/lib/campus-format";
import { addToGoogleCalendar } from "@/lib/calendar";
import { PageShell } from "@/components/campus/PageShell";
import { GlassButton, GlassLink, SectionLabel, StatusChip } from "@/components/campus/primitives";
import { CalendarIcon, AttendanceIcon, NotificationIcon, RegistrationIcon, StudentIcon } from "@/components/icons";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [
      { title: "Your dashboard — Campus Events" },
      { name: "description", content: "Your registrations, attendance record and campus alerts." },
    ],
  }),
  component: Dashboard,
});

/* ─────────────────────────────────────────── */
function Dashboard() {
  const { user, profile, hasRole, refresh } = useAuth();
  const uid = user?.id;

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const { data: regs = [] } = useQuery({
    queryKey: ["my-registrations", uid],
    queryFn: () => myRegistrations(uid!),
    enabled: !!uid,
  });
  const { data: notes = [] } = useQuery({
    queryKey: ["notifications", uid],
    queryFn: () => listNotifications(uid!),
    enabled: !!uid,
  });
  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: listAnnouncements,
  });
  const { data: events = [] } = useQuery({
    queryKey: ["events", "", "ALL"],
    queryFn: () => listEvents(),
  });

  const active   = regs.filter((r) => r.status === "registered");
  const attended = active.filter((r) => r.checked_in_at).length;
  const rate     = active.length ? Math.round((attended / active.length) * 100) : 0;
  const unread   = notes.filter((n) => !n.read).length;

  /* Upcoming = registered, event hasn't started yet */
  const now = Date.now();
  const upcoming = active
    .filter((r) => r.events && new Date(r.events.starts_at).getTime() >= now)
    .sort((a, b) =>
      new Date(a.events!.starts_at).getTime() - new Date(b.events!.starts_at).getTime(),
    );

  /* Recommended = published events user hasn't registered for */
  const registeredIds = new Set(active.map((r) => r.event_id));
  const recommended = events.filter((e) => !registeredIds.has(e.id)).slice(0, 3);

  return (
    <PageShell
      label="DASHBOARD / OVERVIEW"
      title={
        <>
          {profile?.full_name?.split(" ")[0] ?? "Welcome"},
          <br />
          your campus.
        </>
      }
      intro={
        profile?.faculty
          ? `${profile.faculty}${profile.matric_no ? ` · ${profile.matric_no}` : ""}`
          : (user?.email ?? "")
      }
      aside={
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="live">ACTIVE</StatusChip>
          {hasRole("admin") && (
            <GlassLink to="/admin" variant="solid" size="sm" withArrow>
              ADMIN
            </GlassLink>
          )}
          {hasRole("organizer") && (
            <GlassLink to="/organizer" variant="glass" size="sm" withArrow>
              ORGANIZER
            </GlassLink>
          )}
        </div>
      }
    >
      {/* ── Profile card ── */}
      <div className="glass mb-8 rounded-lg p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || "User"}
              className="h-14 w-14 shrink-0 rounded-full border-2 border-white/50 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <StudentIcon size={22} className="text-primary" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="font-display truncate text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl">
              {profile?.full_name ||
                (user?.user_metadata?.["full_name"] as string | undefined) ||
                "Campus Student"}
            </h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{user?.email}</p>
            {profile?.faculty && (
              <p className="label-sys mt-1.5 text-[0.625rem] text-deep">
                {profile.faculty}
                {profile.matric_no ? ` · ${profile.matric_no}` : ""}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <GlassLink to="/profile" variant="ghost" size="sm" withArrow>
              EDIT PROFILE
            </GlassLink>
            {hasRole("admin") && (
              <GlassLink to="/admin" variant="solid" size="sm" withArrow>
                ADMIN PANEL
              </GlassLink>
            )}
            {hasRole("organizer") && !hasRole("admin") && (
              <GlassLink to="/organizer" variant="glass" size="sm" withArrow>
                ORGANIZER
              </GlassLink>
            )}
          </div>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <MetricCard
          label="REGISTERED"
          value={String(active.length).padStart(2, "0")}
          Icon={RegistrationIcon}
          sub={`${upcoming.length} upcoming`}
        />
        <MetricCard
          label="ATTENDANCE"
          value={`${rate}%`}
          Icon={AttendanceIcon}
          sub={`${attended} check-ins`}
        />
        <MetricCard
          label="ALERTS"
          value={String(unread).padStart(2, "0")}
          Icon={NotificationIcon}
          sub="unread"
          accent={unread > 0}
        />
      </div>

      {/* ── Main grid ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">

        {/* ── Left col ── */}
        <div className="flex min-w-0 flex-col gap-6">

          {/* Upcoming events */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel className="flex items-center gap-2">
                <CalendarIcon size={13} /> MY UPCOMING EVENTS
              </SectionLabel>
              <GlassLink to="/dashboard/events" variant="ghost" size="sm" withArrow>
                ALL EVENTS
              </GlassLink>
            </div>

            {upcoming.length === 0 ? (
              <div className="glass rounded-lg p-8 text-center">
                <CalendarIcon size={28} className="mx-auto text-steel opacity-40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No upcoming registrations yet.
                </p>
                <GlassLink to="/events" variant="solid" withArrow className="mt-5 inline-flex">
                  BROWSE EVENTS
                </GlassLink>
              </div>
            ) : (
              <div className="glass divide-y divide-border rounded-lg">
                {upcoming.slice(0, 6).map((r) => (
                  <UpcomingEventRow key={r.id} reg={r} />
                ))}
              </div>
            )}
          </section>

          {/* Recommended */}
          {recommended.length > 0 && (
            <section>
              <SectionLabel className="mb-4">RECOMMENDED FOR YOU</SectionLabel>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {recommended.map((e) => (
                  <Link
                    key={e.id}
                    to="/events/$id"
                    params={{ id: e.id }}
                    className="glass group block rounded-lg p-4 transition-all hover:bg-white/60"
                  >
                    {e.image_url && (
                      <div className="mb-3 h-24 w-full overflow-hidden rounded-md">
                        <img
                          src={e.image_url}
                          alt={e.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <StatusChip tone="muted" className="mb-2">{e.category}</StatusChip>
                    <p className="font-display text-sm font-bold uppercase leading-tight tracking-tight text-ink line-clamp-2">
                      {e.title}
                    </p>
                    <p className="label-sys mt-1.5 text-[0.5625rem] text-steel">
                      {formatEventDate(e.starts_at)} · {formatEventTime(e.starts_at)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right col ── */}
        <div className="flex min-w-0 flex-col gap-6">

          {/* Notifications */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <SectionLabel className="flex items-center gap-2">
                <NotificationIcon size={13} /> LATEST ALERTS
              </SectionLabel>
              <GlassLink to="/notifications" variant="ghost" size="sm" withArrow>
                ALL
              </GlassLink>
            </div>
            <div className="glass divide-y divide-border rounded-lg">
              {notes.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                notes.slice(0, 6).map((n) => (
                  <div key={n.id} className="flex gap-3 px-5 py-3.5">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        n.read ? "bg-border" : "bg-deep"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-ink line-clamp-2">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-1">
                          {n.body}
                        </p>
                      )}
                      <p className="label-sys mt-1 text-[0.5625rem] text-steel">
                        {relativeTime(n.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Announcements */}
          <section>
            <SectionLabel className="mb-4">CAMPUS ANNOUNCEMENTS</SectionLabel>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {announcements.slice(0, 5).map((a) => (
                  <AnnouncementCard key={a.id} item={a} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}

/* ── Upcoming event row with Google Calendar button ── */
function UpcomingEventRow({
  reg,
}: {
  reg: {
    id: string;
    event_id: string;
    checked_in_at: string | null;
    events: {
      title: string;
      starts_at: string;
      ends_at?: string | null;
      venue?: string | null;
      description?: string | null;
    } | null;
  };
}) {
  const ev = reg.events;
  if (!ev) return null;

  return (
    <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-3">
      {/* Date badge */}
      <div className="flex shrink-0 flex-col items-center justify-center rounded-md bg-primary/8 px-2.5 py-2 sm:w-12">
        <span className="font-display text-xl font-bold leading-none text-deep">
          {new Date(ev.starts_at).getDate()}
        </span>
        <span className="label-sys mt-0.5 text-[0.5rem] text-steel">
          {new Date(ev.starts_at).toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link
          to="/events/$id"
          params={{ id: reg.event_id }}
          className="font-display block truncate text-sm font-bold uppercase leading-snug tracking-tight text-ink hover:text-deep"
        >
          {ev.title}
        </Link>
        <p className="label-sys mt-0.5 text-[0.5625rem] text-steel">
          {formatEventTime(ev.starts_at)}
          {ev.venue ? ` · ${ev.venue}` : ""}
        </p>
      </div>

      {/* Status + Calendar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <StatusChip tone={reg.checked_in_at ? "live" : "open"}>
          {reg.checked_in_at ? "CHECKED IN" : "REGISTERED"}
        </StatusChip>
        <button
          aria-label="Add to Google Calendar"
          onClick={() =>
            addToGoogleCalendar({
              title: ev.title,
              startsAt: ev.starts_at,
              endsAt: ev.ends_at,
              venue: ev.venue,
              description: ev.description,
              eventId: reg.event_id,
            })
          }
          className="flex items-center gap-2 rounded-md border border-deep/30 bg-deep/8 px-3 py-2 transition-all hover:border-deep hover:bg-deep/15 active:scale-[0.97]"
        >
          <CalendarIcon size={13} className="shrink-0 text-deep" />
          <span className="label-sys text-[0.5625rem] font-semibold text-deep">ADD TO CALENDAR</span>
        </button>
      </div>
    </div>
  );
}

/* ── Announcement card ── */
function AnnouncementCard({
  item,
}: {
  item: {
    id: string;
    priority: string;
    title: string;
    body: string;
    faculty?: string | null;
    publish_at: string;
  };
}) {
  const tone =
    item.priority === "URGENT"
      ? "urgent"
      : item.priority === "IMPORTANT"
        ? "live"
        : "muted";
  return (
    <article className="glass rounded-md p-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip tone={tone as Parameters<typeof StatusChip>[0]["tone"]}>
          {item.priority}
        </StatusChip>
        <span className="label-sys text-[0.5625rem] text-steel">{relativeTime(item.publish_at)}</span>
        {item.faculty && (
          <span className="label-sys ml-auto truncate text-[0.5625rem] text-steel">
            {item.faculty}
          </span>
        )}
      </div>
      <h3 className="font-display mt-2 text-sm font-bold uppercase leading-snug tracking-tight text-ink">
        {item.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
    </article>
  );
}

/* ── Metric card ── */
function MetricCard({
  label,
  value,
  sub,
  Icon,
  accent = false,
}: {
  label: string;
  value: string;
  sub: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  accent?: boolean;
}) {
  return (
    <div className={`glass rounded-lg p-4 sm:p-5 ${accent ? "border-urgent/30" : ""}`}>
      <div className="flex items-center justify-between">
        <SectionLabel className="text-[0.5rem] sm:text-[0.5625rem]">{label}</SectionLabel>
        <Icon size={15} className={accent ? "text-urgent" : "text-deep"} />
      </div>
      <p
        className={`font-display mt-2 text-3xl font-bold tabular-nums leading-none sm:text-4xl ${
          accent ? "text-urgent" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
