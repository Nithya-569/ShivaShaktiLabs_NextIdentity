import { supabase } from "@/lib/supabase";

// ─── Helper: ensure profile row exists ───────────────────────
async function ensureProfile(userId: string, email: string, displayName?: string) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existing) {
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      email,
      display_name: displayName ?? email.split("@")[0],
    });
    if (error && error.code !== "23505") {
      // 23505 = unique_violation — safe to ignore (row already exists)
      console.error("ensureProfile error:", error);
    }
  }
}

// ─── Sign Up ─────────────────────────────────────────────────
export async function signUp(
  email: string,
  password: string,
  displayName?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName ?? email.split("@")[0],
      },
    },
  });

  if (error) {
    console.error("signUp error:", error);
    return { data: null, error };
  }

  // If email confirmation is OFF, user is instantly confirmed — create profile now
  // If email confirmation is ON, identities array is empty — profile created on verify via trigger
  if (data.user && data.user.identities && data.user.identities.length > 0) {
    await ensureProfile(data.user.id, email, displayName ?? email.split("@")[0]);
  }

  return { data, error: null };
}

// ─── Sign In ─────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("signIn error:", error.message);
    return { data: null, error };
  }

  // Ensure profile exists (handles edge case of old users without profile row)
  if (data.user) {
    await ensureProfile(
      data.user.id,
      data.user.email ?? email,
      data.user.user_metadata?.full_name
    );
  }

  return { data, error: null };
}

// ─── Google OAuth ─────────────────────────────────────────────
export async function signInWithGoogle() {
  if (typeof window === "undefined") {
    return { data: null, error: new Error("Must be called in browser") };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) console.error("signInWithGoogle error:", error);
  return { data, error };
}

// ─── Sign Out ─────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("signOut error:", error);
  return { error };
}

// ─── Friendly error messages ─────────────────────────────────
export function friendlyAuthError(message: string): string {
  if (!message) return "Something went wrong. Please try again.";
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "Incorrect email or password. Please try again.";
  if (m.includes("email not confirmed"))
    return "Please verify your email first. Check your inbox.";
  if (m.includes("user already registered"))
    return "An account with this email already exists. Please sign in.";
  if (m.includes("password should be"))
    return "Password must be at least 6 characters.";
  if (m.includes("unable to validate email"))
    return "Please enter a valid email address.";
  if (m.includes("provider is not enabled"))
    return "Google login is not enabled yet. Please use email/password.";
  if (m.includes("network") || m.includes("fetch"))
    return "Network error. Please check your connection.";
  return message;
}