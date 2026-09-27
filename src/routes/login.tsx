import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell, AuthField, GoogleButton } from "@/components/campus/AuthShell";
import { GlassButton } from "@/components/campus/primitives";

const TITLE = "Sign in — Campus Events";
const DESCRIPTION =
  "Sign in to register for campus events, track attendance and read your notifications.";

const schema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
});

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { signInWithGoogle, signInWithEmail, loading, googleRedirectPending, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const target = redirect && redirect.startsWith("/") ? redirect : "/dashboard";

  // Navigate to dashboard once session is confirmed:
  // - After mobile Google redirect (googleRedirectPending → false, user set)
  // - After desktop popup completes
  // - If already logged in when landing on this page
  // Only fires when loading is done so we don't redirect prematurely
  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: target, replace: true });
    }
  }, [loading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show spinner ONLY while Google redirect result is being processed
  if (googleRedirectPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist/60">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-deep border-t-transparent" />
          <p className="label-sys text-[0.625rem] text-steel">SIGNING IN WITH GOOGLE…</p>
        </div>
      </div>
    );
  }

  // Initial session check still running — show minimal skeleton, not a spinner
  // (avoids the flash of spinner on every normal page load)
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist/60">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-deep" />
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
      );
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      toast.success("Welcome back");
      void navigate({ to: target });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast.error("Could not sign in", { description: msg });
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setBusy(true);
    try {
      // Mobile: triggers full-page redirect — never resolves here
      // Desktop: resolves after popup, then useEffect above navigates
      await signInWithGoogle();
      // Desktop only reaches here
      void navigate({ to: target });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Google sign-in failed";
      toast.error("Google sign-in failed", { description: msg });
      setBusy(false);
    }
  };

  return (
    <AuthShell
      label="ACCESS / SIGN IN"
      title={
        <>
          Welcome
          <br />
          back.
        </>
      }
      intro="Sign in to reserve places, track your attendance and receive campus alerts in real time."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-medium text-deep underline-offset-2 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {/* Google first — fastest on mobile */}
      <GoogleButton
        onClick={handleGoogleSignIn}
        label={busy ? "SIGNING IN…" : "CONTINUE WITH GOOGLE"}
        disabled={busy}
      />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="label-sys text-[0.5625rem] text-steel">OR</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <AuthField
          label="EMAIL"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors["email"]}
          autoComplete="email"
        />
        <div>
          <AuthField
            label="PASSWORD"
            type="password"
            value={password}
            onChange={setPassword}
            error={errors["password"]}
            autoComplete="current-password"
          />
          <div className="mt-1.5 flex justify-end">
            <Link
              to="/forgot-password"
              className="label-sys text-[0.5625rem] text-steel underline-offset-2 hover:text-deep hover:underline"
            >
              FORGOT PASSWORD?
            </Link>
          </div>
        </div>
        <GlassButton type="submit" variant="solid" withArrow disabled={busy} className="mt-1 w-full">
          {busy ? "SIGNING IN…" : "SIGN IN"}
        </GlassButton>
      </form>
    </AuthShell>
  );
}
