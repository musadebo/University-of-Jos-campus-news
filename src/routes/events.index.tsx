import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { listEvents } from "@/services/campus";
import { PageShell } from "@/components/campus/PageShell";
import { EventCard } from "@/components/campus/cards";
import { ScrollReveal, SectionLabel, StatusChip } from "@/components/campus/primitives";
import { SearchIcon } from "@/components/icons";

const TITLE = "Campus Events — UNIJOS Campus News";
const DESCRIPTION =
  "Browse every campus event: lectures, workshops, fairs, sport and culture. Filter by category and register instantly.";

const CATEGORIES = [
  "ALL",
  "TECH",
  "WORKSHOP",
  "RESEARCH",
  "CAREER",
  "ACADEMIC",
  "CULTURE",
  "SPORTS",
  "ALUMNI",
  "ADMISSIONS",
];

const searchSchema = z.object({
  q: z.string().optional().default(""),
  category: z.string().optional().default("ALL"),
  show: z.enum(["upcoming", "past", "all"]).optional().default("upcoming"),
});

export const Route = createFileRoute("/events/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { q, category, show } = Route.useSearch();
  const navigate = useNavigate({ from: "/events/" });

  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ["events", q, category],
    queryFn: () => listEvents({ search: q, category }),
  });

  const setSearch = (patch: { q?: string; category?: string; show?: string }) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const upcoming = allEvents.filter((e) => e.status === "published");
  const past = allEvents.filter((e) => e.status === "ended" || e.status === "cancelled");

  const displayed =
    show === "past" ? past : show === "all" ? allEvents : upcoming;

  return (
    <PageShell
      label="SECTION / EVENTS"
      title={
        <>
          What&apos;s on
          <br />
          campus.
        </>
      }
      intro="Every campus event across the faculties. Registration is instant and capacity is enforced."
      aside={
        <div className="flex items-center gap-2">
          <StatusChip tone="live">{upcoming.length} UPCOMING</StatusChip>
          <StatusChip tone="muted">{past.length} PAST</StatusChip>
        </div>
      }
    >
      <div className="glass rounded-lg p-4">
        {/* Search row */}
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <SearchIcon size={18} className="shrink-0 text-steel" />
          <input
            value={q}
            onChange={(e) => setSearch({ q: e.target.value })}
            placeholder="SEARCH EVENTS…"
            className="label-sys w-full bg-transparent text-[0.6875rem] text-ink outline-none placeholder:text-steel"
          />
        </div>

        {/* Upcoming / Past / All toggle */}
        <div className="mt-3 flex gap-1.5 border-b border-border pb-3">
          {(["upcoming", "past", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSearch({ show: tab })}
              className={`label-sys shrink-0 rounded-sm border px-3 py-2 text-[0.5625rem] uppercase transition-colors ${
                show === tab
                  ? "border-deep bg-deep text-white"
                  : "border-border bg-white/50 text-deep hover:bg-white"
              }`}
            >
              {tab === "upcoming" ? `Upcoming (${upcoming.length})` : tab === "past" ? `Past (${past.length})` : `All (${allEvents.length})`}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSearch({ category: c })}
              className={`label-sys shrink-0 rounded-sm border px-3 py-2 text-[0.5625rem] transition-colors ${
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white/50 text-deep hover:bg-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="label-sys mt-16 text-center">LOADING CAMPUS PROGRAMME…</p>
      ) : displayed.length === 0 ? (
        <div className="glass mt-10 rounded-lg p-10 text-center">
          <SectionLabel>NO MATCHES</SectionLabel>
          <p className="mt-3 text-sm text-muted-foreground">
            Nothing matches that filter yet. Try another category or tab.
          </p>
        </div>
      ) : (
        <>
          {show !== "past" && upcoming.length > 0 && show !== "all" && (
            <div className="mt-8 mb-4 flex items-center gap-3">
              <SectionLabel>UPCOMING EVENTS</SectionLabel>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}
          {show === "all" && (
            <div className="mt-8 mb-4 flex items-center gap-3">
              <SectionLabel>ALL EVENTS</SectionLabel>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}
          {show === "past" && (
            <div className="mt-8 mb-4 flex items-center gap-3">
              <SectionLabel>PAST EVENTS</SectionLabel>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map((event, i) => (
              <ScrollReveal key={event.id} delay={i * 55}>
                <EventCard event={event} className="h-full" />
              </ScrollReveal>
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
