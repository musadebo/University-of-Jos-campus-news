import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cancelRegistration,
  countRegistrations,
  getEvent,
  myRegistration,
  registerForEvent,
} from "@/services/campus";
import { useAuth } from "@/hooks/useAuth";
import { formatEventTime, formatLongDate } from "@/lib/campus-format";
import { addToGoogleCalendar } from "@/lib/calendar";
import { CampusFooter } from "@/components/campus/CampusFooter";
import {
  GlassButton,
  GlassLink,
  ParallaxImage,
  SectionLabel,
  StatusChip,
} from "@/components/campus/primitives";
import { ArrowIcon, CalendarIcon, LocationIcon, RegistrationIcon, ScheduleIcon } from "@/components/icons";

export const Route = createFileRoute("/events/$id")({
  head: () => ({
    meta: [
      { title: "Event Details — Campus Events" },
      { name: "description", content: "View event details, venue, timing and register your place on Campus Events at UNIJOS." },
      { property: "og:title",       content: "Event Details — Campus Events" },
      { property: "og:description", content: "View event details, venue, timing and register your place on Campus Events at UNIJOS." },
      { property: "og:image",       content: "https://synapse-campus-news.vercel.app/og-image.jpg" },
      { property: "og:type",        content: "article" },
      { name: "twitter:card",       content: "summary_large_image" },
      { name: "twitter:title",      content: "Event Details — Campus Events" },
    ],
  }),
  component: EventDetail,
});

function EventDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({ queryKey: ["event", id], queryFn: () => getEvent(id) });

  /* ── Dynamic page title + OG tags once event data loads ── */
  useEffect(() => {
    if (!event) return;
    const title = `${event.title} — Campus Events`;
    const desc = event.description
      ? event.description.slice(0, 155) + (event.description.length > 155 ? "…" : "")
      : `${event.category ?? "Event"} at UNIJOS`;
    document.title = title;
    const upsertMeta = (attr: "name" | "property", key: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", value);
    };
    upsertMeta("property", "og:title",        title);
    upsertMeta("property", "og:description",  desc);
    upsertMeta("name",     "description",     desc);
    upsertMeta("name",     "twitter:title",   title);
    upsertMeta("name",     "twitter:description", desc);
    if (event.image_url) {
      upsertMeta("property", "og:image",      event.image_url);
      upsertMeta("name",     "twitter:image", event.image_url);
    }
  }, [event]);
  const { data: taken = 0 } = useQuery({
    queryKey: ["event-count", id],
    queryFn: () => countRegistrations(id),
  });
  const { data: registration } = useQuery({
    queryKey: ["my-registration", id, user?.id],
    queryFn: () => myRegistration(id, user!.id),
    enabled: !!user,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["event-count", id] });
    void queryClient.invalidateQueries({ queryKey: ["my-registration", id, user?.id] });
    void queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
  };

  const register = useMutation({
    mutationFn: () => registerForEvent(id),
    onSuccess: () => {
      toast.success("You're registered!", {
        description: "Your place is confirmed. Add it to your calendar below.",
        duration: 5000,
      });
      invalidate();
    },
    onError: (e: Error) => toast.error("Registration failed", { description: e.message }),
  });

  const cancel = useMutation({
    mutationFn: () => cancelRegistration(id, user!.id),
    onSuccess: () => {
      toast.success("Registration cancelled");
      invalidate();
    },
    onError: (e: Error) => toast.error("Could not cancel", { description: e.message }),
  });

  if (isLoading) {
    return <p className="label-sys pt-40 text-center">LOADING EVENT…</p>;
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-40 text-center">
        <SectionLabel>NOT FOUND</SectionLabel>
        <h1 className="display-section mt-4 text-ink">Event unavailable.</h1>
        <GlassLink to="/events" variant="solid" withArrow className="mt-8">
          BACK TO EVENTS
        </GlassLink>
      </div>
    );
  }

  const isRegistered = registration?.status === "registered";
  const remaining = Math.max(0, event.capacity - taken);
  const full = remaining === 0;
  const cancelled = event.status === "cancelled";

  return (
    <div>
      <div className="relative h-[62svh] min-h-[420px] overflow-hidden">
        <ParallaxImage
          src={event.image_url ?? "/images/campus-hero.jpg"}
          alt={event.title}
          className="absolute inset-0"
          priority
          speed={0.18}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.25_0.04_240/0.55),oklch(0.9608_0.0119_223.52/0.92))]" />
        <div className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-end px-5 pb-10 sm:px-8">
          <Link to="/events" className="label-sys mb-6 flex items-center gap-2 text-[0.625rem] text-white/80">
            <ArrowIcon size={14} className="rotate-180" />
            ALL EVENTS
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <StatusChip tone="default" className="border-white/40 bg-white/25 text-white">
              {event.category}
            </StatusChip>
            <StatusChip tone={cancelled ? "urgent" : full ? "urgent" : "open"}>
              {cancelled ? "CANCELLED" : full ? "FULL" : "REGISTRATION OPEN"}
            </StatusChip>
          </div>
          <h1 className="display-section mt-4 max-w-4xl text-white">{event.title}</h1>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.5fr_1fr]">
        <article>
          <SectionLabel>ABOUT THIS EVENT</SectionLabel>
          <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {event.description}
          </p>

          <div className="mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-3">
            <Detail label="DATE" value={formatLongDate(event.starts_at)} Icon={CalendarIcon} />
            <Detail
              label="TIME"
              value={`${formatEventTime(event.starts_at)}${event.ends_at ? ` — ${formatEventTime(event.ends_at)}` : ""}`}
              Icon={ScheduleIcon}
            />
            <Detail label="VENUE" value={event.venue} Icon={LocationIcon} />
          </div>
        </article>

        <aside className="glass h-fit rounded-lg p-6 lg:sticky lg:top-28">
          <div className="flex items-center justify-between">
            <SectionLabel>REGISTRATION</SectionLabel>
            <RegistrationIcon size={20} className="text-deep" />
          </div>

          <p className="font-display mt-4 text-5xl font-bold tabular-nums leading-none text-ink">
            {taken}
            <span className="text-steel">/{event.capacity}</span>
          </p>
          <p className="label-sys mt-2 text-[0.5625rem]">
            {remaining} PLACES REMAINING
          </p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-sm bg-mist">
            <div
              className="h-full bg-deep transition-all duration-700"
              style={{ width: `${Math.min(100, (taken / Math.max(1, event.capacity)) * 100)}%` }}
            />
          </div>

          <div className="mt-6 border-t border-border pt-5">
            {!user ? (
              <>
                <p className="text-sm text-muted-foreground">Sign in to reserve your place.</p>
                <GlassLink to="/login" variant="solid" withArrow className="mt-4 w-full">
                  SIGN IN TO REGISTER
                </GlassLink>
              </>
            ) : cancelled ? (
              <p className="text-sm text-urgent">This event has been cancelled.</p>
            ) : isRegistered ? (
              /* ── REGISTERED STATE ── */
              <div className="space-y-3">
                {/* Confirmation badge */}
                <div className="flex items-center gap-3 rounded-md border border-live/30 bg-live/8 px-4 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-live/15">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                      <path d="M12.5 3.5L6 10 2.5 6.5" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" className="text-live" />
                    </svg>
                  </span>
                  <div>
                    <p className="label-sys text-[0.625rem] font-semibold text-live">YOU ARE REGISTERED</p>
                    {registration?.checked_in_at && (
                      <p className="label-sys mt-0.5 text-[0.5625rem] text-steel">✓ CHECKED IN</p>
                    )}
                  </div>
                </div>

                {/* ADD TO CALENDAR — full-width, prominent */}
                <button
                  type="button"
                  onClick={() =>
                    addToGoogleCalendar({
                      title: event.title,
                      startsAt: event.starts_at,
                      endsAt: event.ends_at,
                      venue: event.venue,
                      description: event.description,
                      eventId: event.id,
                    })
                  }
                  className="group flex w-full items-center justify-center gap-3 rounded-md border border-deep bg-deep px-5 py-3.5 transition-all hover:bg-deep/90 active:scale-[0.98]"
                >
                  {/* Calendar icon */}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"
                    className="shrink-0 text-white">
                    <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M2 7h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M6 1v4M12 1v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M6 11h2M10 11h2M6 13.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <span className="label-sys text-[0.6875rem] font-semibold tracking-wider text-white">
                    ADD TO CALENDAR
                  </span>
                  <ArrowIcon size={14} className="ml-auto text-white/60 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Event quick-info under calendar button */}
                <div className="rounded-md border border-border bg-white/40 px-4 py-3 text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-2">
                    <CalendarIcon size={12} className="text-deep shrink-0" />
                    {formatLongDate(event.starts_at)}
                  </p>
                  <p className="flex items-center gap-2">
                    <ScheduleIcon size={12} className="text-deep shrink-0" />
                    {formatEventTime(event.starts_at)}
                    {event.ends_at ? ` — ${formatEventTime(event.ends_at)}` : ""}
                  </p>
                  <p className="flex items-center gap-2">
                    <LocationIcon size={12} className="text-deep shrink-0" />
                    {event.venue}
                  </p>
                </div>

                {/* Secondary actions */}
                <GlassButton
                  variant="danger"
                  className="w-full"
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate()}
                >
                  {cancel.isPending ? "CANCELLING…" : "CANCEL REGISTRATION"}
                </GlassButton>
                <GlassLink to="/dashboard" variant="ghost" className="w-full">
                  VIEW MY EVENTS
                </GlassLink>
              </div>
            ) : (
              <GlassButton
                variant="solid"
                withArrow
                className="w-full"
                disabled={full || register.isPending}
                onClick={() => register.mutate()}
              >
                {full ? "EVENT FULL" : register.isPending ? "RESERVING…" : "REGISTER"}
              </GlassButton>
            )}
          </div>

          <button
            onClick={() => void navigate({ to: "/events" })}
            className="label-sys mt-5 text-[0.5625rem] text-steel hover:text-deep"
          >
            BROWSE OTHER EVENTS
          </button>
        </aside>
      </main>

      <CampusFooter />
    </div>
  );
}

function Detail({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div>
      <SectionLabel className="flex items-center gap-2">
        <Icon size={15} />
        {label}
      </SectionLabel>
      <p className="mt-2 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
