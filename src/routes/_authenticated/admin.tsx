import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import {
  adminAllEvents,
  adminAllRegistrations,
  adminGrantRole,
  adminListNews,
  adminListUsers,
  adminRevokeRole,
  adminStats,
  adminUpdateEventStatus,
  allAnnouncements,
  createAnnouncement,
  createNews,
  deleteAnnouncement,
  deleteNews,
  deleteEvent,
  toggleNewsPublished,
} from "@/services/campus";
import type { AppRole } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { formatEventDate, formatEventTime, formatLongDate, relativeTime } from "@/lib/campus-format";
import { PageShell } from "@/components/campus/PageShell";
import { AuthField } from "@/components/campus/AuthShell";
import { GlassButton, SectionLabel, StatusChip } from "@/components/campus/primitives";
import {
  AttendanceIcon,
  CampusEventsIcon,
  CampusNewsIcon,
  AnnouncementIcon,
  OrganizerIcon,
  NotificationIcon,
  RegistrationIcon,
  StudentIcon,
  SecurityIcon,
} from "@/components/icons";

/* ─── schemas ─────────────────────────────────────────────── */
const newsSchema = z.object({
  title: z.string().trim().min(6).max(200),
  excerpt: z.string().trim().min(10).max(400),
  body: z.string().trim().min(40).max(20000),
});
const announcementSchema = z.object({
  title: z.string().trim().min(6).max(200),
  body: z.string().trim().min(10).max(2000),
});

const CATEGORIES = ["CAMPUS", "ACADEMIC", "TECH", "SPORTS"];
const PRIORITIES = ["NORMAL", "IMPORTANT", "URGENT"];
const ALL_ROLES: AppRole[] = ["student", "organizer", "admin"];
const TABS = ["OVERVIEW", "USERS", "EVENTS", "CONTENT", "ANNOUNCEMENTS"] as const;
type Tab = (typeof TABS)[number];

/* ─── route ────────────────────────────────────────────────── */
export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Campus Events" },
      { name: "description", content: "Full administrative control of the Campus Events platform." },
    ],
  }),
  component: AdminPage,
});

