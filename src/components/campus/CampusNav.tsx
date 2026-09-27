import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { listNotifications } from "@/services/campus";
import { ArrowIcon, NotificationIcon, SearchIcon, StudentIcon } from "@/components/icons";
import { SectionLabel } from "./primitives";

const PUBLIC_LINKS = [
  { to: "/events", label: "EVENTS" },
  { to: "/news", label: "NEWS" },
  { to: "/announcements", label: "ANNOUNCEMENTS" },
  { to: "/about", label: "ABOUT" },
] as const;

const AUTH_LINKS = [
  { to: "/events", label: "EVENTS" },
  { to: "/news", label: "NEWS" },
  { to: "/announcements", label: "ANNOUNCEMENTS" },
  { to: "/profile", label: "PROFILE" },
] as const;

export function CampusNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, profile, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const LINKS = user ? AUTH_LINKS : PUBLIC_LINKS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Publish nav height as a CSS variable so the hero can pad correctly */
  useEffect(() => {
    const nav = document.querySelector("header nav") as HTMLElement | null;
    if (!nav) return;
    const update = () => {
      const h = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => listNotifications(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("nav-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["notifications", user.id] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const unread = (notifications ?? []).filter((n) => !n.read).length;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    void navigate({ to: "/events", search: { q: term.trim(), category: "ALL" } });
    setSearchOpen(false);
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <nav
        className={cn(
          "pointer-events-auto mx-auto flex max-w-[1500px] items-center justify-between rounded-lg border transition-all duration-500",
          scrolled
            ? "border-[var(--glass-border)] bg-white/72 px-4 py-2.5 shadow-[var(--shadow-glass)] backdrop-blur-[30px] sm:px-6"
            : "border-white/40 bg-white/32 px-4 py-4 backdrop-blur-[18px] sm:px-6",
        )}
      >
        <Link to="/" className="group flex items-baseline gap-2" data-cursor="link">
          <span className="font-display text-[0.95rem] font-bold uppercase tracking-[-0.02em] text-ink">
            Campus Events
          </span>
          <span className="label-sys hidden text-[0.5625rem] text-steel sm:inline">/ 2026</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "label-sys relative px-3 py-2 text-[0.625rem] transition-colors hover:text-ink",
                scrolled ? "text-deep" : "text-ink" // Better visibility before scrolling
              )}
              activeProps={{ 
                className: scrolled ? "text-ink" : "text-ink font-semibold" 
              }}
            >
              {l.label}
              {pathname.startsWith(l.to) && (
                <i className={cn(
                  "absolute inset-x-3 -bottom-0.5 h-[2px]",
                  scrolled ? "bg-deep" : "bg-ink" // Better visibility for active indicator
                )} />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search campus"
            className={cn(
              "rounded-md p-2 transition-colors hover:bg-white/60",
              scrolled ? "text-deep" : "text-ink" // Better visibility before scrolling
            )}
          >
            <SearchIcon size={18} />
          </button>

          <Link
            to={user ? "/notifications" : "/login"}
            aria-label="Notifications"
            className={cn(
              "relative rounded-md p-2 transition-colors hover:bg-white/60",
              scrolled ? "text-deep" : "text-ink" // Better visibility before scrolling
            )}
          >
            <NotificationIcon size={18} />
            {unread > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-urgent px-1 text-[0.5625rem] font-semibold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link
                to="/dashboard"
                className="label-sys flex items-center gap-2 rounded-md border border-border bg-white/60 px-3 py-2 text-[0.625rem] text-deep transition-colors hover:bg-white"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "User"}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                ) : (
                  <StudentIcon size={15} />
                )}
                <span className="max-w-[9ch] truncate">
                  {profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "ACCOUNT"}
                </span>
              </Link>
              {(hasRole("organizer") || hasRole("admin")) && (
                <Link
                  to="/organizer"
                  className="label-sys rounded-md px-3 py-2 text-[0.625rem] text-deep hover:bg-white/60"
                >
                  ORGANIZER
                </Link>
              )}
              {hasRole("admin") && (
                <Link
                  to="/admin"
                  className="label-sys rounded-md border border-urgent/30 bg-urgent/10 px-3 py-2 text-[0.625rem] text-urgent hover:bg-urgent/20"
                >
                  ADMIN
                </Link>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="label-sys group hidden items-center gap-2 rounded-md border border-primary bg-primary px-4 py-2.5 text-[0.625rem] text-primary-foreground transition-colors hover:bg-deep sm:flex"
            >
              LOGIN
              <ArrowIcon size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="rounded-md p-2 text-deep lg:hidden"
          >
            <span className="flex h-4 w-5 flex-col justify-between">
              <i
                className={cn(
                  "h-[1.5px] w-full bg-current transition-transform duration-300",
                  menuOpen && "translate-y-[7px] rotate-45",
                )}
              />
              <i className={cn("h-[1.5px] w-full bg-current transition-opacity", menuOpen && "opacity-0")} />
              <i
                className={cn(
                  "h-[1.5px] w-full bg-current transition-transform duration-300",
                  menuOpen && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {searchOpen && (
        <form
          onSubmit={submitSearch}
          className="pointer-events-auto mx-auto mt-2 flex max-w-[1500px] items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-white/75 px-4 py-3 backdrop-blur-[26px]"
        >
          <SearchIcon size={18} className="text-steel" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="SEARCH EVENTS, NEWS, VENUES"
            className="label-sys w-full bg-transparent text-[0.6875rem] tracking-[0.16em] text-ink outline-none placeholder:text-steel"
          />
          <button type="submit" className="label-sys text-[0.625rem] text-deep">
            ENTER
          </button>
        </form>
      )}

      {menuOpen && (
        <div className="pointer-events-auto mx-auto mt-2 max-w-[1500px] rounded-lg border border-[var(--glass-border)] bg-white/80 p-4 backdrop-blur-[26px] lg:hidden">
          <SectionLabel className="mb-3">NAVIGATION</SectionLabel>
          <div className="flex flex-col divide-y divide-border">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="font-display flex items-center justify-between py-3 text-xl font-bold uppercase tracking-[-0.03em] text-ink"
              >
                {l.label}
                <ArrowIcon size={18} className="text-steel" />
              </Link>
            ))}
            <Link
              to={user ? "/dashboard" : "/login"}
              className="font-display flex items-center justify-between py-3 text-xl font-bold uppercase tracking-[-0.03em] text-ink"
            >
              {user ? "DASHBOARD" : "LOGIN"}
              <ArrowIcon size={18} className="text-steel" />
            </Link>
            {user && (hasRole("organizer") || hasRole("admin")) && (
              <Link
                to="/organizer"
                className="font-display flex items-center justify-between py-3 text-xl font-bold uppercase tracking-[-0.03em] text-ink"
              >
                ORGANIZER
                <ArrowIcon size={18} className="text-steel" />
              </Link>
            )}
            {user && hasRole("admin") && (
              <Link
                to="/admin"
                className="font-display flex items-center justify-between py-3 text-xl font-bold uppercase tracking-[-0.03em] text-urgent"
              >
                ADMIN PANEL
                <ArrowIcon size={18} className="text-urgent" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
