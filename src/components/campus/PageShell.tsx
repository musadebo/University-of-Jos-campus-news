import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CampusFooter } from "./CampusFooter";
import { SectionLabel } from "./primitives";

export function PageShell({
  label,
  title,
  intro,
  aside,
  children,
  className,
  footer = true,
}: {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: boolean;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="grid-lines relative border-b border-border bg-mist/60 pb-12 pt-32 sm:pt-40">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
          <SectionLabel>{label}</SectionLabel>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <h1 className="display-section max-w-4xl text-ink">{title}</h1>
            {aside}
          </div>
          {intro && (
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {intro}
            </p>
          )}
        </div>
      </div>

      <main className={cn("mx-auto w-full max-w-[1500px] overflow-x-hidden px-5 py-12 sm:px-8", className)}>
        {children}
      </main>

      {footer && <CampusFooter />}
    </div>
  );
}
