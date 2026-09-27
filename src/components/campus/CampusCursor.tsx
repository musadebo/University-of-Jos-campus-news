import { useEffect, useRef, useState } from "react";

type Mode = "default" | "link" | "view" | "explore";

const LABEL: Record<Mode, string> = {
  default: "",
  link: "",
  view: "VIEW",
  explore: "EXPLORE",
};

export function CampusCursor() {
  // Temporary disable for debugging - set to false to re-enable cursor
  const DISABLE_CURSOR = true;
  
  const dot = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (DISABLE_CURSOR) return; // Early return if disabled
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    
    setEnabled(true);
    document.body.dataset["campusCursor"] = "on";

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;
    let isActive = true;

    const loop = () => {
      if (!isActive) return;
      
      const diffX = x - cx;
      const diffY = y - cy;
      
      // Only update if there's significant movement to avoid unnecessary renders
      if (Math.abs(diffX) > 0.1 || Math.abs(diffY) > 0.1) {
        cx += diffX * 0.15; // Slightly reduced responsiveness for better performance
        cy += diffY * 0.15;
        
        if (dot.current) {
          dot.current.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
        }
      }
      
      raf = requestAnimationFrame(loop);
    };
    
    raf = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button, input, textarea, select",
      );
      const attr = el?.dataset["cursor"] as Mode | undefined;
      if (attr) setMode(attr);
      else if (el) setMode("link");
      else setMode("default");
    };

    // Throttle mouse move events to improve performance
    let moveTimeout: number;
    const throttledMove = (e: MouseEvent) => {
      if (moveTimeout) return;
      moveTimeout = window.setTimeout(() => {
        onMove(e);
        moveTimeout = 0;
      }, 16); // ~60fps
    };

    window.addEventListener("mousemove", throttledMove, { passive: true });
    
    // Pause animation when page is not visible
    const onVisibilityChange = () => {
      isActive = !document.hidden;
      if (isActive && !raf) {
        raf = requestAnimationFrame(loop);
      }
    };
    
    document.addEventListener("visibilitychange", onVisibilityChange);
    
    return () => {
      isActive = false;
      window.removeEventListener("mousemove", throttledMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (raf) cancelAnimationFrame(raf);
      if (moveTimeout) clearTimeout(moveTimeout);
      delete document.body.dataset["campusCursor"];
    };
  }, []);

  if (DISABLE_CURSOR || !enabled) return null;

  const size = mode === "default" ? 12 : mode === "link" ? 34 : 78;

  return (
    <div
      ref={dot}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden items-center justify-center rounded-full border border-deep/50 bg-white/25 backdrop-blur-[2px] transition-[width,height,background-color] duration-300 md:flex will-change-transform"
      style={{ width: size, height: size }}
    >
      <span className="label-sys text-[0.5rem] text-deep">{LABEL[mode]}</span>
    </div>
  );
}
