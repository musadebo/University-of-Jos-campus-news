import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import type { NewsRow } from "@/services/campus";
import { formatMonthYear } from "@/lib/campus-format";
import { GlassLink, SectionLabel } from "@/components/campus/primitives";
import { NewsCard } from "@/components/campus/cards";
import { ArrowIcon } from "@/components/icons";

export function NewsSection({ articles }: { articles: NewsRow[] }) {
  const root = useRef<HTMLElement>(null);
  const [featured, ...rest] = articles;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    if (!el || !featured) return;

    const ios: IntersectionObserver[] = [];

    const reveal = (node: HTMLElement, delay = 0, y = 28) => {
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

    const header = el.querySelector<HTMLElement>(".news-header");
    if (header) reveal(header, 0, 20);

    const hero = el.querySelector<HTMLElement>(".news-hero");
    if (hero) reveal(hero, 100, 40);

    el.querySelectorAll<HTMLElement>(".news-secondary").forEach((card, i) => reveal(card, 150 + i * 80, 32));

    return () => ios.forEach((o) => o.disconnect());
  }, [featured]);

  if (!featured) return null;

  return (
    <section ref={root} className="relative bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <div className="news-header flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>SECTION / 04 — CAMPUS REPORTING</SectionLabel>
            <h2 className="display-section mt-3 text-ink">
              Campus<br />News.
            </h2>
          </div>
          <GlassLink to="/news" variant="glass" withArrow className="w-full sm:w-auto">
            ALL STORIES
          </GlassLink>
        </div>

        {/* Featured article */}
        <div className="news-hero mt-14 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <Link to="/news/$slug" params={{ slug: featured.slug }} className="group block">
            <div className="overflow-hidden rounded-md border border-border">
              <img
                src={featured.image_url ?? "/images/campus-auditorium.jpg"}
                alt={featured.title}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
              />
            </div>
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-4">
              <SectionLabel className="text-steel">{featured.category} / 04</SectionLabel>
              <SectionLabel>{formatMonthYear(featured.published_at)}</SectionLabel>
              <SectionLabel>{featured.read_minutes} MIN READ</SectionLabel>
            </div>
            <h3 className="font-display mt-4 text-4xl font-bold uppercase leading-[0.92] tracking-tight text-ink sm:text-5xl">
              {featured.title}
            </h3>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {featured.excerpt}
            </p>
            <Link
              to="/news/$slug"
              params={{ slug: featured.slug }}
              className="label-sys group mt-7 inline-flex items-center gap-2 border-b border-deep pb-1 text-[0.625rem] text-deep"
            >
              READ THE STORY
              <ArrowIcon size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Secondary grid */}
        {rest.length > 0 && (
          <div className="mt-16 grid grid-cols-1 gap-8 border-t border-border pt-12 sm:grid-cols-2 lg:grid-cols-4">
            {rest.slice(0, 4).map((a, i) => (
              <div key={a.id} className={`news-secondary ${i % 2 === 1 ? "lg:mt-12" : ""}`}>
                <NewsCard article={a} size={i === 0 ? "md" : "sm"} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
