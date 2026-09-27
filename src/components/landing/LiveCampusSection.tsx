import { useEffect, useRef } from "react";
import type { AnnouncementRow, EventRow } from "@/services/campus";
import { formatEventTime, relativeTime } from "@/lib/campus-format";
import { SectionLabel, StatusChip } from "@/components/campus/primitives";
import { AnnouncementIcon, CampusEventsIcon, RegistrationIcon, ScheduleIcon } from "@/components/icons";

export function LiveCampusSection({
  events,
  announcements,
}: {
  events: EventRow[];
  announcements: AnnouncementRow[];
}) {
  const root = useRef<HTMLElement>(null);

  const strips = [
    ...events.slice(0, 3).map((e) => ({
      id: `e-${e.id}`,
      state: "UPCOMING" as const,
      Icon: CampusEventsIcon,
      title: e.title,
      detail: `${formatEventTime(e.starts_at)} · ${e.venue}`,
      time: relativeTime(e.created_at),
    })),
    ...announcements.slice(0, 3).map((a) => ({
      id: `a-${a.id}`,
      state: (a.priority === "URGENT" ? "LIVE" : "UPDATED") as "LIVE" | "UPDATED",
      Icon: AnnouncementIcon,
      title: a.title,
      detail: a.faculty ?? "ALL FACULTIES",
      time: relativeTime(a.publish_at),
    })),
    ...events.slice(3, 5).map((e) => ({
      id: `r-${e.id}`,
      state: "RECENT" as const,
      Icon: RegistrationIcon,
      title: `Registration open — ${e.title}`,
      detail: `${e.capacity} places`,
      time: relativeTime(e.created_at),
    })),
  ];

  /* IntersectionObserver reveal — no GSAP, no ScrollTrigger */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    if (!el) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>(".live-item"));
    const observers: IntersectionObserver[] = [];

    items.forEach((item, i) => {
      item.style.opacity   = "0";
      item.style.transform = `translateX(${i % 2 === 0 ? "-40px" : "40px"})`;
      item.style.transition = `opacity 0.6s ease ${i * 60}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`;

      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            item.style.opacity   = "1";
            item.style.transform = "none";
            io.disconnect();
          }
        },
        { threshold: 0, rootMargin: "0px 0px -40px 0px" },
      );
      io.observe(item);
      observers.push(io);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [strips.length]);

  return (
    <section ref={root} className="grid-lines relative border-y border-border bg-mist/50 py-16 sm:py-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">

        {/* Header */}
        <div className="live-item flex flex-wrap items-start justify-between gap-4">
          <div>
            <SectionLabel>SECTION / 05 — REAL TIME</SectionLabel>
            <h2 className="display-section mt-3 text-ink">Live campus.</h2>
          </div>
          {/* Status legend — wraps cleanly on mobile */}
          <div className="flex flex-wrap gap-2">
            {(["UPCOMING", "LIVE", "UPDATED", "RECENT"] as const).map((s) => (
              <StatusChip key={s} tone={s === "LIVE" ? "live" : "muted"}>{s}</StatusChip>
            ))}
          </div>
        </div>

        {/* Strips */}
        <div className="mt-8 grid gap-2">
          {strips.map((s) => (
            <div
              key={s.id}
              className="live-item glass rounded-md transition-colors hover:bg-white/70"
            >
              {/* Single responsive row — wraps to 2 lines on mobile */}
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">

                {/* Status + icon — always first, never wraps away */}
                <div className="flex shrink-0 items-center gap-3">
                  <StatusChip
                    tone={
                      s.state === "LIVE"    ? "live" :
                      s.state === "UPDATED" ? "open" : "muted"
                    }
                  >
                    {s.state}
                  </StatusChip>
                  <span className="text-deep">
                    <s.Icon size={18} />
                  </span>
                </div>

                {/* Title + detail — flex-1 so it takes remaining space and truncates */}
                <div className="min-w-0 flex-1">
                  <p className="font-display truncate text-sm font-bold uppercase leading-snug tracking-tight text-ink">
                    {s.title}
                  </p>
                  <p className="label-sys mt-0.5 truncate text-[0.5625rem] normal-case tracking-wide text-steel">
                    {s.detail}
                  </p>
                </div>

                {/* Time — shrinks to right edge */}
                <span className="label-sys flex shrink-0 items-center gap-1 text-[0.5625rem] text-steel">
                  <ScheduleIcon size={12} />
                  {s.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
