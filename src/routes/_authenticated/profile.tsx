import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageShell } from "@/components/campus/PageShell";
import { AuthField } from "@/components/campus/AuthShell";
import { GlassButton, GlassLink, SectionLabel, StatusChip } from "@/components/campus/primitives";
import { StudentIcon, RegistrationIcon, NotificationIcon, AttendanceIcon, ArrowIcon } from "@/components/icons";

const UNIJOS_FACULTIES = [
  "Faculty of Agriculture",
  "Faculty of Arts",
  "Faculty of Education",
  "Faculty of Engineering",
  "Faculty of Environmental Sciences",
  "Faculty of Law",
  "Faculty of Management Sciences",
  "Faculty of Natural Sciences",
  "Faculty of Pharmaceutical Sciences",
  "Faculty of Social Sciences",
  "Faculty of Veterinary Medicine",
  "College of Health Sciences",
];

const schema = z.object({
  full_name: z.string().trim().min(2, { message: "Tell us your full name" }).max(120),
  matric_no: z.string().trim().max(40),
  faculty: z.string().trim().max(120),
});

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Campus Events" },
      { name: "description", content: "Manage your Campus Events profile, faculty and matric number." },
      { property: "og:title", content: "Your profile — Campus Events" },
      { property: "og:description", content: "Manage your Campus Events profile, faculty and matric number." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, roles, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ full_name: "", matric_no: "", faculty: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        matric_no: profile.matric_no ?? "",
        faculty: profile.faculty ?? "",
      });
    }
  }, [profile]);

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        matric_no: parsed.data.matric_no || null,
        faculty: parsed.data.faculty || null,
      })
      .eq("id", user!.id);
    setBusy(false);
    if (error) {
      toast.error("Could not save", { description: error.message });
      return;
    }
    await refresh();
    toast.success("Profile updated");
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
      // Path: {userId}/avatar.{ext}  — user ID as folder so RLS can match auth.uid()
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      // Bust cache by appending timestamp
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);
      if (updateErr) throw updateErr;
      await refresh();
      toast.success("Avatar updated");
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message });
    } finally {
      setAvatarUploading(false);
    }
  };

  const onCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover image must be under 5MB");
      return;
    }
    setCoverUploading(true);
    try {
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
      const path = `${user.id}/cover.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("covers")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("covers").getPublicUrl(path);
      const coverUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ cover_url: coverUrl })
        .eq("id", user.id);
      if (updateErr) throw updateErr;
      await refresh();
      toast.success("Cover photo updated");
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message });
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  };

  const onSignOut = async () => {
    queryClient.clear();
    await signOut();
    void navigate({ to: "/login", replace: true });
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const provider = (user?.app_metadata?.["provider"] as string | undefined) ?? "email";
  const isGoogleUser = provider === "google" || (user?.user_metadata?.["provider"] as string | undefined) === "google";

  // ── Change password state ──────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwBusy, setPwBusy] = useState(false);

  const setPw = (key: keyof typeof pwForm) => (v: string) =>
    setPwForm((f) => ({ ...f, [key]: v }));

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (pwForm.current.length < 6) newErrors["current"] = "Enter your current password";
    if (pwForm.next.length < 8) newErrors["next"] = "New password must be at least 8 characters";
    if (pwForm.next !== pwForm.confirm) newErrors["confirm"] = "Passwords do not match";
    if (Object.keys(newErrors).length) {
      setPwErrors(newErrors);
      return;
    }
    setPwErrors({});
    setPwBusy(true);

    // Re-authenticate first to confirm current password
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: pwForm.current,
    });
    if (signInErr) {
      setPwBusy(false);
      setPwErrors({ current: "Current password is incorrect" });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    setPwBusy(false);
    if (error) {
      toast.error("Could not update password", { description: error.message });
      return;
    }
    setPwForm({ current: "", next: "", confirm: "" });
    toast.success("Password updated successfully");
  };

  const syncGoogleAvatar = async () => {
    if (!user) return;
    // Try to get the latest Google picture from Firebase if the user is signed in there
    try {
      const { auth } = await import("@/lib/firebase");
      const fbUser = auth.currentUser;
      const googleAvatar =
        fbUser?.photoURL ||
        (user.user_metadata?.["avatar_url"] as string | undefined) ||
        (user.user_metadata?.["picture"] as string | undefined) ||
        null;
      if (!googleAvatar) {
        toast.error("No Google picture found", {
          description: "Sign out and sign back in with Google to sync your picture.",
        });
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: googleAvatar })
        .eq("id", user.id);
      if (error) throw error;
      await refresh();
      toast.success("Google profile picture synced");
    } catch (err: any) {
      toast.error("Sync failed", { description: err.message });
    }
  };

  return (
    <PageShell
      label="ACCOUNT / PROFILE"
      title={<>Your<br />profile.</>}
      intro="Your name and faculty appear on organizer rosters when you register for an event."
      aside={
        <div className="flex flex-wrap gap-2">
          {(roles.length ? roles : (["student"] as const)).map((r) => (
            <StatusChip key={r} tone={r === "admin" ? "urgent" : r === "organizer" ? "open" : "default"}>
              {r.toUpperCase()}
            </StatusChip>
          ))}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-6">

          {/* Avatar + identity card */}
          <div className="glass rounded-lg overflow-hidden">
            {/* ── Cover photo banner ── */}
            <div className="relative h-28 sm:h-36 bg-gradient-to-br from-[#35556E] to-[#5F8CA8]">
              {profile?.cover_url && (
                <img
                  src={profile.cover_url}
                  alt="Cover"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {/* Cover upload button */}
              <label
                htmlFor="cover-upload"
                className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1.5 rounded-sm border border-white/40 bg-black/30 px-2.5 py-1.5 text-[0.625rem] font-medium uppercase tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                title="Change cover photo"
              >
                {coverUploading ? (
                  <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                ) : (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                    <path d="M1 8.5V10h1.5l4.4-4.4-1.5-1.5L1 8.5ZM9.7 2.3a.996.996 0 0 0 0-1.4L8.1.3a.996.996 0 0 0-1.4 0L5.6 1.4 7.1 2.9l2.6-.6Z" fill="currentColor"/>
                  </svg>
                )}
                {coverUploading ? "UPLOADING…" : "EDIT COVER"}
                <input id="cover-upload" type="file" accept="image/*" className="sr-only" onChange={onCoverChange} />
              </label>
            </div>

            {/* ── Avatar + identity below the cover ── */}
            <div className="p-5 sm:p-6">
            <SectionLabel>IDENTITY</SectionLabel>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-border bg-mist sm:h-24 sm:w-24">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name || "Avatar"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <StudentIcon size={32} className="text-steel" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border bg-white shadow-sm transition-colors hover:bg-mist"
                  title="Change avatar"
                >
                  {avatarUploading ? (
                    <span className="h-3 w-3 animate-spin rounded-full border border-deep border-t-transparent" />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L3.5 10.5l-3 .5.5-3L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-deep" />
                    </svg>
                  )}
                  <input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={onAvatarChange} />
                </label>
              </div>

              {/* Name + email */}
              <div className="min-w-0 flex-1">
                <h2 className="font-display truncate text-2xl font-bold uppercase tracking-[-0.03em] text-ink sm:text-3xl">
                  {profile?.full_name || (user?.user_metadata?.["full_name"] as string | undefined) || "UNIJOS Student"}
                </h2>
                <p className="mt-1 truncate text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile?.faculty && (
                    <span className="label-sys rounded-sm border border-border bg-white/60 px-2 py-1 text-[0.625rem] text-deep">
                      {profile.faculty}
                    </span>
                  )}
                  {profile?.matric_no && (
                    <span className="label-sys rounded-sm border border-border bg-white/60 px-2 py-1 text-[0.625rem] text-steel">
                      {profile.matric_no}
                    </span>
                  )}
                  <span className="label-sys rounded-sm border border-border bg-white/60 px-2 py-1 text-[0.625rem] text-steel capitalize">
                    {isGoogleUser ? "Google account" : "Email account"}
                  </span>
                </div>
                {/* Sync Google picture button — shown when user has a Google account but no avatar yet */}
                {isGoogleUser && !profile?.avatar_url && (
                  <button
                    type="button"
                    onClick={() => void syncGoogleAvatar()}
                    className="mt-3 label-sys flex items-center gap-1.5 rounded-sm border border-border bg-white/70 px-3 py-1.5 text-[0.625rem] text-deep transition-colors hover:bg-mist"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                      <path d="M5.5 1.5A4 4 0 1 1 1.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      <path d="M1.5 2.5v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    SYNC GOOGLE PICTURE
                  </button>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={onSubmit} className="glass rounded-lg p-5 sm:p-6" noValidate>
            <SectionLabel>PERSONAL DETAILS</SectionLabel>
            <div className="mt-5 grid gap-4">
              <AuthField
                label="FULL NAME"
                value={form.full_name}
                onChange={set("full_name")}
                error={errors["full_name"]}
                autoComplete="name"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <AuthField
                  label="MATRIC NUMBER (OPTIONAL)"
                  value={form.matric_no}
                  onChange={set("matric_no")}
                  error={errors["matric_no"]}
                />
                {/* Faculty select */}
                <label className="block">
                  <SectionLabel className="text-steel">FACULTY (OPTIONAL)</SectionLabel>
                  <select
                    value={form.faculty}
                    onChange={(e) => set("faculty")(e.target.value)}
                    className="mt-2 w-full rounded-md border border-border bg-white/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-deep"
                  >
                    <option value="">Select faculty…</option>
                    {UNIJOS_FACULTIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  {errors["faculty"] && (
                    <span className="label-sys mt-1.5 block text-[0.5625rem] text-urgent">{errors["faculty"]}</span>
                  )}
                </label>
              </div>
            </div>
            <GlassButton type="submit" variant="solid" withArrow disabled={busy} className="mt-6 w-full sm:w-auto">
              {busy ? "SAVING…" : "SAVE CHANGES"}
            </GlassButton>
          </form>

          {/* Change password — only for email/password accounts */}
          {!isGoogleUser && (
            <form onSubmit={onChangePassword} className="glass rounded-lg p-5 sm:p-6" noValidate>
              <SectionLabel>CHANGE PASSWORD</SectionLabel>
              <p className="mt-2 text-xs text-steel">
                Leave blank if you don't want to change your password.
              </p>
              <div className="mt-5 grid gap-4">
                <AuthField
                  label="CURRENT PASSWORD"
                  type="password"
                  value={pwForm.current}
                  onChange={setPw("current")}
                  error={pwErrors["current"]}
                  autoComplete="current-password"
                />
                <AuthField
                  label="NEW PASSWORD"
                  type="password"
                  value={pwForm.next}
                  onChange={setPw("next")}
                  error={pwErrors["next"]}
                  autoComplete="new-password"
                />
                <AuthField
                  label="CONFIRM NEW PASSWORD"
                  type="password"
                  value={pwForm.confirm}
                  onChange={setPw("confirm")}
                  error={pwErrors["confirm"]}
                  autoComplete="new-password"
                />
              </div>
              <GlassButton
                type="submit"
                variant="solid"
                withArrow
                disabled={pwBusy || (!pwForm.current && !pwForm.next && !pwForm.confirm)}
                className="mt-6 w-full sm:w-auto"
              >
                {pwBusy ? "UPDATING…" : "UPDATE PASSWORD"}
              </GlassButton>
            </form>
          )}

          {/* Google users: link to account settings */}
          {isGoogleUser && (
            <div className="glass rounded-lg p-5 sm:p-6">
              <SectionLabel>PASSWORD</SectionLabel>
              <p className="mt-3 text-sm text-steel">
                You signed in with Google. To change your password, visit your{" "}
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-deep underline-offset-2 hover:underline"
                >
                  Google account security settings
                </a>
                .
              </p>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-6">

          {/* Account info + sign out */}
          <div className="glass rounded-lg p-5 sm:p-6">
            <SectionLabel>ACCOUNT DETAILS</SectionLabel>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="label-sys text-[0.5625rem] text-steel">EMAIL ADDRESS</dt>
                <dd className="mt-1 break-all text-sm font-medium text-ink">{user?.email}</dd>
              </div>
              <div>
                <dt className="label-sys text-[0.5625rem] text-steel">MEMBER SINCE</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{memberSince}</dd>
              </div>
              <div>
                <dt className="label-sys text-[0.5625rem] text-steel">SIGN-IN METHOD</dt>
                <dd className="mt-1 text-sm font-medium text-ink capitalize">
                  {isGoogleUser ? "Google OAuth" : "Email & Password"}
                </dd>
              </div>
              <div>
                <dt className="label-sys text-[0.5625rem] text-steel">ROLES</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {(roles.length ? roles : ["student"]).map((r) => (
                    <StatusChip key={r} tone={r === "admin" ? "urgent" : r === "organizer" ? "open" : "default"}>
                      {r.toUpperCase()}
                    </StatusChip>
                  ))}
                </dd>
              </div>
            </dl>
            {/* Sign out — inline, unobtrusive */}
            <div className="mt-6 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="label-sys flex items-center gap-2 text-[0.625rem] text-steel transition-colors hover:text-urgent"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3M9 9.5l2.5-3L9 3.5M5 6.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                SIGN OUT
              </button>
            </div>
          </div>

          {/* Quick links */}
          <div className="glass rounded-lg p-5 sm:p-6">
            <SectionLabel>QUICK ACCESS</SectionLabel>
            <div className="mt-4 flex flex-col divide-y divide-border">
              {[
                { to: "/dashboard", label: "DASHBOARD", Icon: StudentIcon },
                { to: "/dashboard/events", label: "MY EVENTS", Icon: RegistrationIcon },
                { to: "/notifications", label: "NOTIFICATIONS", Icon: NotificationIcon },
              ].map(({ to, label, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center justify-between py-3"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} className="text-deep" />
                    <span className="label-sys text-[0.625rem] text-ink">{label}</span>
                  </span>
                  <ArrowIcon size={15} className="text-steel transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
