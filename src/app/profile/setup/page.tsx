"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

const GOAL_OPTIONS = [
  { value: "community",  label: "🤝 Find Community",   desc: "Connect with others on similar journeys" },
  { value: "jobs",       label: "💼 Find Jobs",         desc: "Inclusive employers and opportunities" },
  { value: "support",    label: "💙 Emotional Support", desc: "AI chat and peer support" },
  { value: "legal",      label: "⚖️ Legal Help",        desc: "Rights and documentation guidance" },
  { value: "resources",  label: "📍 Nearby Resources",  desc: "Clinics, NGOs, safe spaces" },
];

const SKILLS    = ["Design","Coding","Writing","Teaching","Counseling","Legal","Healthcare","Art","Music","Community Organizing"];
const INTERESTS = ["Mental Health","Advocacy","Career Growth","Arts & Culture","Fitness","Education","Technology","Policy","Fashion","Food"];

function PillToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
        active
          ? "bg-teal-600 border-teal-600 text-white shadow-sm"
          : "bg-white border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600"
      }`}
    >
      {label}
    </button>
  );
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const [userId,        setUserId]        = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);

  const [bio,       setBio]       = useState("");
  const [skills,    setSkills]    = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals,     setGoals]     = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/signin"); return; }
      setUserId(data.user.id);
    });
  }, [router]);

  function toggle(arr: string[], set: (a: string[]) => void, val: string) {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  }

  async function handleSave() {
    if (!userId) return;
    setLoading(true);

    let avatar_url: string | undefined;
    if (avatarFile) {
      const ext  = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars").upload(path, avatarFile, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = data.publicUrl;
      }
    }

    await supabase.from("profiles").upsert({
      id: userId,
      bio:             bio || null,
      skills,
      interests,
      goals,
      avatar_url,
      profile_complete: true,
    }, { onConflict: "id" });

    setLoading(false);
    router.push("/profile");
  }

  const labelCls = "block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2";

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.08)] p-8 md:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-slate-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md mx-auto mb-4">NI</div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Set up your profile ✨</h1>
            <p className="text-slate-400 text-sm mt-1">All optional — you control what's visible</p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-7">
            <label className="cursor-pointer group">
              <div className="relative w-24 h-24">
                {avatarPreview ? (
                  <img src={avatarPreview} className="w-24 h-24 rounded-[1.25rem] object-cover border-2 border-white shadow-md" alt="preview" />
                ) : (
                  <div className="w-24 h-24 rounded-[1.25rem] bg-slate-100 border-2 border-dashed border-slate-300 group-hover:border-teal-400 flex flex-col items-center justify-center transition-colors">
                    <span className="text-2xl">🏳️‍⚧️</span>
                    <span className="text-[10px] text-slate-400 mt-1 font-bold">Add photo</span>
                  </div>
                )}
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">+</div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                setAvatarFile(f);
                setAvatarPreview(URL.createObjectURL(f));
              }} />
            </label>
          </div>

          {/* Bio */}
          <div className="mb-5">
            <label className={labelCls}>Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="A little about you — your journey, passions, or what you're looking for..."
              rows={3}
              className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all shadow-sm resize-none"
            />
          </div>

          {/* Goals */}
          <div className="mb-5">
            <label className={labelCls}>What are you looking for?</label>
            <div className="flex flex-col gap-2">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => toggle(goals, setGoals, opt.value)}
                  className={`text-left px-4 py-3.5 rounded-2xl border text-sm transition-all flex items-center gap-3 ${
                    goals.includes(opt.value)
                      ? "bg-teal-50 border-teal-200 text-slate-800"
                      : "bg-white border-slate-200 text-slate-500 hover:border-teal-200"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    goals.includes(opt.value) ? "bg-teal-600 border-teal-600" : "border-slate-300"
                  }`}>
                    {goals.includes(opt.value) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <div>
                    <span className="font-bold">{opt.label}</span>
                    <span className="text-slate-400 text-xs block mt-0.5">{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="mb-5">
            <label className={labelCls}>Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <PillToggle key={s} label={s} active={skills.includes(s)} onClick={() => toggle(skills, setSkills, s)} />
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="mb-7">
            <label className={labelCls}>Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <PillToggle key={i} label={i} active={interests.includes(i)} onClick={() => toggle(interests, setInterests, i)} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-bold text-sm transition-all"
            >
              Skip for now
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-teal-500/20"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                : "Save Profile →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}