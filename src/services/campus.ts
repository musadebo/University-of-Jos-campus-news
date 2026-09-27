import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { AppRole } from "@/hooks/useAuth";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type NewsRow = Database["public"]["Tables"]["news"]["Row"];
export type AnnouncementRow = Database["public"]["Tables"]["announcements"]["Row"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type RegistrationRow = Database["public"]["Tables"]["registrations"]["Row"];

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

/* ─────────────────── storage ─────────────────── */

/**
 * Upload an event cover image to the `covers` bucket.
 * Returns the public URL.
 */
export async function uploadEventCover(file: File, eventId?: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `events/${eventId ?? Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("covers").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("covers").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload a user avatar to the `avatars` bucket.
 * Returns the public URL.
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

/* ─────────────────── events ─────────────────── */

export async function listEvents(opts: { search?: string; category?: string } = {}) {
  let q = supabase
    .from("events")
    .select("*")
    .in("status", ["published", "ended"])
    .order("starts_at", { ascending: true });
  if (opts.category && opts.category !== "ALL") q = q.eq("category", opts.category);
  if (opts.search) q = q.or(`title.ilike.%${opts.search}%,description.ilike.%${opts.search}%`);
  return unwrap(await q) as EventRow[];
}

export async function getEvent(id: string) {
  return unwrap(await supabase.from("events").select("*").eq("id", id).maybeSingle()) as EventRow;
}

export async function countRegistrations(eventId: string) {
  const { count, error } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "registered");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function registerForEvent(eventId: string) {
  // Use positional parameter — the RPC is defined as register_for_event(p_event_id uuid)
  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: eventId,
  } as never);
  if (error) throw new Error(error.message);
  return data as unknown as RegistrationRow;
}

export async function cancelRegistration(eventId: string, userId: string) {
  const { error } = await supabase
    .from("registrations")
    .update({ status: "cancelled" })
    .eq("event_id", eventId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Registration cancelled",
    body: "Your place has been released.",
    kind: "UPDATE",
    link: `/events/${eventId}`,
  });
}

export async function myRegistration(eventId: string, userId: string) {
  return unwrap(
    await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle(),
  ) as RegistrationRow | null;
}

export async function myRegistrations(userId: string) {
  const { data, error } = await supabase
    .from("registrations")
    .select("*, events(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as (RegistrationRow & { events: EventRow | null })[];
}

/* ─────────────────── organizer ─────────────────── */

export async function organizerEvents(userId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", userId)
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as EventRow[];
}

export async function createEvent(input: Database["public"]["Tables"]["events"]["Insert"]) {
  return unwrap(await supabase.from("events").insert(input).select().single()) as EventRow;
}

export async function updateEvent(
  id: string,
  patch: Database["public"]["Tables"]["events"]["Update"],
) {
  return unwrap(await supabase.from("events").update(patch).eq("id", id).select().single()) as EventRow;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function eventRegistrations(eventId: string) {
  // Step 1: fetch registrations for this event
  const { data: regs, error: regErr } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (regErr) throw new Error(regErr.message);
  if (!regs || regs.length === 0) return [];

  // Step 2: fetch profiles for every user_id in those registrations
  const userIds = [...new Set(regs.map((r) => r.user_id))];
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, full_name, matric_no, faculty, avatar_url")
    .in("id", userIds);
  if (profErr) throw new Error(profErr.message);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p]),
  );

  // Step 3: merge
  return regs.map((r) => ({
    ...r,
    profiles: profileMap.get(r.user_id) ?? null,
  })) as (RegistrationRow & {
    profiles: {
      id: string;
      full_name: string;
      matric_no: string | null;
      faculty: string | null;
      avatar_url: string | null;
    } | null;
  })[];
}

export async function setAttendance(registrationId: string, checkedIn: boolean) {
  const { error } = await supabase.rpc("set_attendance", {
    p_registration_id: registrationId,
    p_checked_in: checkedIn,
  } as never);
  if (error) throw new Error(error.message);
}

/* ─────────────────── news ─────────────────── */

/** Public: only published stories */
export async function listNews(opts: { search?: string; category?: string } = {}) {
  let q = supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (opts.category && opts.category !== "ALL") q = q.eq("category", opts.category);
  if (opts.search) q = q.or(`title.ilike.%${opts.search}%,excerpt.ilike.%${opts.search}%`);
  return unwrap(await q) as NewsRow[];
}

/** Admin: all stories including drafts */
export async function adminListNews() {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as NewsRow[];
}

export async function getNews(slug: string) {
  return unwrap(
    await supabase.from("news").select("*").eq("slug", slug).maybeSingle(),
  ) as NewsRow | null;
}

export async function createNews(input: Database["public"]["Tables"]["news"]["Insert"]) {
  return unwrap(await supabase.from("news").insert(input).select().single()) as NewsRow;
}

export async function deleteNews(id: string) {
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function toggleNewsPublished(id: string, published: boolean) {
  const { error } = await supabase.from("news").update({ published }).eq("id", id);
  if (error) throw new Error(error.message);
}

/* ─────────────────── announcements ─────────────────── */

export async function listAnnouncements() {
  return unwrap(
    await supabase
      .from("announcements")
      .select("*")
      .eq("published", true)
      .lte("publish_at", new Date().toISOString())
      .order("publish_at", { ascending: false }),
  ) as AnnouncementRow[];
}

export async function allAnnouncements() {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("publish_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as AnnouncementRow[];
}

export async function createAnnouncement(
  input: Database["public"]["Tables"]["announcements"]["Insert"],
) {
  return unwrap(
    await supabase.from("announcements").insert(input).select().single(),
  ) as AnnouncementRow;
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ─────────────────── admin ─────────────────── */

export type UserWithRoles = {
  id: string;
  email: string;
  full_name: string | null;
  faculty: string | null;
  matric_no: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: AppRole[];
};

export type AdminStats = {
  total_users: number;
  total_events: number;
  total_registrations: number;
  total_news: number;
  total_announcements: number;
  published_events: number;
  published_news: number;
};

export async function adminListUsers(): Promise<UserWithRoles[]> {
  const [{ data: profiles, error: pe }, { data: roles, error: re }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  if (pe) throw new Error(pe.message);
  if (re) throw new Error(re.message);

  const roleMap = new Map<string, AppRole[]>();
  for (const r of roles ?? []) {
    const arr = roleMap.get(r.user_id) ?? [];
    arr.push(r.role as AppRole);
    roleMap.set(r.user_id, arr);
  }

  return (profiles ?? []).map((p) => ({
    id: p.id,
    email: "",
    full_name: p.full_name,
    faculty: p.faculty,
    matric_no: p.matric_no,
    // Ensure Supabase storage avatars get their full public URL
    avatar_url: resolveAvatarUrl(p.avatar_url),
    created_at: p.created_at,
    roles: roleMap.get(p.id) ?? [],
  }));
}

/**
 * Resolve avatar URLs — handles:
 *  - null / empty → null
 *  - full https:// URLs (Google, Supabase public) → as-is
 *  - bare storage paths like "avatars/uid/avatar.jpg" → full public URL
 */
function resolveAvatarUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  // Bare path — build the Supabase public URL
  const bucket = raw.startsWith("avatars/") ? "avatars" : "covers";
  const path = raw.replace(/^(avatars|covers)\//, "");
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function adminGrantRole(userId: string, role: AppRole) {
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
  if (error && !error.message.includes("duplicate")) throw new Error(error.message);
}

export async function adminRevokeRole(userId: string, role: AppRole) {
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role", role);
  if (error) throw new Error(error.message);
}

export async function adminStats(): Promise<AdminStats> {
  const [
    { count: total_users },
    { count: total_events },
    { count: published_events },
    { count: total_registrations },
    { count: total_news },
    { count: published_news },
    { count: total_announcements },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "registered"),
    supabase.from("news").select("id", { count: "exact", head: true }),
    supabase.from("news").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("announcements").select("id", { count: "exact", head: true }),
  ]);
  return {
    total_users: total_users ?? 0,
    total_events: total_events ?? 0,
    published_events: published_events ?? 0,
    total_registrations: total_registrations ?? 0,
    total_news: total_news ?? 0,
    published_news: published_news ?? 0,
    total_announcements: total_announcements ?? 0,
  };
}

export async function adminAllEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as EventRow[];
}

export async function adminAllRegistrations() {
  // Fetch registrations + event title separately (profiles FK join is unreliable)
  const { data: regs, error: regErr } = await supabase
    .from("registrations")
    .select("*, events(title, starts_at)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (regErr) throw new Error(regErr.message);
  if (!regs || regs.length === 0) return [];

  const userIds = [...new Set(regs.map((r) => r.user_id))];
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, full_name, faculty, avatar_url")
    .in("id", userIds);
  if (profErr) throw new Error(profErr.message);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return regs.map((r) => ({
    ...r,
    profiles: profileMap.get(r.user_id) ?? null,
  })) as unknown as (RegistrationRow & {
    events: { title: string; starts_at: string } | null;
    profiles: {
      id: string;
      full_name: string;
      faculty: string | null;
      avatar_url: string | null;
    } | null;
  })[];
}

export async function adminUpdateEventStatus(id: string, status: string) {
  const { error } = await supabase.from("events").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

/* ─────────────────── notifications ─────────────────── */

export async function listNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return (data ?? []) as NotificationRow[];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markAllRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw new Error(error.message);
}
