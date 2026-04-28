"use client";

import { useEffect, useState } from "react";
import { Bot, EyeOff, Briefcase, MapPin } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // ✅ use shared client

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUser = session?.user || null;
        setUser((prev: any) => prev?.id === newUser?.id ? prev : newUser);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full relative min-h-screen">
      {/* Background Hero Image */}
      <div className="absolute top-0 left-0 w-full h-[55vh] md:h-[70vh] -z-10 overflow-hidden pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2689&auto=format&fit=crop"
          alt="Hero Background"
          className="w-full h-full object-cover object-center opacity-40 md:opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-[#F4F7F9]/50 to-[#F4F7F9] backdrop-blur-[1px]" />
      </div>

      <div className="px-6 md:px-12 pt-10 md:pt-24 flex flex-col gap-10 max-w-[1200px] mx-auto w-full">

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center w-full mb-6">
          <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-white/60">
            <div className="w-7 h-7 bg-slate-600 text-white rounded-full flex items-center justify-center font-bold text-[11px]">
              {user?.email ? user.email[0].toUpperCase() : "NI"}
            </div>
            <span className="text-[15px] font-bold text-slate-800 tracking-tight">
              {user?.email || "NextIdentity"}
            </span>
          </div>

          {/* ✅ Clickable Profile Icon or Auth */}
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
                onClick={async () => await supabase.auth.signOut()}
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

        {/* Hero Text */}
        <div className="space-y-3 mt-2 md:mt-0 max-w-3xl ml-2">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-800 leading-[1.15]">
            Welcome ✨<br />
            You&apos;re not alone here
          </h1>
        </div>

        <div className="h-14 md:h-20" />

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8 w-full max-w-5xl self-center px-2">

          <Link
            href="/support"
            className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-5 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all group"
          >
            <div className="w-20 h-20 rounded-[1.5rem] bg-[#5BB29B] flex items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform">
              <Bot className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-slate-800 font-bold text-xl md:text-2xl leading-tight">
              Talk to<br />AI Support
            </span>
          </Link>

          <Link
            href="/connect"
            className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-5 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all group"
          >
            <div className="w-20 h-20 rounded-[1.5rem] bg-[#E693B1] flex items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform">
              <EyeOff className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-slate-800 font-bold text-xl md:text-2xl leading-tight">
              Post<br />Anonymously
            </span>
          </Link>

          <Link
            href="/grow"
            className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-5 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all group"
          >
            <div className="w-20 h-20 rounded-[1.5rem] bg-[#6EB9A2] flex items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform">
              <Briefcase className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-slate-800 font-bold text-xl md:text-2xl leading-tight">
              Find Jobs<br />Near Me
            </span>
          </Link>

          <Link
            href="/find"
            className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-5 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all group"
          >
            <div className="w-20 h-20 rounded-[1.5rem] bg-[#B8A3E1] flex items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform">
              <MapPin className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-slate-800 font-bold text-xl md:text-2xl leading-tight">
              Explore<br />Resources
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
}