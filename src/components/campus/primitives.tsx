import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ArrowIcon } from "@/components/icons";

/* -------- GlassPanel -------- */

export function GlassPanel({
  children,
  className,
  tone = "light",
  sheen = false,
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "strong" | "dark";
  sheen?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg",
        tone === "light" && "glass",
        tone === "strong" && "glass-strong",
        tone === "dark" && "glass-dark",
        sheen && "glass-sheen",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -------- Labels -------- */

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("label-sys block", className)}>{children}</span>;
}

export function SectionNumber({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("label-sys tabular-nums text-steel", className)}>{value}</span>
  );
}

export function StatusChip({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "open" | "live" | "urgent" | "muted";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label-sys inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[0.625rem]",
        tone === "default" && "border-border bg-white/60 text-deep",
        tone === "open" && "border-live/40 bg-live/10 text-[oklch(0.45_0.13_150)]",
        tone === "live" && "border-live/40 bg-live/10 text-[oklch(0.45_0.13_150)]",
        tone === "urgent" && "border-urgent/40 bg-urgent/10 text-urgent",
        tone === "muted" && "border-border bg-mist text-muted-foreground",
        className,
      )}
    >
      {tone === "live" && <i className="dot-live h-1.5 w-1.5 rounded-full bg-[oklch(0.55_0.15_150)]" />}
      {children}
    </span>
  );
}

/* -------- Buttons -------- */

type BtnProps = {
  children: ReactNode;
  variant?: "solid" | "glass" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  withArrow?: boolean;
};

const btnBase =
  "label-sys inline-flex items-center justify-center gap-2 rounded-md border transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50";

function btnClasses({
  variant = "solid",
  size = "md",
}: {
  variant?: BtnProps["variant"];
  size?: BtnProps["size"];
  children?: unknown;
}) {
  return cn(
    btnBase,
    size === "md" ? "px-5 py-3" : "px-3.5 py-2 text-[0.625rem]",
    variant === "solid" &&
      "border-primary bg-primary text-primary-foreground hover:bg-deep hover:shadow-[var(--shadow-panel)]",
    variant === "glass" && "glass border-[var(--glass-border)] text-deep hover:bg-white/70",
    variant === "ghost" && "border-transparent text-deep hover:border-border hover:bg-white/50",
    variant === "danger" && "border-urgent/50 bg-urgent/10 text-urgent hover:bg-urgent/20",
  );
}

export function GlassButton({
  children,
  className,
  withArrow,
  variant,
  size,
  ...rest
}: BtnProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(btnClasses({ children, variant, size }), "group/btn", className)}
    >
      <span>{children}</span>
      {withArrow && (
        <ArrowIcon size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
      )}
    </button>
  );
}

export function GlassLink({
  children,
  to,
  params,
  className,
  withArrow,
  variant,
  size,
}: BtnProps & { to: string; params?: Record<string, string> }) {
  return (
    <Link
      to={to}
      params={params as never}
      className={cn(btnClasses({ children, variant, size }), "group/btn", className)}
    >
      <span>{children}</span>
      {withArrow && (
        <ArrowIcon size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
      )}
    </Link>
  );
}

/* -------- MagneticButton -------- */

export function MagneticButton({
  children,
  className,
  strength = 14,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    };
    const onLeave = () => {
      el.style.transform = "translate(0,0)";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return (
    <span
      ref={ref}
      className={cn("inline-block w-full transition-transform duration-300 ease-out sm:w-auto", className)}
    >
      {children}
    </span>
  );
}

/* -------- ScrollReveal -------- */

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 28,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }
    // Set initial hidden state via style (no re-render needed)
    el.style.opacity = "0";
    el.style.transform = `translateY(${y}px) scale(0.985)`;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Direct DOM mutation — zero React re-renders
            el.style.opacity = "1";
            el.style.transform = "none";
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [y]);

  const Component = Tag as "div";
  return (
    <Component
      ref={ref}
      className={cn("transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
}

/* -------- ParallaxImage -------- */

export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  speed = 0.12,
  priority = false,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  speed?: number;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const i = img.current;
    if (!w || !i) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Skip parallax on touch devices — not visible and wastes battery
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let ticking = false;

    const update = () => {
      const rect = w.getBoundingClientRect();
      const viewH = window.innerHeight;
      // progress: 0 when bottom enters viewport, 1 when top exits
      const progress = 1 - (rect.bottom / (viewH + rect.height));
      const offset = (progress - 0.5) * speed * 100;
      i.style.transform = `translateY(${offset.toFixed(2)}%)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={wrap} className={cn("overflow-hidden", className)}>
      <img
        ref={img}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        className={cn("h-full w-full object-cover will-change-transform", imgClassName)}
        data-cursor="explore"
      />
    </div>
  );
}
