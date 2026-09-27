import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { listNews } from "@/services/campus";
import { PageShell } from "@/components/campus/PageShell";
import { NewsCard } from "@/components/campus/cards";
import { ScrollReveal, SectionLabel } from "@/components/campus/primitives";
import { SearchIcon } from "@/components/icons";

const TITLE = "Campus Events — Reporting from across the university";
const DESCRIPTION =
  "Read campus reporting on research, results, buildings and decisions across every faculty.";

const CATEGORIES = ["ALL", "CAMPUS", "ACADEMIC", "TECH", "SPORTS"];

export const Route = createFileRoute("/news/")({
  validateSearch: z.object({
    q: z.string().optional().default(""),
    category: z.string().optional().default("ALL"),
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { q, category } = Route.useSearch();
  const navigate = useNavigate({ from: "/news/" });
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["news", q, category],
    queryFn: () => listNews({ search: q, category }),
  });

  const [lead, ...rest] = articles;

  return (
    <PageShell
      label="SECTION / CAMPUS REPORTING"
      title={
        <>
          Campus
          <br />
          news.
        </>
      }
      intro="An editorial record of the university — research, results, infrastructure and the decisions behind them."
    >
      <div className="glass flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 border-border sm:border-r sm:pr-4">
          <SearchIcon size={18} className="text-steel" />
          <input
            value={q}
            onChange={(e) => void navigate({ search: (p) => ({ ...p, q: e.target.value }) })}
            placeholder="SEARCH STORIES"
            className="label-sys w-full bg-transparent text-[0.6875rem] text-ink outline-none placeholder:text-steel"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => void navigate({ search: (p) => ({ ...p, category: c }) })}
              className={`label-sys rounded-sm border px-3 py-2 text-[0.5625rem] transition-colors ${
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
        <p className="label-sys mt-16 text-center">LOADING STORIES…</p>
      ) : !lead ? (
        <div className="glass mt-10 rounded-lg p-10 text-center">
          <SectionLabel>NO STORIES</SectionLabel>
          <p className="mt-3 text-sm text-muted-foreground">Nothing published under that filter yet.</p>
        </div>
      ) : (
        <>
          <ScrollReveal className="mt-10 border-b border-border pb-12">
            <NewsCard article={lead} size="lg" />
          </ScrollReveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a, i) => (
              <ScrollReveal key={a.id} delay={i * 60} className={i % 3 === 1 ? "lg:mt-10" : ""}>
                <NewsCard article={a} size="md" />
              </ScrollReveal>
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
