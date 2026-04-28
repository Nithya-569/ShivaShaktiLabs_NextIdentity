"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signUp, signInWithGoogle, friendlyAuthError } from "@/services/auth";

const PRONOUNS  = ["she/her","he/him","they/them","she/they","he/they","any/all","prefer not to say"];
const GENDER_IDS = ["Trans woman","Trans man","Non-binary","Genderqueer","Genderfluid","Two-spirit","Intersex","Questioning","Prefer not to say"];

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep]               = useState(1);
  const [showPassword, setShowPw]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [emailSent, setEmailSent]     = useState(false);

  const [form, setForm] = useState({
    display_name: "", email: "", password: "", confirmPassword: "",
    pronouns: "", gender_identity: "", city: "",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  function validateStep1() {
    if (!form.display_name.trim()) return "Please enter your chosen name.";
    if (!form.email.trim())        return "Please enter your email.";
    if (form.password.length < 6)  return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    const { data, error: err } = await signUp(form.email, form.password, form.display_name);
    setLoading(false);

    if (err) { setError(friendlyAuthError(err.message)); return; }

    // Save optional fields
    if (data?.user) {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("profiles").upsert({
        id: data.user.id,
        pronouns:        form.pronouns        || null,
        gender_identity: form.gender_identity || null,
        city:            form.city            || null,
      }, { onConflict: "id" });
    }

    // identities.length === 0 means email confirmation is required
    if (data?.user && data.user.identities?.length === 0) {
      setEmailSent(true);
      return;
    }

    // Auto-login (email confirm disabled) → go to profile setup
    router.push("/profile/setup");
  }

  const inputCls = "w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all shadow-sm";
  const labelCls = "block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5";

  // ── Email verification sent screen ──
  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-10 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Check your email</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            We sent a verification link to <strong className="text-slate-700">{form.email}</strong>.
            Click it to activate your account.
          </p>
          <p className="text-xs text-slate-400">
            Already verified?{" "}
            <Link href="/auth/signin" className="text-teal-600 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-8 md:p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-slate-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md mb-4">NI</div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">Join NextIdentity</h1>
            <p className="text-slate-500 text-sm mt-1 text-center">Your safe space starts here 🌈</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-1.5 bg-teal-500 rounded-full" />
            <div className={`flex-1 h-1.5 rounded-full ${step === 2 ? "bg-teal-500" : "bg-slate-200"}`} />
            <span className="text-xs text-slate-400 font-semibold ml-1">Step {step} / 2</span>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
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

              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Chosen Name *</label>
                  <input className={inputCls} placeholder="What should we call you?" value={form.display_name} onChange={e => set("display_name", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input type="email" className={inputCls} placeholder="your@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Password *</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} className={inputCls + " pr-11"} placeholder="Min. 6 characters" value={form.password} onChange={e => set("password", e.target.value)} />
                    <button type="button" onClick={() => setShowPw(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Confirm Password *</label>
                  <div className="relative">
                    <input type={showConfirm ? "text" : "password"} className={inputCls + " pr-11"} placeholder="Repeat password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs font-semibold text-center bg-red-50 border border-red-100 rounded-xl py-2 px-3">{error}</p>}

                <button
                  onClick={() => {
                    const e = validateStep1();
                    if (e) { setError(e); return; }
                    setError(""); setStep(2);
                  }}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-teal-500/20 mt-1"
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 mb-1">
                <p className="text-xs text-slate-400 font-semibold text-center">🔒 Optional — private by default</p>
              </div>

              <div>
                <label className={labelCls}>Pronouns</label>
                <select className={inputCls} value={form.pronouns} onChange={e => set("pronouns", e.target.value)}>
                  <option value="">Select pronouns</option>
                  {PRONOUNS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Gender Identity</label>
                <select className={inputCls} value={form.gender_identity} onChange={e => set("gender_identity", e.target.value)}>
                  <option value="">Select identity</option>
                  {GENDER_IDS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} placeholder="e.g. Mumbai, Delhi, Bengaluru" value={form.city} onChange={e => set("city", e.target.value)} />
              </div>

              {error && <p className="text-red-500 text-xs font-semibold text-center bg-red-50 border border-red-100 rounded-xl py-2 px-3">{error}</p>}

              <div className="flex gap-3 mt-1">
                <button onClick={() => { setStep(1); setError(""); }} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm">
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-teal-500/20"
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating...</span>
                    : "Create Account"}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-teal-600 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}