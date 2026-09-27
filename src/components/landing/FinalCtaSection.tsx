import { useEffect, useRef } from "react";
import { GlassLink, MagneticButton, SectionLabel } from "@/components/campus/primitives";
import ctaImage from "@/assets/campus-aerial.jpg";

export function FinalCtaSection() {
  const root   = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    if (!el) return;

    /* Passive parallax on bg image */
    const onScroll = () => {
      const rect     = el.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height + window.innerHeight)));
      if (imgRef.current) {
        imgRef.current.style.transform = `translateY(${progress * -12}%)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    /* Panel reveal via IntersectionObserver */
    const panel = el.querySelector<HTMLElement>(".cta-panel");
    let io: IntersectionObserver | null = null;
    if (panel) {
      panel.style.opacity    = "0";
      panel.style.transform  = "translateY(40px)";
      panel.style.transition = "opacity 0.8s ease, transform 0.9s cubic-bezier(0.16,1,0.3,1)";
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            panel.style.opacity   = "1";
            panel.style.transform = "none";
            io!.disconnect();
          }
        },
        { threshold: 0, rootMargin: "0px 0px -60px 0px" },
      );
      io.observe(panel);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  return (
    <section ref={root} className="relative flex min-h-[90svh] items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          ref={imgRef}
          className="h-[115%] w-full will-change-transform"
          style={{ transformOrigin: "center top" }}
        >
          <img
            src={ctaImage}
            alt="University of Jos campus aerial"
            loading="lazy"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.9608_0.0119_223.52/0.45),oklch(0.25_0.04_240/0.55))]" />
      </div>

      <div className="mx-auto w-full max-w-[1500px] px-5 py-24 sm:px-8">
        <div className="cta-panel glass-strong glass-sheen max-w-3xl rounded-xl p-8 sm:p-12">
          <SectionLabel>SECTION / 09 — JOIN UNIJOS</SectionLabel>
          <h2 className="display-section mt-4 text-ink">
            Your UNIJOS.<br />One platform.
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Stay connected to everything happening at the University of Jos — academic events,
            campus events, faculty announcements and your attendance across Naraguta and Bauchi Road campuses.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <MagneticButton className="w-full sm:w-auto">
              <GlassLink to="/events" variant="solid" withArrow className="w-full justify-center sm:w-auto">
                EXPLORE UNIJOS
              </GlassLink>
            </MagneticButton>
            <MagneticButton className="w-full sm:w-auto">
              <GlassLink to="/register" variant="glass" withArrow className="w-full justify-center sm:w-auto">
                JOIN PLATFORM
              </GlassLink>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
