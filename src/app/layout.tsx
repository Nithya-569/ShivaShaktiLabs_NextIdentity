"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, Briefcase, Heart, User,
  LogIn, LogOut, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { signInWithGoogle, signIn, signUp, signOut } from "@/services/auth";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user || null;
      setUser((prev: any) =>
        prev?.id === newUser?.id ? prev : newUser
      );
    });

    const handleShowAuth = (e: CustomEvent) => {
      if (e.detail?.mode) setAuthMode(e.detail.mode);
      setShowAuth(true);
    };

    window.addEventListener(
      "showAuthModal",
      handleShowAuth as EventListener
    );

    return () => {
      subscription.unsubscribe();
      window.removeEventListener(
        "showAuthModal",
        handleShowAuth as EventListener
      );
    };
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      if (authMode === "signin") {
        const { error } = await signIn(emailInput, passwordInput);
        if (error) {
          setAuthError(error.message);
        } else {
          setShowAuth(false);
        }
      } else {
        const { error } = await signUp(emailInput, passwordInput);
        if (error) {
          setAuthError(error.message);
        } else {
          alert("Success! Please check your email for confirmation.");
          setShowAuth(false);
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError("Something went wrong. Please try again.");
    }
  };

  const displayName = user
    ? user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User"
    : "";

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/connect", icon: Users, label: "Connect" },
    { href: "/grow", icon: Briefcase, label: "Grow" },
    { href: "/find", icon: Heart, label: "Resources" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-[#F4F7F9] text-slate-900 flex flex-col relative`}
      >
        {/* Desktop Navbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
              NI
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800">
                NextIdentity
              </h1>
              <p className="text-[11px] text-slate-500">
                Your safe space 🌈
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm ${
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border"
              >
                <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs uppercase">
                  {displayName.charAt(0)}
                </div>
                <span className="text-sm">{displayName}</span>
              </Link>

              <button
                type="button"
                onClick={() => signOut()}
                className="text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setShowAuth(true);
                }}
                className="px-6 py-2.5 bg-teal-50 text-teal-700 rounded-full"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setShowAuth(true);
                }}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-full"
              >
                Sign Up
              </button>
            </div>
          )}
        </header>

        <main className="flex-1">{children}</main>

        {/* Auth Modal */}
        {showAuth && !user && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm relative">
              <button
                type="button"
                onClick={() => setShowAuth(false)}
                className="absolute top-4 right-4"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-center">
                {authMode === "signin"
                  ? "Welcome Back 💛"
                  : "Join NextIdentity ✨"}
              </h3>

              <form onSubmit={handleEmailAuth} className="flex flex-col gap-3 mt-4">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Email"
                  className="border p-2 rounded"
                />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password"
                  className="border p-2 rounded"
                />

                {authError && (
                  <p className="text-red-500 text-xs">{authError}</p>
                )}

                <button type="submit" className="bg-teal-600 text-white py-2 rounded">
                  {authMode === "signin" ? "Login" : "Sign Up"}
                </button>
              </form>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}