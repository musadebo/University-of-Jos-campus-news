import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { SectionLabel } from "@/components/campus/primitives";
import {
  AnnouncementIcon,
  ArrowIcon,
  CampusEventsIcon,
  CampusIcon,
  CampusNewsIcon,
} from "@/components/icons";

const SYSTEMS = [
  {
    n: "01",
    title: "EVENTS",
    to: "/events",
    Icon: CampusEventsIcon,
    text: "Inaugural lectures, seminars, workshops, and academic activities across UNIJOS faculties. Register and track attendance seamlessly.",
    image: "/images/campus-auditorium.jpg",
  },
  {
    n: "02",
    title: "NEWS",
    to: "/news",
    Icon: CampusNewsIcon,
    text: "Official University of Jos news, research achievements, academic announcements, and campus developments.",
    image: "/images/campus-hero.jpg",
  },
  {
    n: "03",
    title: "ANNOUNCEMENTS",
    to: "/announcements",
    Icon: AnnouncementIcon,
    text: "Faculty announcements, administrative notices, and urgent updates from UNIJOS management prioritized for student attention.",
    image: "/images/campus-library.jpg",
  },
  {
    n: "04",
    title: "STUDENT LIFE",
    to: "/events",
    Icon: CampusIcon,
    text: "Sports, cultural events, student activities, and everything that makes UNIJOS campus vibrant beyond academics.",
    image: "/images/campus-arena.jpg",
  },
];

export function DiscoverSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    if (!el) return;

    const ios: IntersectionObserver[] = [];

    const reveal = (node: HTMLElement, delay = 0, x = 0, y = 28) => {
      node.style.opacity    = "0";
      node.style.transform  = `translateX(${x}px) translateY(${y}px)`;
      node.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`;

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

    const header = el.querySelector<HTMLElement>(".discover-header");
    if (header) reveal(header, 0, 0, 20);

    el.querySelectorAll<HTMLElement>(".discover-row").forEach((row, i) => {
      reveal(row, 80 + i * 70, -32, 0);
    });

    return () => ios.forEach((o) => o.disconnect());
  }, []);

  return (
    <section ref={root} className="relative border-y border-border bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <div className="discover-header flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>DISCOVER UNIJOS.</SectionLabel>
            <h2 className="display-section mt-4 text-ink">
              One place.<br />Everything at UNIJOS.
            </h2>
          </div>
          <SectionLabel className="text-right">FOUR SYSTEMS / ONE PLATFORM</SectionLabel>
        </div>

        <div className="mt-14 border-t border-border">
          {SYSTEMS.map(({ n, title, text, Icon, to, image }) => (
            <Link
              key={n}
              to={to}
              className="discover-row group relative grid items-center gap-4 border-b border-border py-7 sm:grid-cols-[64px_56px_1fr_auto] sm:gap-8"
            >
              <span className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                <img src={image} alt="" loading="lazy"
                  className="h-full w-full scale-105 object-cover opacity-20 transition-transform duration-[1200ms] group-hover:scale-100" />
              </span>
              <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-deep transition-all duration-700 group-hover:w-full" />
              <span className="label-sys tabular-nums text-steel">{n}</span>
              <span className="text-deep transition-transform duration-500 group-hover:scale-110">
                <Icon size={40} />
              </span>
              <div className="transition-transform duration-500 group-hover:translate-x-1.5">
                <h3 className="font-display text-3xl font-bold uppercase leading-none tracking-tight text-ink sm:text-5xl">
                  {title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
              <ArrowIcon size={26} className="text-deep transition-transform duration-500 group-hover:translate-x-2" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
