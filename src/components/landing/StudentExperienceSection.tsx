import { useEffect, useRef } from "react";
import type { AnnouncementRow, EventRow } from "@/services/campus";
import { formatEventDate, formatEventTime } from "@/lib/campus-format";
import { GlassLink, SectionLabel, StatusChip } from "@/components/campus/primitives";
import {
  AttendanceIcon,
  CampusEventsIcon,
  CampusNewsIcon,
  NotificationIcon,
  RegistrationIcon,
  StudentIcon,
} from "@/components/icons";

export function StudentExperienceSection({
  events,
  announcements,
}: {
  events: EventRow[];
  announcements: AnnouncementRow[];
}) {
  const root = useRef<HTMLElement>(null);

  /* IntersectionObserver only — zero GSAP/ScrollTrigger, cannot freeze scroll */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    if (!el) return;

    const ios: IntersectionObserver[] = [];

    const reveal = (selector: string, opts: { delay?: number; y?: number; rotateX?: number } = {}) => {
      const { delay = 0, y = 32, rotateX = 0 } = opts;
      const nodes = Array.from(el.querySelectorAll<HTMLElement>(selector));
      nodes.forEach((node, i) => {
        const d = delay + i * 70;
        node.style.opacity   = "0";
        node.style.transform = rotateX
          ? `translateY(${y}px) rotateX(${rotateX}deg)`
          : `translateY(${y}px)`;
        node.style.transition = `opacity 0.7s ease ${d}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${d}ms`;
        if (rotateX) {
          node.style.transformOrigin = "top center";
          node.style.perspective     = "1200px";
        }

        const io = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              node.style.opacity   = "1";
              node.style.transform = "none";
              io.disconnect();
            }
          },
          { threshold: 0, rootMargin: "0px 0px -60px 0px" },
        );
        io.observe(node);
        ios.push(io);
      });
    };

    reveal(".stu-head",    { delay: 0, y: 24 });
    reveal(".dash-stage",  { delay: 120, y: 60, rotateX: 14 });
    reveal(".dash-widget", { delay: 280, y: 20 });

    return () => ios.forEach((o) => o.disconnect());
  }, []);

  const upcoming = events.slice(0, 3);

  return (
    <section
      ref={root}
      /*
        No position:sticky, no ScrollTrigger pin — uses only IntersectionObserver.
        overflow:visible so nothing clips. The bg-mist/60 + border-y gives it
        visual separation without any layout tricks that could trap scroll.
      */
      className="relative border-y border-border bg-mist/60 py-20 sm:py-28"
      style={{ isolation: "isolate" }}
    >
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">

        {/* Header */}
        <div className="stu-head flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>SECTION / 07 — STUDENT EXPERIENCE</SectionLabel>
            <h2 className="display-section mt-3 text-ink">
              Your campus,
              <br />
              docked.
            </h2>
          </div>
          <GlassLink
            to="/dashboard"
            variant="solid"
            withArrow
            className="w-full justify-center sm:w-auto sm:justify-start"
          >
            OPEN DASHBOARD
          </GlassLink>
        </div>

        {/* Dashboard mock */}
        <div
          className="dash-stage glass-strong mt-14 rounded-xl p-4 sm:p-6"
          style={{ perspective: "1200px" }}
        >
          {/* Top bar */}
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-deep">
                <StudentIcon size={20} />
              </span>
              <div>
                <SectionLabel>WELCOME BACK</SectionLabel>
                <p className="font-display text-base font-bold uppercase leading-tight tracking-tight text-ink sm:text-lg">
                  Amina O. / Faculty of Natural Sciences
                </p>
              </div>
            </div>
            <StatusChip tone="live">SESSION ACTIVE</StatusChip>
          </div>

          {/* Widgets grid */}
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* Upcoming Events */}
            <div className="dash-widget glass rounded-md p-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <SectionLabel className="flex items-center gap-2">
                  <CampusEventsIcon size={15} /> UPCOMING EVENTS
                </SectionLabel>
                <SectionLabel className="text-steel">{upcoming.length} EVENTS</SectionLabel>
              </div>
              <div className="mt-4 divide-y divide-border">
                {upcoming.length === 0 ? (
                  <p className="py-3 text-sm text-muted-foreground">No upcoming events.</p>
                ) : (
                  upcoming.map((e) => (
                    <div key={e.id} className="flex flex-wrap items-center gap-3 py-3">
                      <span className="label-sys w-14 shrink-0 text-[0.625rem] text-deep">
                        {formatEventDate(e.starts_at)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                        {e.title}
                      </span>
                      <span className="label-sys hidden text-[0.5625rem] text-steel sm:block">
                        {formatEventTime(e.starts_at)}
                      </span>
                      <StatusChip tone="open">OPEN</StatusChip>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Registrations + Attendance */}
            <div className="dash-widget glass rounded-md p-4">
              <SectionLabel className="flex items-center gap-2">
                <RegistrationIcon size={15} /> MY REGISTRATIONS
              </SectionLabel>
              <p className="font-display mt-4 text-6xl font-bold tabular-nums leading-none text-ink">
                04
              </p>
              <p className="mt-2 text-sm text-muted-foreground">2 this week · 2 later this month</p>
              <div className="mt-5 border-t border-border pt-4">
                <SectionLabel className="flex items-center gap-2">
                  <AttendanceIcon size={15} /> ATTENDANCE
                </SectionLabel>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-sm bg-mist">
                  <div className="h-full w-[86%] bg-deep" />
                </div>
                <p className="label-sys mt-2 text-[0.5625rem]">86% CHECK-IN RATE</p>
              </div>
            </div>

            {/* Notifications */}
            <div className="dash-widget glass rounded-md p-4">
              <SectionLabel className="flex items-center gap-2">
                <NotificationIcon size={15} /> NOTIFICATIONS
              </SectionLabel>
              <ul className="mt-4 space-y-3">
                {announcements.slice(0, 3).map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <i className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-deep" />
                    <span className="text-sm leading-snug text-ink">{a.title}</span>
                  </li>
                ))}
                {announcements.length === 0 && (
                  <li className="text-sm text-muted-foreground">No announcements yet.</li>
                )}
              </ul>
            </div>

            {/* Campus News */}
            <div className="dash-widget glass rounded-md p-4 lg:col-span-2">
              <SectionLabel className="flex items-center gap-2">
                <CampusNewsIcon size={15} /> CAMPUS NEWS
              </SectionLabel>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { title: "ANSEN 2026 Research Conference at UNIJOS", img: "/images/campus-auditorium.jpg" },
                  { title: "Bauchi Road Campus Library Upgrades",      img: "/images/campus-library.jpg" },
                ].map(({ title, img }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-sm border border-border bg-white/50 p-3"
                  >
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="h-12 w-16 shrink-0 rounded-sm object-cover"
                    />
                    <span className="font-display text-sm font-bold uppercase leading-tight tracking-tight text-ink">
                      {title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
