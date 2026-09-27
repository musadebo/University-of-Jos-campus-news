/**
 * UrlPreviewMeta
 * ─────────────────────────────────────────────────────────────────────────────
 * A reusable helper that returns a standardised set of Open Graph / Twitter
 * meta objects for use inside TanStack Router's `head()` function.
 *
 * Usage (inside a Route's head() option):
 *
 *   import { buildPreviewMeta } from "@/components/campus/UrlPreviewMeta";
 *
 *   export const Route = createFileRoute("/events/$id")({
 *     head: () => ({
 *       meta: buildPreviewMeta({
 *         title: "Tech Talk 2026 — Campus Events",
 *         description: "Annual technology symposium at UNIJOS Innovation Hall.",
 *         image: "https://example.com/event-cover.jpg",
 *         url: "https://synapse-campus-news.vercel.app/events/abc123",
 *         type: "article",
 *       }),
 *     }),
 *   });
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SITE_NAME    = "Campus Events";
const SITE_URL     = "https://synapse-campus-news.vercel.app";
const DEFAULT_IMG  = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESC =
  "Discover events, news and announcements at the University of Jos. Register for academic activities and track your attendance.";

export interface PreviewMetaOptions {
  /** Page title — will have the site name appended if not already present */
  title: string;
  /** Short description shown below the link title in previews */
  description?: string;
  /**
   * Absolute URL to a preview image (1200×630 recommended).
   * Falls back to the default OG image when omitted.
   */
  image?: string;
  /** Canonical URL of this page */
  url?: string;
  /** OG type. Defaults to "website". Use "article" for news/event pages. */
  type?: "website" | "article";
  /** Article section / category label (used when type === "article") */
  section?: string;
  /** ISO-8601 publish date (used when type === "article") */
  publishedTime?: string;
  /** ISO-8601 modified date (used when type === "article") */
  modifiedTime?: string;
}

type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

/**
 * Returns an array of meta tag objects compatible with TanStack Router's
 * `head()` → `meta[]` API.
 */
export function buildPreviewMeta(opts: PreviewMetaOptions): MetaTag[] {
  const {
    title,
    description = DEFAULT_DESC,
    image = DEFAULT_IMG,
    url,
    type = "website",
    section,
    publishedTime,
    modifiedTime,
  } = opts;

  // Append site name unless already present
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  // Twitter description limit is 200 chars
  const twitterDesc = description.length > 200 ? description.slice(0, 197) + "…" : description;

  const tags: MetaTag[] = [
    { title: fullTitle },
    { name: "description", content: description },

    /* ── Open Graph ── */
    { property: "og:type",        content: type },
    { property: "og:site_name",   content: SITE_NAME },
    { property: "og:title",       content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:image",       content: image },
    { property: "og:image:width",  content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt",    content: fullTitle },
    { property: "og:locale",       content: "en_NG" },
  ];

  if (url) {
    tags.push({ property: "og:url", content: url });
  }

  /* Article-specific tags */
  if (type === "article") {
    if (section)        tags.push({ property: "article:section",        content: section });
    if (publishedTime)  tags.push({ property: "article:published_time", content: publishedTime });
    if (modifiedTime)   tags.push({ property: "article:modified_time",  content: modifiedTime });
  }

  /* ── Twitter / X ── */
  tags.push(
    { name: "twitter:card",        content: "summary_large_image" },
    { name: "twitter:title",       content: fullTitle },
    { name: "twitter:description", content: twitterDesc },
    { name: "twitter:image",       content: image },
    { name: "twitter:image:alt",   content: fullTitle },
  );

  return tags;
}

/**
 * Convenience: build meta for an Event page.
 * Pass the raw event object once it is available; the function handles
 * missing fields gracefully.
 */
export function buildEventPreviewMeta(event: {
  title: string;
  description?: string | null;
  image_url?: string | null;
  starts_at: string;
  venue?: string | null;
  category?: string | null;
  id: string;
}): MetaTag[] {
  const date = new Date(event.starts_at).toLocaleDateString("en-NG", {
    day: "numeric", month: "long", year: "numeric",
  });
  const desc = event.description
    ? `${event.description.slice(0, 140)}…`
    : `${event.category ?? "Event"} · ${date}${event.venue ? ` · ${event.venue}` : ""}`;

  return buildPreviewMeta({
    title:      event.title,
    description: desc,
    image:      event.image_url ?? undefined,
    url:        `${SITE_URL}/events/${event.id}`,
    type:       "article",
    section:    event.category ?? "Event",
    publishedTime: event.starts_at,
  });
}

/**
 * Convenience: build meta for a News article page.
 */
export function buildNewsPreviewMeta(article: {
  title: string;
  summary?: string | null;
  body?: string | null;
  cover_url?: string | null;
  slug: string;
  created_at: string;
  updated_at?: string | null;
  category?: string | null;
}): MetaTag[] {
  const desc = article.summary
    ?? (article.body ? article.body.replace(/[#*`>]/g, "").slice(0, 160) + "…" : undefined);

  return buildPreviewMeta({
    title:        article.title,
    description:  desc,
    image:        article.cover_url ?? undefined,
    url:          `${SITE_URL}/news/${article.slug}`,
    type:         "article",
    section:      article.category ?? "News",
    publishedTime: article.created_at,
    modifiedTime:  article.updated_at ?? undefined,
  });
}
