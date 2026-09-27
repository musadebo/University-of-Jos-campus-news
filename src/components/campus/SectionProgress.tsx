import { useEffect, useRef, useState } from "react";

/**
 * Scroll progress ring + back-to-top arrow.
 * - Shows after the user scrolls down > 120px
 * - Auto-hides 2 seconds after scrolling stops
 * - Ring shows scroll progress around the button
 */
export function SectionProgress({ sections: _sections }: { sections: string[] }) {
  const [progress, setProgress]   = useState(0);
  const [visible,  setVisible]    = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ticking   = useRef(false);

  useEffect(() => {
    const update = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const p   = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      setProgress(p);
      setVisible(window.scrollY > 120);

      // Reset the hide timer
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 2000);

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* SVG ring params */
  const size   = 44;
  const stroke = 2.5;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const dash   = circ * progress;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="pointer-events-auto fixed bottom-6 right-5 z-40 flex items-center justify-center transition-all duration-300"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "scale(1) translateY(0)" : "scale(0.8) translateY(8px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Progress ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(53,85,110,0.18)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(53,85,110,0.85)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.15s ease" }}
        />
      </svg>

      {/* Inner glass button */}
      <div
        className="relative flex h-9 w-9 items-center justify-center rounded-full"
        style={{
          background:     "rgba(255,255,255,0.72)",
          border:         "1px solid rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          boxShadow:      "0 4px 16px -4px rgba(25,56,76,0.25)",
        }}
      >
        {/* Arrow up */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M6 10V2M2 6l4-4 4 4"
            stroke="rgba(25,56,76,0.9)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}
