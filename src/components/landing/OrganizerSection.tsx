import { useEffect, useRef, type ComponentType } from "react";
import { GlassLink, SectionLabel, StatusChip } from "@/components/campus/primitives";
import { useAuth } from "@/hooks/useAuth";
import {
  AnnouncementIcon,
  AttendanceIcon,
  CalendarIcon,
  LocationIcon,
  OrganizerIcon,
  RegistrationIcon,
  SecurityIcon,
} from "@/components/icons";

const CAPABILITIES = [
  { title: "CREATE EVENTS",        text: "Publish a full event record in under a minute.",  Icon: CalendarIcon },
  { title: "MANAGE REGISTRATIONS", text: "Live roster with capacity enforced server-side.", Icon: RegistrationIcon },
  { title: "TRACK ATTENDANCE",     text: "Check students in and watch the rate update.",    Icon: AttendanceIcon },
  { title: "SEND UPDATES",         text: "Time changes reach every registrant instantly.",  Icon: AnnouncementIcon },
];

export function OrganizerSection() {
  const root = useRef<HTMLElement>(null);
  const { hasRole, user } = useAuth();
  const isOrganizer = hasRole("organizer") || hasRole("admin");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    if (!el) return;

    const ios: IntersectionObserver[] = [];

    const reveal = (node: HTMLElement, delay = 0, y = 32) => {
      node.style.opacity    = "0";
      node.style.transform  = `translateY(${y}px)`;
      node.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`;

      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            node.style.opacity   = "1";
            node.style.transform = "none";
            io.disconnect();
          }
        },
        { threshold: 0, rootMargin: "0px 0px -48px 0px" },
      );
      io.observe(node);
      ios.push(io);
    };

    const header = el.querySelector<HTMLElement>(".org-header");
    if (header) reveal(header, 0, 20);

    el.querySelectorAll<HTMLElement>(".org-cap").forEach((cap, i) => reveal(cap, 80 + i * 80, 32));

    const console_ = el.querySelector<HTMLElement>(".org-console");
    if (console_) reveal(console_, 200, 48);

    return () => ios.forEach((o) => o.disconnect());
  }, []);

  return (
    <section ref={root} className="relative bg-primary py-20 text-white sm:py-28">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <div className="org-header">
          <SectionLabel className="text-white/55">SECTION / 08 — ORGANIZER SYSTEM</SectionLabel>
          <h2 className="display-section mt-3 max-w-4xl text-white">
            Built for campus<br />organizers.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map(({ title, text, Icon }) => (
            <div key={title} className="org-cap border-t border-white/20 pt-5">
              <span className="text-white/85"><Icon size={30} /></span>
              <h3 className="font-display mt-5 text-xl font-bold uppercase tracking-tight text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{text}</p>
            </div>
          ))}
        </div>

        {/* Console preview */}
        <div className="org-console glass-dark mt-16 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-white/15 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10">
                <OrganizerIcon size={20} />
              </span>
              <div>
                <SectionLabel className="text-white/55">ORGANIZER CONSOLE</SectionLabel>
                <p className="font-display text-lg font-bold uppercase tracking-tight text-white">New event</p>
              </div>
            </div>
            <StatusChip tone="live" className="border-white/25 bg-white/10 text-white">DRAFT AUTOSAVED</StatusChip>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="grid gap-3">
              <Field label="EVENT TITLE" value="Tech & Innovation Day" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="DATE" value="18 SEP 2026" Icon={CalendarIcon} />
                <Field label="TIME" value="10:00 AM" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="VENUE" value="MAIN AUDITORIUM" Icon={LocationIcon} />
                <Field label="CAPACITY" value="320" />
              </div>
              <Field label="CATEGORY" value="TECH" />
            </div>

            <div className="rounded-md border border-white/15 bg-white/5 p-4">
              <SectionLabel className="text-white/55">REGISTRATION ROSTER</SectionLabel>
              <div className="mt-4 space-y-2.5">
                {[
                  ["A. OKAFOR",  "CHECKED IN"],
                  ["D. MENSAH",  "REGISTERED"],
                  ["L. ADEYEMI", "CHECKED IN"],
                  ["S. IBRAHIM", "NOT CHECKED IN"],
                ].map(([name, state]) => (
                  <div key={name} className="flex items-center justify-between gap-3">
                    <span className="label-sys text-[0.625rem] text-white/85">{name}</span>
                    <StatusChip
                      tone={state === "CHECKED IN" ? "live" : "muted"}
                      className={state === "CHECKED IN" ? "border-white/25 bg-white/10 text-white" : "border-white/15 bg-transparent text-white/60"}
                    >
                      {state}
                    </StatusChip>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-white/15 pt-4">
                <SectionLabel className="flex items-center gap-2 text-white/55">
                  <SecurityIcon size={14} /> CAPACITY ENFORCED SERVER-SIDE
                </SectionLabel>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-white/15 pt-5 sm:flex-row sm:flex-wrap">
            {isOrganizer ? (
              <>
                <GlassLink to="/organizer/events/create" variant="glass" withArrow
                  className="w-full justify-center border-white/40 bg-white/15 text-white hover:bg-white/25 sm:w-auto sm:justify-start">
                  CREATE AN EVENT
                </GlassLink>
                <GlassLink to="/organizer" variant="ghost"
                  className="w-full justify-center text-white/80 hover:bg-white/10 sm:w-auto sm:justify-start">
                  OPEN CONSOLE
                </GlassLink>
              </>
            ) : (
              <GlassLink to={user ? "/dashboard" : "/register"} variant="glass" withArrow
                className="w-full justify-center border-white/40 bg-white/15 text-white hover:bg-white/25 sm:w-auto sm:justify-start">
                {user ? "GO TO DASHBOARD" : "JOIN THE PLATFORM"}
              </GlassLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, Icon }: { label: string; value: string; Icon?: ComponentType<{ size?: number }> }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/5 px-4 py-3">
      <SectionLabel className="text-white/50">{label}</SectionLabel>
      <p className="mt-1.5 flex items-center gap-2 text-sm font-medium text-white">
        {Icon && <Icon size={15} />}{value}
      </p>
    </div>
  );
}