/* ─── root page ─────────────────────────────────────────────── */
function AdminPage() {
  const { hasRole } = useAuth();
  const [tab, setTab] = useState<Tab>("OVERVIEW");

  if (!hasRole("admin")) {
    return (
      <PageShell
        label="ADMIN / ACCESS DENIED"
        title={<>Access<br />denied.</>}
        intro="Your account does not have administrator privileges."
        aside={<StatusChip tone="urgent">ADMIN REQUIRED</StatusChip>}
      >
        <div className="glass rounded-lg p-8 text-center">
          <SecurityIcon size={36} className="mx-auto text-deep" />
          <p className="mt-4 text-sm text-muted-foreground">
            Contact an existing admin to elevate your account.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      label="ADMIN / CONTROL PANEL"
      title={<>Admin<br />panel.</>}
      intro="Full platform oversight — users, roles, events, content and announcements."
      aside={<StatusChip tone="live">ADMIN ACCESS</StatusChip>}
    >
      {/* ── Tab bar — scrollable on mobile ── */}
      <div className="mb-8 border-b border-border pb-5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`label-sys flex shrink-0 items-center gap-2 rounded-md border px-4 py-2.5 text-[0.625rem] transition-all ${
                tab === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white/60 text-deep hover:bg-white"
              }`}
            >
              <TabIcon name={t} />
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "OVERVIEW"      && <OverviewTab />}
      {tab === "USERS"         && <UsersTab />}
      {tab === "EVENTS"        && <EventsTab />}
      {tab === "CONTENT"       && <ContentTab />}
      {tab === "ANNOUNCEMENTS" && <AnnouncementsTab />}
    </PageShell>
  );
}

function TabIcon({ name }: { name: Tab }) {
  const s = 13;
  if (name === "OVERVIEW")      return <OrganizerIcon size={s} />;
  if (name === "USERS")         return <StudentIcon size={s} />;
  if (name === "EVENTS")        return <CampusEventsIcon size={s} />;
  if (name === "CONTENT")       return <CampusNewsIcon size={s} />;
  if (name === "ANNOUNCEMENTS") return <AnnouncementIcon size={s} />;
  return null;
}

/* ─── OVERVIEW ──────────────────────────────────────────────── */
function OverviewTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminStats,
  });
  const { data: recentEvents = [] } = useQuery({
    queryKey: ["admin-events"],
    queryFn: adminAllEvents,
  });
  const { data: stories = [] } = useQuery({ queryKey: ["admin-news"], queryFn: adminListNews });
  const { data: notices = [] } = useQuery({ queryKey: ["admin-announcements"], queryFn: allAnnouncements });
  const { data: users = [] } = useQuery({ queryKey: ["admin-users"], queryFn: adminListUsers });

  if (isLoading) return <p className="label-sys text-center">LOADING OVERVIEW…</p>;

  const statCards = [
    { label: "TOTAL USERS",         value: stats?.total_users ?? 0,         Icon: StudentIcon,       note: "Registered accounts" },
    { label: "ACTIVE EVENTS",       value: stats?.published_events ?? 0,    Icon: CampusEventsIcon,  note: `${stats?.total_events ?? 0} total events` },
    { label: "REGISTRATIONS",       value: stats?.total_registrations ?? 0, Icon: RegistrationIcon,  note: "Active sign-ups" },
    { label: "PUBLISHED STORIES",   value: stats?.published_news ?? 0,      Icon: CampusNewsIcon,    note: `${stats?.total_news ?? 0} total stories` },
    { label: "ANNOUNCEMENTS",       value: stats?.total_announcements ?? 0, Icon: AnnouncementIcon,  note: "All-time broadcasts" },
  ];

  const admins   = users.filter((u) => u.roles.includes("admin"));
  const orgs     = users.filter((u) => u.roles.includes("organizer"));

  return (
    <div className="space-y-6">
      {/* ── Stat grid: 2-col mobile → 3-col md → 5-col lg ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map(({ label, value, Icon, note }) => (
          <div key={label} className="glass rounded-lg p-4">
            <div className="flex items-start justify-between gap-1">
              <SectionLabel className="text-[0.5rem] leading-snug sm:text-[0.5625rem]">{label}</SectionLabel>
              <Icon size={14} className="mt-0.5 shrink-0 text-deep" />
            </div>
            <p className="font-display mt-2 text-3xl font-bold tabular-nums leading-none text-ink sm:text-4xl">
              {String(value).padStart(2, "0")}
            </p>
            <p className="mt-1.5 text-[0.6875rem] text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>

      {/* ── Role breakdown + Recent events: stack on mobile ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Role breakdown */}
        <div className="glass rounded-lg p-5">
          <SectionLabel className="flex items-center gap-2">
            <SecurityIcon size={13} /> ROLE BREAKDOWN
          </SectionLabel>
          <div className="mt-4 divide-y divide-border">
            {[
              { role: "ADMIN",     count: admins.length, tone: "urgent" as const },
              { role: "ORGANIZER", count: orgs.length,   tone: "open" as const },
              { role: "STUDENT",   count: users.filter(u => u.roles.includes("student")).length, tone: "muted" as const },
            ].map(({ role, count, tone }) => (
              <div key={role} className="flex items-center justify-between py-3">
                <StatusChip tone={tone}>{role}</StatusChip>
                <span className="font-display text-3xl font-bold tabular-nums text-ink">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent events */}
        <div className="glass rounded-lg p-5 lg:col-span-2">
          <SectionLabel className="flex items-center gap-2">
            <CampusEventsIcon size={13} /> RECENT EVENTS
          </SectionLabel>
          <div className="mt-4 divide-y divide-border">
            {recentEvents.slice(0, 5).map((e) => (
              <div key={e.id} className="py-3">
                {/* Date + status on one line */}
                <div className="flex items-center justify-between gap-2">
                  <span className="label-sys text-[0.5625rem] text-steel">{formatEventDate(e.starts_at)}</span>
                  <StatusChip
                    tone={e.status === "published" ? "open" : e.status === "cancelled" ? "urgent" : "muted"}
                  >
                    {e.status.toUpperCase()}
                  </StatusChip>
                </div>
                {/* Title on its own line — never truncated weirdly */}
                <p className="mt-0.5 text-sm font-medium leading-snug text-ink">{e.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent stories + announcements: stack on mobile ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Stories */}
        <div className="glass rounded-lg p-5">
          <SectionLabel className="flex items-center gap-2">
            <CampusNewsIcon size={13} /> RECENT STORIES
          </SectionLabel>
          <div className="mt-4 divide-y divide-border">
            {stories.slice(0, 4).map((s) => (
              <div key={s.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusChip tone={s.published ? "open" : "muted"} className="shrink-0">
                    {s.published ? "LIVE" : "DRAFT"}
                  </StatusChip>
                </div>
                <p className="mt-1 text-sm font-medium leading-snug text-ink">{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="glass rounded-lg p-5">
          <SectionLabel className="flex items-center gap-2">
            <AnnouncementIcon size={13} /> RECENT ANNOUNCEMENTS
          </SectionLabel>
          <div className="mt-4 divide-y divide-border">
            {notices.slice(0, 4).map((n) => (
              <div key={n.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusChip
                    tone={n.priority === "URGENT" ? "urgent" : n.priority === "IMPORTANT" ? "open" : "muted"}
                    className="shrink-0"
                  >
                    {n.priority}
                  </StatusChip>
                </div>
                <p className="mt-1 text-sm font-medium leading-snug text-ink">{n.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── USERS ──────────────────────────────────────────────────── */
function UsersTab() {
  const queryClient = useQueryClient();
  const { user: me } = useAuth();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminListUsers,
  });

  const grantRole = useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: AppRole }) => adminGrantRole(uid, role),
    onSuccess: () => {
      toast.success("Role granted");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error("Could not grant role", { description: e.message }),
  });

  const revokeRole = useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: AppRole }) => adminRevokeRole(uid, role),
    onSuccess: () => {
      toast.success("Role revoked");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error("Could not revoke role", { description: e.message }),
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <SectionLabel>{users.length} REGISTERED USERS</SectionLabel>
      </div>
      {isLoading ? (
        <p className="label-sys text-center">LOADING USERS…</p>
      ) : users.length === 0 ? (
        <div className="glass rounded-lg p-8 text-center">
          <StudentIcon size={28} className="mx-auto text-steel opacity-40" />
          <p className="mt-3 text-sm text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="glass divide-y divide-border rounded-lg">
          {users.map((u) => {
            const isMe = u.id === me?.id;
            return (
              <div key={u.id} className="px-4 py-4 sm:px-5 sm:py-5">
                {/* Top row: avatar + info + roles */}
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-mist">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt=""
                        className="h-full w-full rounded-md object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute("style");
                        }}
                      />
                    ) : null}
                    <StudentIcon
                      size={18}
                      className="text-steel"
                      style={{ display: u.avatar_url ? "none" : undefined }}
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold uppercase tracking-tight text-ink">
                      {u.full_name || "—"}
                      {isMe && <span className="ml-2 text-[0.5rem] text-steel">(YOU)</span>}
                    </p>
                    <p className="label-sys mt-0.5 text-[0.5625rem] text-steel">
                      {u.faculty || "No faculty set"}
                      {u.matric_no ? ` · ${u.matric_no}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Joined {relativeTime(u.created_at)}
                    </p>
                  </div>

                  {/* Current roles — right side on desktop */}
                  <div className="hidden flex-wrap gap-1.5 sm:flex">
                    {u.roles.map((r) => (
                      <StatusChip
                        key={r}
                        tone={r === "admin" ? "urgent" : r === "organizer" ? "open" : "muted"}
                      >
                        {r.toUpperCase()}
                      </StatusChip>
                    ))}
                  </div>
                </div>

                {/* Current roles — mobile (below info) */}
                <div className="mt-2 flex flex-wrap gap-1.5 sm:hidden">
                  {u.roles.length > 0 ? u.roles.map((r) => (
                    <StatusChip
                      key={r}
                      tone={r === "admin" ? "urgent" : r === "organizer" ? "open" : "muted"}
                    >
                      {r.toUpperCase()}
                    </StatusChip>
                  )) : (
                    <span className="label-sys text-[0.5625rem] text-steel">NO ROLES</span>
                  )}
                </div>

                {/* Role controls */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ALL_ROLES.map((role) => {
                    const has = u.roles.includes(role);
                    const busy = grantRole.isPending || revokeRole.isPending;
                    const selfAdminLock = isMe && role === "admin" && has;
                    return (
                      <GlassButton
                        key={role}
                        size="sm"
                        variant={has ? "danger" : "glass"}
                        disabled={busy || selfAdminLock}
                        title={selfAdminLock ? "Cannot revoke your own admin role" : undefined}
                        onClick={() =>
                          has
                            ? revokeRole.mutate({ uid: u.id, role })
                            : grantRole.mutate({ uid: u.id, role })
                        }
                      >
                        {has ? `REVOKE ${role.toUpperCase()}` : `GRANT ${role.toUpperCase()}`}
                      </GlassButton>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── EVENTS ──────────────────────────────────────────────────── */
function EventsTab() {
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: adminAllEvents,
  });
  const { data: registrations = [] } = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: adminAllRegistrations,
  });

  const regCountMap = new Map<string, number>();
  for (const r of registrations) {
    if (r.status === "registered") {
      regCountMap.set(r.event_id, (regCountMap.get(r.event_id) ?? 0) + 1);
    }
  }

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminUpdateEventStatus(id, status),
    onSuccess: () => {
      toast.success("Event status updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e: Error) => toast.error("Could not update", { description: e.message }),
  });

  const removeEvent = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      toast.success("Event deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error("Could not delete", { description: e.message }),
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>{events.length} TOTAL EVENTS</SectionLabel>
        <Link
          to="/organizer/events/create"
          className="label-sys flex items-center gap-2 rounded-md border border-primary bg-primary px-4 py-2.5 text-[0.625rem] text-white"
        >
          + CREATE EVENT
        </Link>
      </div>

      {isLoading ? (
        <p className="label-sys text-center">LOADING EVENTS…</p>
      ) : (
        <div className="glass divide-y divide-border rounded-lg">
          {events.map((e) => {
            const regCount = regCountMap.get(e.id) ?? 0;
            return (
              <div key={e.id} className="px-4 py-4 sm:px-5">
                {/* Top: title + status */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold uppercase tracking-tight text-ink leading-snug">{e.title}</p>
                    <p className="label-sys mt-0.5 text-[0.5625rem] text-steel">
                      {formatEventDate(e.starts_at)} · {formatEventTime(e.starts_at)} · {e.venue}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="label-sys text-[0.5rem] text-steel">{e.category}</span>
                      <span className="label-sys flex items-center gap-1 text-[0.5rem] text-steel">
                        <RegistrationIcon size={10} /> {regCount}/{e.capacity} registered
                      </span>
                    </div>
                  </div>
                  <StatusChip tone={e.status === "published" ? "open" : e.status === "cancelled" ? "urgent" : "muted"}>
                    {e.status.toUpperCase()}
                  </StatusChip>
                </div>
                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.status !== "published" && (
                    <GlassButton size="sm" variant="glass" disabled={setStatus.isPending}
                      onClick={() => setStatus.mutate({ id: e.id, status: "published" })}>
                      PUBLISH
                    </GlassButton>
                  )}
                  {e.status !== "cancelled" && (
                    <GlassButton size="sm" variant="ghost" disabled={setStatus.isPending}
                      onClick={() => setStatus.mutate({ id: e.id, status: "cancelled" })}>
                      CANCEL
                    </GlassButton>
                  )}
                  <Link to="/organizer/events/$id" params={{ id: e.id }}
                    className="label-sys rounded-sm border border-border bg-white/60 px-3 py-2 text-[0.5625rem] text-deep hover:bg-white">
                    MANAGE
                  </Link>
                  <GlassButton size="sm" variant="danger" disabled={removeEvent.isPending}
                    onClick={() => { if (confirm(`Delete "${e.title}"? This cannot be undone.`)) removeEvent.mutate(e.id); }}>
                    DELETE
                  </GlassButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registrations breakdown */}
      <div className="mt-10">
        <SectionLabel className="mb-4 flex items-center gap-2">
          <RegistrationIcon size={13} /> RECENT REGISTRATIONS
        </SectionLabel>
        <div className="glass divide-y divide-border rounded-lg">
          {registrations.slice(0, 20).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-mist">
                {r.profiles?.avatar_url ? (
                  <img
                    src={r.profiles.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <StudentIcon size={14} className="text-steel" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{r.profiles?.full_name ?? "—"}</p>
                <p className="label-sys mt-0.5 text-[0.5625rem] text-steel">
                  {r.profiles?.faculty ?? "No faculty"} · {r.events?.title ?? "Unknown event"}
                </p>
              </div>
              <StatusChip tone={r.checked_in_at ? "live" : r.status === "registered" ? "open" : "muted"}>
                {r.checked_in_at ? "CHECKED IN" : r.status.toUpperCase()}
              </StatusChip>
              <span className="label-sys text-[0.5625rem] text-steel">{relativeTime(r.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CONTENT (News) ─────────────────────────────────────────── */
function ContentTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", excerpt: "", body: "" });
  const [category, setCategory] = useState(CATEGORIES[0]!);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: adminListNews,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    void queryClient.invalidateQueries({ queryKey: ["news"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const publish = useMutation({
    mutationFn: async () => {
      const parsed = newsSchema.safeParse(form);
      if (!parsed.success) {
        setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
        throw new Error("Fix highlighted fields");
      }
      setErrors({});
      const slug = `${parsed.data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 70)}-${Date.now().toString(36)}`;
      return createNews({
        ...parsed.data,
        slug,
        category,
        image_url: "/images/campus-library.jpg",
        published: true,
        read_minutes: Math.max(2, Math.round(parsed.data.body.split(/\s+/).length / 200)),
      });
    },
    onSuccess: () => {
      toast.success("Story published");
      setForm({ title: "", excerpt: "", body: "" });
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      toggleNewsPublished(id, published),
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteNews(id),
    onSuccess: () => { toast.success("Story deleted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-10 grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* Publish form */}
      <form
        onSubmit={(e) => { e.preventDefault(); publish.mutate(); }}
        className="glass h-fit rounded-lg p-6"
        noValidate
      >
        <SectionLabel>PUBLISH NEW STORY</SectionLabel>
        <div className="mt-6 grid gap-4">
          <AuthField label="HEADLINE" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} error={errors["title"]} />
          <AuthField label="STANDFIRST" value={form.excerpt} onChange={(v) => setForm((f) => ({ ...f, excerpt: v }))} error={errors["excerpt"]} />
          <label className="block">
            <SectionLabel className="text-steel">BODY</SectionLabel>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={8}
              className="mt-2 w-full rounded-md border border-border bg-white/70 px-4 py-3 text-sm text-ink outline-none focus:border-deep"
            />
            {errors["body"] && <span className="label-sys mt-1 block text-[0.5625rem] text-urgent">{errors["body"]}</span>}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)}
                className={`label-sys rounded-sm border px-3 py-2 text-[0.5625rem] ${
                  category === c ? "border-primary bg-primary text-white" : "border-border bg-white/50 text-deep"
                }`}
              >{c}</button>
            ))}
          </div>
        </div>
        <GlassButton type="submit" variant="solid" withArrow disabled={publish.isPending} className="mt-6">
          {publish.isPending ? "PUBLISHING…" : "PUBLISH STORY"}
        </GlassButton>
      </form>

      {/* Stories list */}
      <section>
        <SectionLabel>{stories.length} STORIES</SectionLabel>
        {isLoading ? (
          <p className="label-sys mt-4 text-center">LOADING…</p>
        ) : (
          <div className="glass mt-4 divide-y divide-border rounded-lg px-5">
            {stories.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{s.title}</p>
                  <p className="label-sys mt-1 text-[0.5625rem] text-steel">
                    {s.category} · {formatLongDate(s.published_at)}
                  </p>
                </div>
                <StatusChip tone={s.published ? "open" : "muted"}>{s.published ? "LIVE" : "DRAFT"}</StatusChip>
                <GlassButton size="sm" variant="ghost" onClick={() => toggle.mutate({ id: s.id, published: !s.published })}>
                  {s.published ? "UNPUBLISH" : "PUBLISH"}
                </GlassButton>
                <GlassButton size="sm" variant="danger" onClick={() => remove.mutate(s.id)}>DELETE</GlassButton>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─── ANNOUNCEMENTS ─────────────────────────────────────────── */
function AnnouncementsTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", body: "" });
  const [priority, setPriority] = useState(PRIORITIES[0]!);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: allAnnouncements,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    void queryClient.invalidateQueries({ queryKey: ["announcements"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const broadcast = useMutation({
    mutationFn: async () => {
      const parsed = announcementSchema.safeParse(form);
      if (!parsed.success) {
        setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
        throw new Error("Fix highlighted fields");
      }
      setErrors({});
      return createAnnouncement({ ...parsed.data, priority, published: true });
    },
    onSuccess: () => {
      toast.success("Announcement broadcast");
      setForm({ title: "", body: "" });
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => { toast.success("Removed"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-10 grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
      {/* Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); broadcast.mutate(); }}
        className="glass h-fit rounded-lg p-6"
        noValidate
      >
        <SectionLabel>BROADCAST ANNOUNCEMENT</SectionLabel>
        <div className="mt-6 grid gap-4">
          <AuthField label="TITLE" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} error={errors["title"]} />
          <label className="block">
            <SectionLabel className="text-steel">NOTICE TEXT</SectionLabel>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={4}
              className="mt-2 w-full rounded-md border border-border bg-white/70 px-4 py-3 text-sm text-ink outline-none focus:border-deep"
            />
            {errors["body"] && <span className="label-sys mt-1 block text-[0.5625rem] text-urgent">{errors["body"]}</span>}
          </label>
          <div>
            <SectionLabel className="mb-2 text-steel">PRIORITY</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((p) => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`label-sys rounded-sm border px-3 py-2 text-[0.5625rem] ${
                    priority === p
                      ? p === "URGENT" ? "border-urgent bg-urgent/20 text-urgent"
                        : p === "IMPORTANT" ? "border-primary bg-primary text-white"
                        : "border-primary bg-primary text-white"
                      : "border-border bg-white/50 text-deep"
                  }`}
                >{p}</button>
              ))}
            </div>
          </div>
        </div>
        <GlassButton type="submit" variant="solid" withArrow disabled={broadcast.isPending} className="mt-6">
          {broadcast.isPending ? "BROADCASTING…" : "BROADCAST"}
        </GlassButton>
      </form>

      {/* List */}
      <section>
        <SectionLabel>{notices.length} ANNOUNCEMENTS</SectionLabel>
        {isLoading ? (
          <p className="label-sys mt-4 text-center">LOADING…</p>
        ) : (
          <div className="glass mt-4 divide-y divide-border rounded-lg px-5">
            {notices.map((n) => (
              <div key={n.id} className="flex flex-wrap items-center gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  <p className="label-sys mt-1 text-[0.5625rem] text-steel">
                    {n.priority} · {relativeTime(n.publish_at)}
                  </p>
                </div>
                <StatusChip tone={n.priority === "URGENT" ? "urgent" : n.priority === "IMPORTANT" ? "open" : "muted"}>
                  {n.priority}
                </StatusChip>
                <GlassButton size="sm" variant="danger" onClick={() => remove.mutate(n.id)}>REMOVE</GlassButton>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
