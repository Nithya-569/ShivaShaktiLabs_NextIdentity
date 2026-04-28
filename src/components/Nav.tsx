"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { label: "Home",    href: "/" },
  { label: "Connect", href: "/connect" },
  { label: "Grow",    href: "/grow" },
  { label: "Support", href: "/support" },
  { label: "Find",    href: "/find" },
];

export function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleAuthAction() {
    if (user) {
      await supabase.auth.signOut();
    } else {
      const email = window.prompt("To Login/Sign Up, enter your email:");
      if (!email) return;
      const pwd = window.prompt("Enter your password:");
      if (!pwd) return;
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pwd });
      if (error?.message.includes("Invalid login")) {
         // Attempt to sign up if login fails
         const res = await supabase.auth.signUp({ email, password: pwd });
         if (res.error) alert(res.error.message);
         else alert("Account signed up successfully! You are logged in.");
      } else if (error) {
         alert(error.message);
      }
    }
  }

  async function handleAnonLogin() {
    await supabase.auth.signInAnonymously();
  }

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-8 h-16 border-b"
      style={{
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "var(--border)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-0 select-none">
        <span
          className="text-xl font-black tracking-tight"
          style={{
            fontFamily: "var(--font-syne)",
            color: "var(--amber)",
            letterSpacing: "-0.03em",
          }}
        >
          Next
        </span>
        <span
          className="text-xl font-black tracking-tight"
          style={{
            fontFamily: "var(--font-syne)",
            color: "var(--text)",
            letterSpacing: "-0.03em",
          }}
        >
          Identity
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {NAV_LINKS.map(({ label, href }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "text-amber-400"
                  : "hover:text-ni"
              )}
              style={{
                fontFamily: "var(--font-dm)",
                color: isActive ? "var(--amber)" : "var(--muted)",
                background: isActive ? "rgba(245,166,35,0.1)" : "transparent",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2">
        {!user && (
          <button
            onClick={handleAnonLogin}
            className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 hover:-translate-y-px"
            style={{
              fontFamily: "var(--font-syne)",
              color: "var(--muted)",
              background: "transparent",
              letterSpacing: "0.04em",
            }}
          >
            Anon
          </button>
        )}
        <button
          onClick={handleAuthAction}
          className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 hover:-translate-y-px"
          style={{
            fontFamily: "var(--font-syne)",
            background: user ? "var(--surface)" : "var(--amber)",
            color: user ? "var(--text)" : "var(--ink)",
            letterSpacing: "0.04em",
            border: user ? "1px solid var(--border)" : "none",
          }}
        >
          {user ? "Log Out" : "Join Now / Login"}
        </button>
      </div>
    </nav>
  );
}
