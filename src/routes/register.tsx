import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell, AuthField, GoogleButton } from "@/components/campus/AuthShell";
import { GlassButton, SectionLabel } from "@/components/campus/primitives";

const TITLE = "Create account — UNIJOS Campus Events";
const DESCRIPTION =
  "Join the University of Jos campus community. Register to access events, news, and stay connected with UNIJOS.";

const UNIJOS_FACULTIES = [
  "Faculty of Agriculture",
  "Faculty of Arts",
  "Faculty of Computing",
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
  fullName: z.string().trim().min(2, { message: "Tell us your full name" }).max(120),
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  matricNo: z.string().trim().max(40).optional(),
  faculty: z.string().trim().max(120).optional(),
  password: z.string().min(6, { message: "Use at least 6 characters" }).max(72),
});

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { signUpWithGoogle, loading, googleRedirectPending, user } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    matricNo: "",
    faculty: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  // Navigate once session confirmed (covers mobile redirect return)
  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard", replace: true });
  }, [loading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show spinner ONLY while processing Google redirect result
  if (googleRedirectPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist/60">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-deep border-t-transparent" />
          <p className="label-sys text-[0.625rem] text-steel">SETTING UP YOUR ACCOUNT…</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist/60">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-deep" />
      </div>
    );
  }

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
      );
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin + "/auth/callback",
        data: {
          full_name: parsed.data.fullName,
          matric_no: parsed.data.matricNo ?? "",
          faculty: parsed.data.faculty ?? "",
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Could not create account", { description: error.message });
      return;
    }
    if (!data.session) {
      setSent(true);
      toast.success("Check your email", {
        description: "Confirm your address to finish signing up.",
      });
      return;
    }
    toast.success("Account created");
    void navigate({ to: "/dashboard" });
  };

  const handleGoogleSignUp = async () => {
    setBusy(true);
    try {
      // Mobile: triggers full-page redirect — never resolves here
      // Desktop: resolves after popup, then useEffect above navigates
      await signUpWithGoogle();
      // Desktop only reaches here — useEffect handles navigation
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Google sign-up failed";
      toast.error("Google sign-up failed", { description: msg });
      setBusy(false);
    }
  };

  return (
    <AuthShell
      label="ACCESS / CREATE ACCOUNT"
      title={
        <>
          Join the
          <br />
          campus.
        </>
      }
      intro="One account for events, registrations, attendance, campus reporting and real-time alerts."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-medium text-deep underline-offset-2 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {/* Google first — fastest path on mobile */}
      <GoogleButton
        label={busy ? "SIGNING UP…" : "CONTINUE WITH GOOGLE"}
        onClick={handleGoogleSignUp}
        disabled={busy}
      />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="label-sys text-[0.5625rem] text-steel">OR REGISTER WITH EMAIL</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {sent ? (
        <div className="rounded-md border border-border bg-white/60 p-6">
          <SectionLabel>CONFIRM YOUR EMAIL</SectionLabel>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-medium text-ink">{form.email}</span>. Open it to activate your
            account, then sign in.
          </p>
          <Link
            to="/login"
            className="label-sys mt-4 inline-block text-[0.625rem] text-deep underline-offset-2 hover:underline"
          >
            GO TO SIGN IN →
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <AuthField
            label="FULL NAME"
            value={form.fullName}
            onChange={set("fullName")}
            error={errors["fullName"]}
            autoComplete="name"
          />
          <AuthField
            label="EMAIL"
            type="email"
            value={form.email}
            onChange={set("email")}
            error={errors["email"]}
            autoComplete="email"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="MATRIC NO (OPTIONAL)"
              value={form.matricNo}
              onChange={set("matricNo")}
              error={errors["matricNo"]}
            />
            <label className="block">
              <span className="label-sys text-[0.5625rem] text-steel">FACULTY (OPTIONAL)</span>
              <select
                value={form.faculty}
                onChange={(e) => set("faculty")(e.target.value)}
                className="mt-2 w-full rounded-md border border-border bg-white/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-deep"
              >
                <option value="">Select faculty…</option>
                {UNIJOS_FACULTIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <AuthField
            label="PASSWORD"
            type="password"
            value={form.password}
            onChange={set("password")}
            error={errors["password"]}
            autoComplete="new-password"
          />
          <GlassButton
            type="submit"
            variant="solid"
            withArrow
            disabled={busy}
            className="mt-1 w-full"
          >
            {busy ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
          </GlassButton>
        </form>
      )}
    </AuthShell>
  );
}
