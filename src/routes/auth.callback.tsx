/**
 * /auth/callback
 *
 * Landing page for ALL Supabase email links:
 *   - Email confirmation after sign-up  (type=signup)
 *   - Password reset                    (type=recovery)
 *   - Email change confirmation         (type=email_change)
 *
 * Supabase appends the tokens as a URL *hash fragment*:
 *   /auth/callback#access_token=...&type=signup
 *
 * We read those tokens, exchange them for a session via
 * supabase.auth.exchangeCodeForSession (PKCE) or just let
 * onAuthStateChange handle them, then redirect appropriately.
 */
import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SectionLabel } from "@/components/campus/primitives";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Verifying — Campus Events" }],
  }),
  component: AuthCallbackPage,
});

type Status = "verifying" | "success" | "error";

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Hash fragments are client-only — safe to access here (after hydration).
    const hash = window.location.hash.slice(1); // strip leading '#'
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type"); // "signup" | "recovery" | "email_change"
    const errorDesc = params.get("error_description");

    // Supabase sometimes puts an error in the hash itself
    if (errorDesc) {
      setStatus("error");
      setMessage(decodeURIComponent(errorDesc.replace(/\+/g, " ")));
      return;
    }

    if (!accessToken) {
      // No token in hash — could be a code-based PKCE flow
      // Try to get the session Supabase may have already set
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          redirect(type ?? "signup");
        } else {
          setStatus("error");
          setMessage("No verification token found. The link may have expired.");
        }
      });
      return;
    }

    // Exchange the tokens — this sets the session in localStorage
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken ?? "" })
      .then(({ error }) => {
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        setStatus("success");
        redirect(type ?? "signup");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function redirect(type: string) {
    if (type === "recovery") {
      // Go to the reset-password page — session is now set so it will be ready
      void navigate({ to: "/reset-password", replace: true });
    } else {
      // signup or email_change — go to dashboard
      void navigate({ to: "/dashboard", replace: true });
    }
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-mist/60 px-4 text-center">
        <div className="glass max-w-sm rounded-lg p-8">
          <SectionLabel>VERIFICATION FAILED</SectionLabel>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {message || "This link has expired or is invalid. Please request a new one."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href="/register"
              className="label-sys text-[0.625rem] text-deep underline-offset-2 hover:underline"
            >
              BACK TO REGISTER →
            </a>
            <a
              href="/forgot-password"
              className="label-sys text-[0.625rem] text-steel underline-offset-2 hover:underline"
            >
              RESET PASSWORD →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-mist/60 text-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-deep border-t-transparent" />
      <p className="label-sys text-[0.625rem] text-steel">
        {status === "success" ? "REDIRECTING…" : "VERIFYING YOUR EMAIL…"}
      </p>
    </div>
  );
}
