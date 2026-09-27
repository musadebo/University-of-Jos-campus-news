import { useEffect, useRef } from "react";
import { SectionLabel } from "@/components/campus/primitives";
import { AttendanceIcon, RegistrationIcon, SearchIcon } from "@/components/icons";

const STEPS = [
  { n: "01", title: "DISCOVER",  text: "Find events and campus news filtered by faculty, category and date.",        Icon: SearchIcon },
  { n: "02", title: "REGISTER",  text: "Reserve your place instantly. Capacity is enforced the moment you tap.",    Icon: RegistrationIcon },
  { n: "03", title: "ATTEND",    text: "Check in at the venue and your attendance is tracked automatically.",       Icon: AttendanceIcon },
];

export function HowItWorksSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    if (!el) return;

    const ios: IntersectionObserver[] = [];

    const reveal = (node: HTMLElement, delay = 0) => {
      node.style.opacity    = "0";
      node.style.transform  = "translateY(36px)";
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

    const header = el.querySelector<HTMLElement>(".hiw-header");
    if (header) reveal(header, 0);

    el.querySelectorAll<HTMLElement>(".step-card").forEach((card, i) => reveal(card, 100 + i * 120));

    return () => ios.forEach((o) => o.disconnect());
  }, []);

  return (
    <section ref={root} className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <div className="hiw-header">
          <SectionLabel>SECTION / 06 — HOW IT WORKS</SectionLabel>
          <h2 className="display-section mt-3 max-w-3xl text-ink">
            Three steps.<br />No paperwork.
          </h2>
        </div>

        <div className="relative mt-16">
          {/* Connector line — desktop only, static */}
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-border md:block" />

          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map(({ n, title, text, Icon }) => (
              <div key={n} className="step-card relative">
                <div className="flex items-center gap-4">
                  <span className="glass flex h-16 w-16 items-center justify-center rounded-md text-deep">
                    <Icon size={30} />
                  </span>
                  <span className="font-display text-5xl font-bold tabular-nums text-steel/40">{n}</span>
                </div>
                <h3 className="font-display mt-6 text-3xl font-bold uppercase tracking-tight text-ink">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
