// University of Jos Campus Events — SVG logo component
export function UniJosLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="University of Jos logo"
    >
      {/* Shield outline */}
      <path
        d="M50 4 L90 20 L90 55 C90 75 72 90 50 96 C28 90 10 75 10 55 L10 20 Z"
        fill="currentColor"
        opacity="0.12"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {/* Open book */}
      <path
        d="M30 45 L50 40 L50 68 L30 73 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M70 45 L50 40 L50 68 L70 73 Z"
        fill="currentColor"
        opacity="0.6"
      />
      <line x1="50" y1="40" x2="50" y2="68" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      {/* Torch above book */}
      <rect x="47" y="22" width="6" height="14" rx="1" fill="currentColor" opacity="0.85" />
      <ellipse cx="50" cy="20" rx="5" ry="7" fill="currentColor" opacity="0.7" />
      {/* Stars on either side */}
      <circle cx="28" cy="30" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="72" cy="30" r="2.5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
