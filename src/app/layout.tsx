"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Briefcase, Heart, User, LogIn, LogOut, X } from "lucide-react";
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
    // Single source of truth for auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user || null;
      setUser((prev: any) => prev?.id === newUser?.id ? prev : newUser);
    });

    const handleShowAuth = (e: any) => {
      if (e.detail?.mode) setAuthMode(e.detail.mode);
      setShowAuth(true);
    };
    window.addEventListener('showAuthModal', handleShowAuth);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('showAuthModal', handleShowAuth);
    };
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (authMode === "signin") {
      const { error: signInErr } = await signIn(emailInput, passwordInput);
      if (signInErr) {
        setAuthError(signInErr.message);
      } else {
        setShowAuth(false);
      }
    } else {
      const { error: signUpErr } = await signUp(emailInput, passwordInput);
      if (signUpErr) {
        setAuthError(signUpErr.message);
      } else {
        // Supabase often sends a confirmation email
        alert("Success! Please check your email for confirmation.");
        setShowAuth(false);
      }
    }
  };

  const displayName = user
    ? user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
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
      <body className={`${inter.className} min-h-screen bg-[#F4F7F9] text-slate-900 flex flex-col relative`}>
        {/* Desktop Top Navigation */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-inner">NI</div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-800">NextIdentity</h1>
              <p className="text-[11px] text-slate-500 font-medium">Your safe space 🌈</p>
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${isActive ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} /> {item.label}
                </Link>
              );
            })}
          </nav>

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
                  {displayName.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-slate-700">{displayName}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-full font-bold text-sm transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setShowAuth(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-50/50 text-teal-700 hover:bg-teal-100/50 rounded-full font-bold text-sm transition-all border border-teal-100 shadow-sm cursor-pointer"
              >
                Sign In <LogIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setShowAuth(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white hover:bg-teal-500 rounded-full font-bold text-sm transition-all shadow-sm shadow-teal-500/20 cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full mx-auto pb-24 md:pb-12 h-full">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white z-[100] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] rounded-t-3xl border-t border-slate-100 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500" />
          <div className="flex justify-between items-center px-6 py-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1.5 transition-all w-16 ${isActive ? "text-teal-600" : "text-slate-400"}`}
                >
                  <div className={`p-2.5 rounded-2xl transition-all ${isActive ? "bg-teal-50 scale-110" : "hover:bg-slate-50"}`}>
                    <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Auth Modal */}
        {showAuth && !user && (
          <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative">
              <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-slate-800 text-2xl font-black tracking-tight text-center">
                {authMode === "signin" ? "Welcome Back 💛" : "Join NextIdentity ✨"}
              </h3>

              <button
                onClick={() => signInWithGoogle()}
                className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full font-bold text-md transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs font-semibold text-slate-400">OR EMAIL</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
                <input
                  type="email" required placeholder="Enter your email"
                  value={emailInput} onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-3 font-medium text-sm"
                />
                <input
                  type="password" required placeholder="Password"
                  value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-3 font-medium text-sm"
                />
                {authError && <p className="text-red-500 text-xs text-center font-bold">{authError}</p>}
                <button type="submit" className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-bold text-md transition-colors shadow-md shadow-teal-500/20 mt-2">
                  {authMode === "signin" ? "Login" : "Create Account"}
                </button>

                <p className="text-center text-sm text-slate-500 font-medium">
                  {authMode === "signin" ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                    className="ml-1.5 text-teal-700 font-bold hover:underline"
                  >
                    {authMode === "signin" ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </form>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}