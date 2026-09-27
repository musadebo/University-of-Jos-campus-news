import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/hooks/useAuth";
import { CampusNav } from "@/components/campus/CampusNav";
import { CampusCursor } from "@/components/campus/CampusCursor";
import { SmoothScroll } from "@/components/campus/SmoothScroll";
import { SectionProgress } from "@/components/campus/SectionProgress";
import { Toaster } from "@/components/ui/sonner";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      { title: "Campus Events — Everything Happening at UNIJOS" },
      {
        name: "description",
        content:
          "Discover events, news, announcements and campus activities at the University of Jos. Register, track attendance and stay connected.",
      },
      { name: "author", content: "Campus Events · UNIJOS" },
      { name: "theme-color", content: "#19384C" },

      /* Open Graph — WhatsApp, Facebook, Telegram previews */
      { property: "og:type",        content: "website" },
      { property: "og:site_name",   content: "Campus Events" },
      { property: "og:title",       content: "Campus Events — Everything Happening at UNIJOS" },
      { property: "og:description", content: "Discover events, news and announcements at the University of Jos. Register for academic activities and track your attendance." },
      { property: "og:image",       content: "https://synapse-campus-news.vercel.app/og-image.jpg" },
      { property: "og:image:width",  content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt",    content: "Campus Events — University of Jos platform" },
      { property: "og:url",          content: "https://synapse-campus-news.vercel.app" },
      { property: "og:locale",       content: "en_NG" },

      /* Twitter / X card */
      { name: "twitter:card",        content: "summary_large_image" },
      { name: "twitter:title",       content: "Campus Events — Everything Happening at UNIJOS" },
      { name: "twitter:description", content: "Discover events, news and announcements at the University of Jos." },
      { name: "twitter:image",       content: "https://synapse-campus-news.vercel.app/og-image.jpg" },

      /* PWA */
      { name: "apple-mobile-web-app-capable",         content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title",            content: "Campus Events" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Manrope:wght@400;500;600;700&display=swap",
      },
      { rel: "icon",             href: "/favicon.ico",  type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/favicon.ico" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SmoothScroll />
        <CampusCursor />
        <CampusNav />
        <Outlet />
        <SectionProgress sections={[]} />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
