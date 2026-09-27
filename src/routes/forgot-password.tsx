import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthField } from "@/components/campus/AuthShell";
import { GlassButton, SectionLabel } from "@/components/campus/primitives";

const TITLE = "Forgot password — Campus Events";
const DESCRIPTION = "Reset your Campus Events account password.";

const schema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
});

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
      );
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setBusy(false);

    if (error) {
      toast.error("Could not send reset email", { description: error.message });
      return;
    }

    setSent(true);
    toast.success("Reset email sent", {
      description: "Check your inbox and follow the link to reset your password.",
    });
  };

  return (
    <AuthShell
      label="ACCESS / FORGOT PASSWORD"
      title={
        <>
          Reset your
          <br />
          password.
        </>
      }
      intro="Enter your email address and we'll send you a link to reset your password."
      footer={
        <>
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-deep underline-offset-2 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-md border border-border bg-white/60 p-6">
          <SectionLabel>CHECK YOUR INBOX</SectionLabel>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We sent a password reset link to{" "}
            <span className="font-medium text-ink">{email}</span>. Open it to set a new password.
          </p>
          <p className="mt-2 text-xs text-steel">
            Didn't receive it? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-deep underline-offset-2 hover:underline"
            >
              try again
            </button>
            .
          </p>
          <Link
            to="/login"
            className="label-sys mt-4 inline-block text-[0.625rem] text-deep underline-offset-2 hover:underline"
          >
            BACK TO SIGN IN →
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <AuthField
            label="EMAIL ADDRESS"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors["email"]}
            autoComplete="email"
          />
          <GlassButton
            type="submit"
            variant="solid"
            withArrow
            disabled={busy}
            className="mt-1 w-full"
          >
            {busy ? "SENDING…" : "SEND RESET LINK"}
          </GlassButton>
        </form>
      )}
    </AuthShell>
  );
}
