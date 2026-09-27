import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SectionLabel } from "./primitives";
import { CampusIcon } from "@/components/icons";
import authImage from "@/assets/campus-library.jpg";

export function AuthShell({
  label,
  title,
  intro,
  children,
  footer,
}: {
  label: string;
  title: ReactNode;
  intro: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={authImage} alt="University of Jos library building, Naraguta Campus" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.25_0.04_240/0.35),oklch(0.25_0.04_240/0.8))]" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Link to="/" className="label-sys flex items-center gap-2 text-white">
            <CampusIcon size={22} />
            CAMPUS EVENTS
          </Link>
          <div>
            <SectionLabel className="text-white/55">{label}</SectionLabel>
            <p className="display-section mt-4 text-white">{title}</p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">{intro}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-mist/50 px-5 py-24 sm:px-10">
        <div className="glass-strong w-full max-w-md rounded-xl p-7 sm:p-9">
          <div className="lg:hidden">
            <Link to="/" className="label-sys flex items-center gap-2 text-deep">
              <CampusIcon size={20} />
              CAMPUS EVENTS
            </Link>
          </div>
          <SectionLabel className="mt-6 lg:mt-0">{label}</SectionLabel>
          <h1 className="font-display mt-3 text-3xl font-bold uppercase leading-[0.92] tracking-[-0.04em] text-ink">
            {title}
          </h1>
          <div className="mt-8">{children}</div>
          <p className="mt-7 border-t border-border pt-5 text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  value,
  onChange,
  type = "text",
  error,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string | undefined;
  error?: string | undefined;
  autoComplete?: string | undefined;
}) {
  return (
    <label className="block">
      <SectionLabel className="text-steel">{label}</SectionLabel>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border border-border bg-white/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-deep"
      />
      {error && <span className="label-sys mt-1.5 block text-[0.5625rem] text-urgent">{error}</span>}
    </label>
  );
}

export function GoogleButton({
  onClick,
  label = "CONTINUE WITH GOOGLE",
  disabled = false,
}: {
  onClick: () => void | Promise<void>;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={disabled}
      className="label-sys flex w-full items-center justify-center gap-3 rounded-md border border-border bg-white/80 px-5 py-3 text-deep transition-colors hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.58 2.68-3.9 2.68-6.62Z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A8.99 8.99 0 0 0 9 18Z"
        />
        <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.97 7.3V4.96H.96a9 9 0 0 0 0 8.1l3.01-2.34Z" />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A8.99 8.99 0 0 0 .96 4.96l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
        />
      </svg>
      {label}
    </button>
  );
}
