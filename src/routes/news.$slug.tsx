import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNews, listNews } from "@/services/campus";
import { formatLongDate } from "@/lib/campus-format";
import { CampusFooter } from "@/components/campus/CampusFooter";
import { NewsCard } from "@/components/campus/cards";
import { GlassLink, ParallaxImage, SectionLabel } from "@/components/campus/primitives";
import { ArrowIcon } from "@/components/icons";

export const Route = createFileRoute("/news/$slug")({
  head: () => ({
    meta: [
      { title: "Story — Campus Events" },
      { name: "description", content: "Campus reporting from across UNIJOS — the University of Jos." },
      { property: "og:title",       content: "Story — Campus Events" },
      { property: "og:description", content: "Campus reporting from across UNIJOS — the University of Jos." },
      { property: "og:image",       content: "https://synapse-campus-news.vercel.app/og-image.jpg" },
      { property: "og:type",        content: "article" },
      { name: "twitter:card",       content: "summary_large_image" },
      { name: "twitter:title",      content: "Story — Campus Events" },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: article, isLoading } = useQuery({
    queryKey: ["news-item", slug],
    queryFn: () => getNews(slug),
  });
  const { data: more = [] } = useQuery({ queryKey: ["news", "", "ALL"], queryFn: () => listNews() });

  /* ── Dynamic page title + OG tags once article data loads ── */
  useEffect(() => {
    if (!article) return;
    const title = `${article.title} — Campus Events`;
    const desc = article.excerpt ?? article.body?.slice(0, 155) ?? "Campus reporting from UNIJOS.";
    document.title = title;
    const upsertMeta = (attr: "name" | "property", key: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", value);
    };
    upsertMeta("property", "og:title",            title);
    upsertMeta("property", "og:description",       desc);
    upsertMeta("property", "og:type",              "article");
    upsertMeta("name",     "description",          desc);
    upsertMeta("name",     "twitter:title",        title);
    upsertMeta("name",     "twitter:description",  desc);
    if (article.image_url) {
      upsertMeta("property", "og:image",       article.image_url);
      upsertMeta("name",     "twitter:image",  article.image_url);
    }
  }, [article]);

  if (isLoading) return <p className="label-sys pt-40 text-center">LOADING STORY…</p>;

  if (!article) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-40 text-center">
        <SectionLabel>NOT FOUND</SectionLabel>
        <h1 className="display-section mt-4 text-ink">Story unavailable.</h1>
        <GlassLink to="/news" variant="solid" withArrow className="mt-8">
          BACK TO NEWS
        </GlassLink>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-[1500px] px-5 pt-32 sm:px-8 sm:pt-40">
        <Link to="/news" className="label-sys flex items-center gap-2 text-[0.625rem] text-deep">
          <ArrowIcon size={14} className="rotate-180" />
          ALL STORIES
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <SectionLabel className="text-steel">{article.category} / 04</SectionLabel>
          <SectionLabel>{formatLongDate(article.published_at)}</SectionLabel>
          <SectionLabel>{article.read_minutes} MIN READ</SectionLabel>
        </div>
        <h1 className="display-section mt-5 max-w-5xl text-ink">{article.title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {article.excerpt}
        </p>
      </div>

      <ParallaxImage
        src={article.image_url ?? "/images/campus-auditorium.jpg"}
        alt={article.title}
        className="mx-auto mt-12 h-[52svh] min-h-[320px] max-w-[1500px] rounded-md border border-border px-0 sm:mt-14"
        speed={0.14}
      />

      <article className="mx-auto max-w-2xl px-5 py-14 sm:px-0">
        {article.body.split("\n\n").map((para, i) => (
          <p key={i} className="mb-6 text-base leading-[1.75] text-foreground/90">
            {para}
          </p>
        ))}
      </article>

      <section className="mx-auto max-w-[1500px] border-t border-border px-5 py-14 sm:px-8">
        <SectionLabel>MORE FROM CAMPUS</SectionLabel>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {more
            .filter((a) => a.slug !== article.slug)
            .slice(0, 3)
            .map((a) => (
              <NewsCard key={a.id} article={a} size="md" />
            ))}
        </div>
      </section>

      <CampusFooter />
    </div>
  );
}
