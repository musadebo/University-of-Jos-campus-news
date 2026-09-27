import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouterState } from "@tanstack/react-router";

let registered = false;

export function useGsap() {
  if (typeof window !== "undefined" && !registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/* Single Lenis instance */
let lenisInstance: Lenis | null = null;

/* Pages that should NOT have smooth scroll — inner app pages */
const NO_SMOOTH_PATHS = [
  "/dashboard",
  "/admin",
  "/organizer",
  "/profile",
  "/notifications",
  "/events/",   // event detail
  "/news/",
];

function isSmoothPage(path: string) {
  // Only the landing page and top-level list pages get Lenis
  if (path === "/") return true;
  if (path === "/events") return true;
  if (path === "/news") return true;
  if (path === "/announcements") return true;
  if (path === "/about") return true;
  return false;
}

function destroyLenis() {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
  // Always make sure overflow is cleared when Lenis dies
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  document.body.style.height = "";
  document.documentElement.style.height = "";
}

export function SmoothScroll() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    // Kill all stale ScrollTrigger instances on every route change — prevents freeze
    ScrollTrigger.getAll().forEach((t) => t.kill());
    ScrollTrigger.clearScrollMemory?.();

    // Always reset overflow (stale pins can set overflow:hidden on body)
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    // Scroll to top
    window.scrollTo(0, 0);

    const smooth = isSmoothPage(pathname);

    if (smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Destroy previous before creating new
      destroyLenis();

      gsap.registerPlugin(ScrollTrigger);
      registered = true;

      const lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        wheelMultiplier: 0.85,
        touchMultiplier: 1.0,
        // prevent Lenis from swallowing horizontal scroll inside carousels
        gestureOrientation: "vertical",
      });

      lenisInstance = lenis;
      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const timer = setTimeout(() => ScrollTrigger.refresh(), 400);

      return () => {
        clearTimeout(timer);
        gsap.ticker.remove(tick);
        destroyLenis();
      };
    } else {
      // Non-smooth page — kill Lenis entirely, use native scroll
      destroyLenis();
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
