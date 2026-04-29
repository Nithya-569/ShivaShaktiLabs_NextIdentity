/**
 * MobileHeader component provides the top navigation bar
 * for mobile viewports, showing user info or auth options.
 */

"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

/** User type definition from Supabase auth */
interface User {
  email?: string;
}

/** Props for the MobileHeader component */
interface MobileHeaderProps {
  /** Current authenticated user, or null if not logged in */
  user: User | null;
}

/**
 * MobileHeader displays user avatar/email or sign-in link.
 * Also includes logout functionality for authenticated users.
 */
export function MobileHeader({ user }: MobileHeaderProps) {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="md:hidden flex justify-between items-center w-full mb-6">
      <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-white/60">
        <div className="w-7 h-7 bg-slate-600 text-white rounded-full flex items-center justify-center font-bold text-[11px]">
          {user?.email ? user.email[0].toUpperCase() : "NI"}
        </div>
        <span className="text-[15px] font-bold text-slate-800 tracking-tight">
          {user?.email || "NextIdentity"}
        </span>
      </div>

      {user ? (
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/LGBTQ_Rainbow_Flag.png/640px-LGBTQ_Rainbow_Flag.png"
                alt="Pride"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/auth/signin"
          className="text-xs font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-full border border-teal-200 hover:bg-teal-100 transition-colors shadow-sm"
        >
          Sign In / Sign Up
        </Link>
      )}
    </div>
  );
}