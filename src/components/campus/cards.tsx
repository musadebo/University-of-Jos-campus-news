import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { AnnouncementRow, EventRow, NewsRow } from "@/services/campus";
import { formatEventDate, formatEventTime, formatMonthYear, relativeTime } from "@/lib/campus-format";
import { ArrowIcon, LocationIcon } from "@/components/icons";
import { SectionLabel, StatusChip } from "./primitives";

export function EventCard({ event, className }: { event: EventRow; className?: string }) {
  const isEnded = event.status === "ended";
  const isCancelled = event.status === "cancelled";
  const isOpen = event.status === "published";

  const chipTone = isEnded ? "muted" : isCancelled ? "urgent" : "open";
  const chipLabel = isEnded ? "ENDED" : isCancelled ? "CANCELLED" : "REGISTRATION OPEN";

  return (
    <Link
      to="/events/$id"
      params={{ id: event.id }}
      data-cursor="view"
      className={cn(
        "group glass relative flex flex-col overflow-hidden rounded-lg transition-all duration-500 hover:-translate-y-1 hover:bg-white/70",
        isEnded && "opacity-75",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.image_url ?? "/images/campus-hero.jpg"}
          alt={event.title}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]",
            isEnded && "grayscale-[40%]",
          )}
        />
        {/* Dark overlay for ended events */}
        {isEnded && (
          <div className="absolute inset-0 bg-[#19384C]/30" />
        )}
        <div className="absolute left-3 top-3 rounded-sm border border-white/50 bg-white/75 px-2 py-1 backdrop-blur-md">
          <span className="label-sys text-[0.625rem] text-ink">{formatEventDate(event.starts_at)}</span>
        </div>
        <div className="absolute right-3 top-3">
          <StatusChip tone={chipTone}>{chipLabel}</StatusChip>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          <SectionLabel className="text-steel">{event.category}</SectionLabel>
          <span className="label-sys text-[0.625rem]">{formatEventTime(event.starts_at)}</span>
        </div>
        <h3 className="font-display mt-3 text-xl font-bold uppercase leading-[0.95] tracking-[-0.03em] text-ink">
          {event.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="label-sys flex items-center gap-2 text-[0.625rem] text-deep">
            <LocationIcon size={14} />
            {event.venue}
          </span>
          <ArrowIcon size={16} className="text-deep transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export function NewsCard({
  article,
  className,
  size = "md",
}: {
  article: NewsRow;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Link
      to="/news/$slug"
      params={{ slug: article.slug }}
      data-cursor="view"
      className={cn("group flex flex-col", className)}
    >
      <div className="relative overflow-hidden rounded-md border border-border">
        <img
          src={article.image_url ?? "/images/campus-library.jpg"}
          alt={article.title}
          loading="lazy"
          className={cn(
            "w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]",
            size === "lg" ? "aspect-[16/9]" : size === "md" ? "aspect-[4/3]" : "aspect-[3/2]",
          )}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <SectionLabel className="text-steel">
          {article.category} / {formatMonthYear(article.published_at)}
        </SectionLabel>
        <span className="label-sys text-[0.625rem]">{article.read_minutes} MIN READ</span>
      </div>
      <h3
        className={cn(
          "font-display mt-2 font-bold uppercase leading-[0.95] tracking-[-0.035em] text-ink transition-colors group-hover:text-deep",
          size === "lg" ? "text-3xl sm:text-5xl" : size === "md" ? "text-2xl" : "text-lg",
        )}
      >
        {article.title}
      </h3>
      {size !== "sm" && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
      )}
    </Link>
  );
}

export function AnnouncementItem({ item }: { item: AnnouncementRow }) {
  const tone = item.priority === "URGENT" ? "urgent" : item.priority === "IMPORTANT" ? "live" : "muted";
  return (
    <article className="glass group rounded-md p-4 transition-colors hover:bg-white/65">
      {/* Top row: priority + time */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip tone={tone}>{item.priority}</StatusChip>
        <span className="label-sys text-[0.625rem] text-steel">{relativeTime(item.publish_at)}</span>
        {item.faculty && (
          <span className="label-sys ml-auto truncate text-[0.5625rem] text-steel/70">
            {item.faculty}
          </span>
        )}
      </div>
      {/* Content */}
      <div className="mt-2.5 min-w-0">
        <h3 className="font-display text-sm font-bold uppercase tracking-[-0.02em] text-ink sm:text-base">
          {item.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
      </div>
    </article>
  );
}
