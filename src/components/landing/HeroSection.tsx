import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import type { EventRow } from "@/services/campus";
import { formatEventDate, formatEventTime } from "@/lib/campus-format";
import { SectionLabel, StatusChip } from "@/components/campus/primitives";
import { ArrowIcon, CalendarIcon, LocationIcon, ScheduleIcon } from "@/components/icons";
import heroImage from "@/assets/campus-hero.jpg";

const WORDS = ["EVERYTHING", "HAPPENING", "AT UNIJOS."];

export function HeroSection({ nextEvent }: { nextEvent?: EventRow | undefined }) {
  const root       = useRef<HTMLElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = Array.from(el.querySelectorAll<HTMLElement>(".hero-word"));
    const fades = Array.from(el.querySelectorAll<HTMLElement>(".hero-fade"));
    const panel = panelRef.current;

    words.forEach((w, i) => {
      w.style.opacity    = "0";
      w.style.transform  = "translateY(60%) skewY(2deg)";
      w.style.transition = `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${0.05 + i * 0.12}s, transform 0.95s cubic-bezier(0.16,1,0.3,1) ${0.05 + i * 0.12}s`;
    });
    fades.forEach((f, i) => {
      f.style.opacity    = "0";
      f.style.transform  = "translateY(16px)";
      f.style.transition = `opacity 0.6s ease ${0.5 + i * 0.08}s, transform 0.6s ease ${0.5 + i * 0.08}s`;
    });
    if (panel) {
      panel.style.opacity    = "0";
      panel.style.transform  = "translateY(20px)";
      panel.style.transition = "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s";
    }

    const raf = requestAnimationFrame(() => requestAnimationFrame(() => {
      words.forEach((w) => { w.style.opacity = "1"; w.style.transform = "none"; });
      fades.forEach((f) => { f.style.opacity = "1"; f.style.transform = "none"; });
      if (panel) { panel.style.opacity = "1"; panel.style.transform = "none"; }
    }));

    /* Passive parallax on bg only — content stays fixed so nothing clips */
    const onScroll = () => {
      const p = Math.min(1, window.scrollY / window.innerHeight);
      if (imgRef.current)     imgRef.current.style.transform   = `translateY(${p * -10}%) scale(${1 + p * 0.05})`;
      if (overlayRef.current) overlayRef.current.style.opacity = String(Math.min(1, 0.55 + p * 0.45));
      words.forEach((w, i) => { w.style.opacity = String(Math.max(0, 1 - p * (1.6 + i * 0.2))); });
      fades.forEach((f)      => { f.style.opacity = String(Math.max(0, 1 - p * 2.2)); });
      if (panel) panel.style.opacity = String(Math.max(0, 1 - p * 2.5));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <section
      ref={root}
      /*
        Layout strategy:
        - min-height: 100svh so the hero always fills the screen.
        - NO overflow:hidden — that was clipping the event panel on zoomed / small screens.
        - The background image is clipped by its own wrapper instead.
        - padding-top uses --nav-h CSS var (published by CampusNav) so content always
          starts exactly below the nav regardless of zoom level.
      */
      className="relative flex flex-col"
      style={{ minHeight: "100svh", paddingTop: "calc(var(--nav-h, 72px) + clamp(1rem,2.5vh,2rem))" }}
    >
      {/* ── Background — clipped independently so it never clips content ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div ref={imgRef} className="h-full w-full will-change-transform" style={{ transformOrigin: "center center" }}>
          <img src={heroImage} alt="University of Jos main campus"
            width={1920} height={1200} className="h-full w-full object-cover" fetchPriority="high" />
        </div>
        <div ref={overlayRef} className="absolute inset-0 will-change-[opacity]"
          style={{ background: "linear-gradient(180deg,rgba(14,25,44,0.82) 0%,rgba(14,25,44,0.06) 40%,rgba(8,18,32,0.95) 100%)" }} />
      </div>

      {/* ── Headline — grows to fill available space ── */}
      <div className="mx-auto w-full max-w-[1500px] flex-1 px-5 sm:px-8 flex flex-col justify-center">
        {/* Status row */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="live" className="border-white/40 bg-white/18 text-white">LIVE CAMPUS</StatusChip>
          <span className="label-sys text-white/55">UNIJOS EVENTS</span>
        </div>

        {/* Headline — fluid clamped font, never overflows at any zoom */}
        <h1 className="mt-3">
          {WORDS.map((w) => (
            <span key={w} className="block" style={{ overflow: "clip", lineHeight: 1, paddingBottom: "0.04em" }}>
              <span
                className="hero-word block text-white will-change-transform font-display font-bold uppercase"
                style={{
                  /* clamp: min 1.5rem, target 5.5vw, max 5.5rem — stays single-line on any zoom */
                  fontSize: "clamp(1.5rem, 5.5vw, 5.5rem)",
                  letterSpacing: "-0.045em",
                  transformOrigin: "bottom left",
                }}
              >
                {w}
              </span>
            </span>
          ))}
        </h1>
      </div>

      {/* ── Bottom row: copy + buttons LEFT, event panel RIGHT ── */}
      {/*
        This entire row is part of the normal document flow (no absolute positioning),
        so it can never be clipped or hidden below the fold.
      */}
      <div
        className="mx-auto w-full max-w-[1500px] px-5 sm:px-8"
        style={{ paddingBottom: "clamp(1.5rem, 4vh, 3rem)" }}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:gap-10 lg:items-end">

          {/* Left: paragraph + buttons */}
          <div>
            <p className="hero-fade max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              Discover events, news, announcements and student activities across UNIJOS in Jos, Plateau State.
            </p>
            <div className="hero-fade mt-4 flex flex-wrap gap-2.5">
              <Link to="/events"
                className="label-sys flex items-center gap-2 rounded-md bg-white px-6 py-3 text-[0.625rem] text-ink transition-all hover:bg-white/90 active:scale-[0.97]">
                EXPLORE CAMPUS <ArrowIcon size={13} className="text-ink" />
              </Link>
              <Link to="/events"
                className="label-sys flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-6 py-3 text-[0.625rem] text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-[0.97]">
                VIEW EVENTS <ArrowIcon size={13} />
              </Link>
            </div>
          </div>

          {/* Right: event panel — always fully visible, never clipped */}
          {nextEvent && (
            <div ref={panelRef} className="will-change-transform w-full lg:w-[272px] xl:w-[292px]">
              <EventPanel event={nextEvent} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Compact event panel — always fully visible ── */
function EventPanel({ event }: { event: EventRow }) {
  return (
    <div className="overflow-hidden rounded-lg"
      style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)",
               backdropFilter: "blur(22px) saturate(160%)", boxShadow: "0 20px 50px -14px rgba(0,0,0,0.55)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.11)", background: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" style={{ animation: "pulse-live 2.4s ease-in-out infinite" }} />
          <span className="label-sys text-[0.5rem] tracking-widest text-white/55">UPCOMING EVENT</span>
        </div>
        <StatusChip tone="open" className="border-white/25 bg-white/12 text-white">OPEN</StatusChip>
      </div>

      {/* Cover — only show when there's room; hide at small screen heights */}
      {event.image_url && (
        <div className="relative h-16 overflow-hidden sm:h-20" style={{ display: "var(--panel-img-display, block)" }}>
          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <span className="label-sys absolute bottom-1.5 left-3 rounded-sm px-1.5 py-0.5 text-[0.5rem] text-white"
            style={{ background: "rgba(0,0,0,0.38)", border: "1px solid rgba(255,255,255,0.18)" }}>
            {event.category}
          </span>
        </div>
      )}

      {/* Body */}
      <div className="p-3">
        {/* Title — 2 lines max */}
        <h3 className="font-display text-sm font-bold uppercase leading-[0.95] text-white line-clamp-2 sm:text-base"
          style={{ letterSpacing: "-0.03em" }}>
          {event.title}
        </h3>

        <div className="mt-2 space-y-1">
          <PanelRow icon={<CalendarIcon size={11} className="text-white/50 shrink-0" />} text={formatEventDate(event.starts_at)} />
          <PanelRow icon={<ScheduleIcon  size={11} className="text-white/50 shrink-0" />} text={formatEventTime(event.starts_at)} />
          <PanelRow icon={<LocationIcon  size={11} className="text-white/50 shrink-0" />} text={event.venue} />
        </div>

        <Link to="/events/$id" params={{ id: event.id }}
          className="label-sys group mt-3 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[0.625rem] text-white transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.26)" }}>
          REGISTER NOW
          <ArrowIcon size={12} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function PanelRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {icon}
      <span className="label-sys text-[0.5625rem] text-white/70 truncate min-w-0">{text}</span>
    </div>
  );
}
