import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthField } from "@/components/campus/AuthShell";
import { GlassButton, SectionLabel } from "@/components/campus/primitives";

const TITLE = "Reset password — Campus Events";
const DESCRIPTION = "Set a new password for your Campus Events account.";

const schema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(72),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    // The /auth/callback page already exchanged the recovery token for a session
    // before redirecting here. Just confirm the session exists.
    const checkSession = async () => {
      // First, listen for PASSWORD_RECOVERY event in case we arrive directly
      // with hash tokens (e.g. user bookmarked the link)
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          setReady(true);
        }
      });

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
      } else {
        // Wait a moment for onAuthStateChange to fire before showing error
        setTimeout(() => {
          setInvalid((prev) => {
            if (!prev) {
              supabase.auth.getSession().then(({ data: d }) => {
                if (!d.session) setInvalid(true);
              });
            }
            return prev;
          });
        }, 2000);
      }

      return () => sub.subscription.unsubscribe();
    };

    void checkSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setBusy(false);

    if (error) {
      toast.error("Could not update password", { description: error.message });
      return;
    }

    toast.success("Password updated", {
      description: "You can now sign in with your new password.",
    });
    void navigate({ to: "/dashboard", replace: true });
  };

  if (invalid) {
    return (
      <AuthShell
        label="ACCESS / RESET PASSWORD"
        title={
          <>
            Invalid
            <br />
            reset link.
          </>
        }
        intro="This reset link has expired or is invalid. Please request a new one."
        footer={null}
      >
        <div className="rounded-md border border-border bg-white/60 p-6">
          <SectionLabel>LINK EXPIRED</SectionLabel>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Password reset links expire after 1 hour and can only be used once.
          </p>
          <Link
            to="/forgot-password"
            className="label-sys mt-4 inline-block text-[0.625rem] text-deep underline-offset-2 hover:underline"
          >
            REQUEST NEW RESET LINK →
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist/60">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-deep border-t-transparent" />
          <p className="label-sys text-[0.625rem] text-steel">VERIFYING RESET LINK…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      label="ACCESS / RESET PASSWORD"
      title={
        <>
          Set new
          <br />
          password.
        </>
      }
      intro="Choose a strong password for your Campus Events account."
      footer={
        <>
          Changed your mind?{" "}
          <Link to="/login" className="font-medium text-deep underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <AuthField
          label="NEW PASSWORD"
          type="password"
          value={form.password}
          onChange={set("password")}
          error={errors["password"]}
          autoComplete="new-password"
        />
        <AuthField
          label="CONFIRM PASSWORD"
          type="password"
          value={form.confirm}
          onChange={set("confirm")}
          error={errors["confirm"]}
          autoComplete="new-password"
        />
        <GlassButton
          type="submit"
          variant="solid"
          withArrow
          disabled={busy}
          className="mt-1 w-full"
        >
          {busy ? "UPDATING…" : "SET NEW PASSWORD"}
        </GlassButton>
      </form>
    </AuthShell>
  );
}
