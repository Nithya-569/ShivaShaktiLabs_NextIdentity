"use client";
import express from 'express'
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn, signInWithGoogle, friendlyAuthError } from "@/services/auth";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(friendlyAuthError(err.message)); return; }
    router.push("/");
  }

  const inputCls = "w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-8 md:p-10">

          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-slate-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md mb-4">NI</div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">Welcome Back 💛</h1>
            <p className="text-slate-500 text-sm mt-1 text-center">Sign in to your safe space</p>
          </div>

          <button
            onClick={() => signInWithGoogle()}
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2.5 shadow-sm mb-5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">or email</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
            <div className="relative">
              <input type={showPw ? "text" : "password"} required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls + " pr-11"} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && <p className="text-red-500 text-xs font-semibold text-center bg-red-50 border border-red-100 rounded-xl py-2 px-3">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-teal-500/20 mt-1">
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in...</span>
                : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            New here?{" "}
            <Link href="/auth/signup" className="text-teal-600 font-bold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}