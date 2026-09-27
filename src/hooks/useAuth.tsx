import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "student" | "organizer" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  matric_no: string | null;
  faculty: string | null;
  avatar_url: string | null;
  cover_url: string | null;
};

type AuthValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  /** True ONLY when processing a Google redirect result — use to show redirect spinner */
  googleRedirectPending: boolean;
  hasRole: (role: AppRole) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    userData: { full_name: string; matric_no?: string; faculty?: string },
  ) => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function derivePassword(uid: string): string {
  return `goog_${uid}_campus_auth_2026`;
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

async function finaliseGoogleCredential(fbUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): Promise<void> {
  if (!fbUser.email) throw new Error("Google did not provide an email address.");

  const derivedPw = derivePassword(fbUser.uid);

  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: fbUser.email,
    password: derivedPw,
  });

  if (!signInErr) {
    const { data: me } = await supabase.auth.getUser();
    if (me.user) {
      await supabase.from("profiles").upsert({
        id: me.user.id,
        full_name: fbUser.displayName || "",
        avatar_url: fbUser.photoURL || null,
      });
    }
    return;
  }

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: fbUser.email,
    password: derivedPw,
    options: {
      data: {
        full_name: fbUser.displayName || "",
        avatar_url: fbUser.photoURL || "",
        provider: "google",
      },
    },
  });

  if (signUpErr) {
    if (
      signUpErr.message?.toLowerCase().includes("already registered") ||
      signUpErr.message?.toLowerCase().includes("user already registered")
    ) {
      throw new Error(
        "This email is already registered with a password. Sign in with your password instead.",
      );
    }
    throw signUpErr;
  }

  if (!signUpData.session) {
    const { error: retryErr } = await supabase.auth.signInWithPassword({
      email: fbUser.email,
      password: derivedPw,
    });
    if (retryErr) {
      throw new Error("Account created — please confirm your email then sign in.");
    }
  }

  const { data: me } = await supabase.auth.getUser();
  if (me.user) {
    await supabase.from("profiles").upsert({
      id: me.user.id,
      full_name: fbUser.displayName || "",
      avatar_url: fbUser.photoURL || null,
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleRedirectPending, setGoogleRedirectPending] = useState(false);
  // Track whether the redirect result has been checked so we only do it once
  const redirectChecked = useRef(false);

  const loadMeta = async (uid: string | undefined) => {
    if (!uid) {
      setProfile(null);
      setRoles([]);
      return;
    }
    const [{ data: p }, { data: r }, { data: authData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.auth.getUser(),
    ]);

    const profileData = p as Profile | null;

    if (profileData && !profileData.avatar_url) {
      const metaAvatar =
        (authData?.user?.user_metadata?.["avatar_url"] as string | undefined) ||
        (authData?.user?.user_metadata?.["picture"] as string | undefined) ||
        null;
      if (metaAvatar) {
        profileData.avatar_url = metaAvatar;
        void supabase.from("profiles").update({ avatar_url: metaAvatar }).eq("id", uid);
      }
    }

    setProfile(profileData ?? null);
    setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
  };

  useEffect(() => {
    let active = true;

    const init = async () => {
      // ── 1. Check for returning Google redirect (mobile only, runs once) ────
      if (!redirectChecked.current) {
        redirectChecked.current = true;
        try {
          const { getRedirectResult } = await import("firebase/auth");
          const { auth } = await import("@/lib/firebase");
          const result = await getRedirectResult(auth);
          if (result?.user && active) {
            setGoogleRedirectPending(true);
            await finaliseGoogleCredential(result.user);
            if (active) setGoogleRedirectPending(false);
          }
        } catch {
          // No redirect result, or already consumed — normal page load
          if (active) setGoogleRedirectPending(false);
        }
      }

      // ── 2. Normal Supabase session load ─────────────────────────────────────
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await loadMeta(data.session?.user?.id);
      if (active) setLoading(false);
    };

    void init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      setSession(s);
      void loadMeta(s?.user?.id);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signInWithGoogle = async () => {
    const { signInWithPopup, signInWithRedirect } = await import("firebase/auth");
    const { auth, googleProvider } = await import("@/lib/firebase");

    if (isMobileDevice()) {
      // Triggers full-page redirect — function never returns on mobile
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    // Desktop: popup
    const result = await signInWithPopup(auth, googleProvider);
    await finaliseGoogleCredential(result.user);
  };

  const signUpWithGoogle = signInWithGoogle;

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    userData: { full_name: string; matric_no?: string; faculty?: string },
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      const { auth } = await import("@/lib/firebase");
      if (auth.currentUser) await auth.signOut();
    } catch {
      // Firebase not loaded — ignore
    }
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
  };

  const value = useMemo<AuthValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      roles,
      loading,
      googleRedirectPending,
      hasRole: (role) => roles.includes(role),
      refresh: async () => loadMeta(session?.user?.id),
      signOut,
      signInWithGoogle,
      signUpWithGoogle,
      signInWithEmail,
      signUpWithEmail,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, profile, roles, loading, googleRedirectPending],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
