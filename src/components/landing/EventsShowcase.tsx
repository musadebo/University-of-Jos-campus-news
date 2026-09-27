import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import type { EventRow } from "@/services/campus";
import { formatEventDate, formatEventTime } from "@/lib/campus-format";
import { GlassLink, SectionLabel, StatusChip } from "@/components/campus/primitives";
import { ArrowIcon, LocationIcon, ScheduleIcon } from "@/components/icons";

export function EventsShowcase({ events }: { events: EventRow[] }) {
  const headRef  = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /* ── IntersectionObserver reveal — zero GSAP/ScrollTrigger ── */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const headEl = headRef.current;
    const track  = trackRef.current;
    if (!headEl || !track) return;

    const observe = (el: HTMLElement, delay = 0) => {
      el.style.opacity    = "0";
      el.style.transform  = "translateY(36px)";
      el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`;

      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.style.opacity   = "1";
            el.style.transform = "none";
            io.disconnect();
          }
        },
        { threshold: 0, rootMargin: "0px 0px -60px 0px" },
      );
      io.observe(el);
      return io;
    };

    const observers: IntersectionObserver[] = [];
    observers.push(observe(headEl, 0));

    // Only animate the first 3 cards — rest appear instantly (they're off-screen anyway)
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".ev-card"));
    cards.slice(0, 3).forEach((c, i) => observers.push(observe(c, 100 + i * 110)));

    return () => observers.forEach((o) => o.disconnect());
  }, [events.length]);

  if (events.length === 0) {
    return (
      <section className="relative bg-[#19384C] py-20 text-white">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
          <SectionLabel className="text-white/50">SECTION / 03 — EVENTS</SectionLabel>
          <h2 className="display-section mt-3 text-white">What&apos;s on.</h2>
          <p className="mt-6 text-sm text-white/60">No events yet — check back soon.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#19384C] py-20 text-white">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        {/* Header */}
        <div ref={headRef} className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <SectionLabel className="text-white/50">SECTION / 03 — EVENTS</SectionLabel>
            <h2 className="display-section mt-3 text-white">What&apos;s on.</h2>
          </div>
          <GlassLink
            to="/events"
            variant="glass"
            withArrow
            className="w-full border-white/35 bg-white/12 text-white hover:bg-white/22 sm:w-auto"
          >
            ALL EVENTS
          </GlassLink>
        </div>

        {/* Scroll track
            touch-action: pan-x pan-y → allows BOTH axes so vertical scroll
            is never stolen on mobile.
            overscroll-behavior-x: contain → stops horizontal scroll from
            bubbling to page when the carousel hits its end.
            We remove the pan-x-only constraint that was trapping vertical scroll.
        */}
        <div
          className="mt-10 pb-4"
          style={{
            overflowX: "auto",
            overflowY: "visible",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x pan-y",
            overscrollBehaviorX: "contain",
          }}
        >
          <div
            ref={trackRef}
            className="flex gap-5"
            style={{ width: "max-content" }}
          >
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} total={events.length} />
            ))}
          </div>
        </div>

        <p className="label-sys mt-3 text-center text-white/30 sm:text-left">
          ← SWIPE TO SEE ALL {events.length} EVENTS →
        </p>
      </div>
    </section>
  );
}

/* ── Individual card ── */
function EventCard({
  event,
  index,
  total,
}: {
  event: EventRow;
  index: number;
  total: number;
}) {
  const isCancelled = event.status === "cancelled";

  return (
    <article
      className="ev-card group relative flex w-[88vw] shrink-0 flex-col overflow-hidden rounded-lg transition-transform duration-500 hover:-translate-y-1.5 sm:w-[440px] lg:w-[480px]"
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] shrink-0 overflow-hidden">
        <img
          src={event.image_url ?? "/images/campus-hero.jpg"}
          alt={event.title}
          loading={index < 2 ? "eager" : "lazy"}
          className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0e2236]/80 to-transparent" />

        {/* Top-left: category */}
        <span
          className="label-sys absolute left-4 top-4 rounded-sm border px-2 py-1 text-[0.5625rem] text-white backdrop-blur-sm"
          style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(0,0,0,0.28)" }}
        >
          {event.category}
        </span>

        {/* Top-right: counter */}
        <span className="label-sys absolute right-4 top-4 text-[0.5625rem] text-white/60">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>

        {/* Bottom: date badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div
            className="flex flex-col items-center justify-center rounded-md px-3 py-2"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
          >
            <span className="font-display text-2xl font-bold leading-none text-white">
              {new Date(event.starts_at).getDate()}
            </span>
            <span className="label-sys mt-0.5 text-[0.5rem] text-white/70">
              {new Date(event.starts_at)
                .toLocaleDateString("en-GB", { month: "short" })
                .toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="label-sys flex items-center gap-1.5 text-[0.5625rem] text-white/70">
            <ScheduleIcon size={13} />
            {formatEventTime(event.starts_at)}
          </span>
          <span className="label-sys flex items-center gap-1.5 text-[0.5625rem] text-white/70">
            <LocationIcon size={13} />
            {event.venue}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-display mt-4 flex-1 text-2xl font-bold uppercase leading-[0.92] text-white sm:text-3xl"
          style={{ letterSpacing: "-0.04em" }}
        >
          {event.title}
        </h3>

        {/* Description */}
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-white/60">
          {event.description}
        </p>

        {/* Footer */}
        <div
          className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          <StatusChip
            tone={isCancelled ? "urgent" : "open"}
            className="border-white/25 bg-white/12 text-white"
          >
            {isCancelled ? "CANCELLED" : "REGISTRATION OPEN"}
          </StatusChip>

          {!isCancelled && (
            <Link
              to="/events/$id"
              params={{ id: event.id }}
              className="label-sys group/btn flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-[0.625rem] text-white transition-all hover:bg-white/20 sm:w-auto"
              style={{ borderColor: "rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.1)" }}
            >
              REGISTER
              <ArrowIcon size={15} className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
