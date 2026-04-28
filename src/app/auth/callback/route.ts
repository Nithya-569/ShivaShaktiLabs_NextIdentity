import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  // OAuth provider returned an error
  if (error) {
    console.error("OAuth callback error:", error, searchParams.get("error_description"));
    return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/`);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.session) {
    console.error("Code exchange error:", exchangeError);
    return NextResponse.redirect(`${origin}/auth/signin?error=callback_failed`);
  }

  const user = data.session.user;

  // Ensure profile row exists for Google/OAuth users
  if (user) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, profile_complete")
      .eq("id", user.id)
      .single();

    if (!existing) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        display_name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split("@")[0] ??
          "Member",
      });
      // New user → profile setup
      return NextResponse.redirect(`${origin}/profile/setup`);
    }

    // Returning user, profile incomplete → setup
    if (!existing.profile_complete) {
      return NextResponse.redirect(`${origin}/profile/setup`);
    }
  }

  // Returning user with complete profile → home
  return NextResponse.redirect(`${origin}/`);
}