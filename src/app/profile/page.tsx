"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Edit2, Check, X, LogOut, MapPin, Eye, EyeOff,
  Shield, Users, Briefcase, FileText, ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/services/auth";

type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  pronouns: string | null;
  gender_identity: string | null;
  city: string | null;
  skills: string[];
  interests: string[];
  goals: string[];
  anonymous_default: boolean;
  nickname_mode: boolean;
  show_city_public: boolean;
  show_pronouns_public: boolean;
  profile_complete: boolean;
};

const PRONOUNS = ["she/her","he/him","they/them","she/they","he/they","any/all","prefer not to say"];
const GENDER_IDS = ["Trans woman","Trans man","Non-binary","Genderqueer","Genderfluid","Two-spirit","Intersex","Questioning","Prefer not to say"];

const inputCls = "w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all shadow-sm";
const labelCls = "block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5";

export default function ProfilePage() {
  const router = useRouter();
  const [userId,        setUserId]        = useState<string | null>(null);
  const [profile,       setProfile]       = useState<Profile | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [editing,       setEditing]       = useState(false);
  const [activeTab,     setActiveTab]     = useState<"profile" | "privacy" | "activity">("profile");
  const [editForm,      setEditForm]      = useState<Partial<Profile>>({});
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [postsCount,    setPostsCount]    = useState(0);
  const [communities,   setCommunities]   = useState<any[]>([]);
  const [savedJobs,     setSavedJobs]     = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/auth/signin"); return; }
      setUserId(data.user.id);

      const { data: p } = await supabase
        .from("profiles").select("*").eq("id", data.user.id).single();

      const prof = p as Profile | null;
      setProfile(prof);
      setEditForm(prof ?? {});
      setLoading(false);

      const [{ count: postCnt }, { data: memData }, { data: jobData }] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", data.user.id),
        supabase.from("community_members").select("community_id, communities(id,name,description)").eq("user_id", data.user.id),
        supabase.from("saved_jobs").select("*").eq("user_id", data.user.id).order("saved_at", { ascending: false }),
      ]);
      setPostsCount(postCnt ?? 0);
      setCommunities((memData ?? []).map((r: any) => r.communities).filter(Boolean));
      setSavedJobs(jobData ?? []);
    });
  }, [router]);

  function setField(k: keyof Profile, v: any) {
    setEditForm(p => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);

    let avatar_url = profile?.avatar_url;
    if (avatarFile) {
      const ext  = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars").upload(path, avatarFile, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }
    }

    const { data: updated } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...editForm, avatar_url }, { onConflict: "id" })
      .select().single();

    setProfile(updated as Profile);
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setSaving(false);
  }

  async function togglePrivacy(key: keyof Profile) {
    if (!userId || !profile) return;
    const val = !profile[key];
    setProfile(p => p ? { ...p, [key]: val } : p);
    await supabase.from("profiles").upsert({ id: userId, [key]: val }, { onConflict: "id" });
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-teal-500" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? "left-[26px]" : "left-0.5"}`} />
      </button>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.display_name || "Member";
  const initials    = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F4F7F9] pb-32">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-5">

        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6">
          <div className="flex items-start justify-between gap-4">

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {(avatarPreview || profile?.avatar_url) ? (
                  <img
                    src={avatarPreview || profile?.avatar_url || ""}
                    className="w-20 h-20 rounded-[1.25rem] object-cover border-2 border-white shadow-md"
                    alt="avatar"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-[1.25rem] bg-teal-500 flex items-center justify-center text-white font-black text-2xl shadow-md">
                    {initials}
                  </div>
                )}
                {editing && (
                  <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-teal-600 hover:bg-teal-500 rounded-full flex items-center justify-center cursor-pointer text-white shadow-md transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setAvatarFile(f);
                      setAvatarPreview(URL.createObjectURL(f));
                    }} />
                  </label>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{displayName}</h1>
                {profile?.pronouns && profile.show_pronouns_public && (
                  <p className="text-sm text-slate-400 font-medium mt-0.5">{profile.pronouns}</p>
                )}
                {profile?.city && profile.show_city_public && (
                  <p className="text-sm text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {profile.city}
                  </p>
                )}
                {profile?.gender_identity && (
                  <span className="inline-block mt-1.5 text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100 px-2.5 py-0.5 rounded-full">
                    {profile.gender_identity}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditForm(profile ?? {});
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-9 h-9 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 flex items-center justify-center text-white shadow-sm transition-colors"
                  >
                    {saving
                      ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <Check className="w-4 h-4" />}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-600 hover:text-teal-700 rounded-xl font-bold text-xs transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-500 rounded-xl font-bold text-xs transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
            {[
              { icon: FileText,  label: "Posts",       value: postsCount },
              { icon: Users,     label: "Communities", value: communities.length },
              { icon: Briefcase, label: "Saved Jobs",  value: savedJobs.length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-[#F4F7F9] rounded-2xl py-3 px-2 text-center">
                <Icon className="w-4 h-4 text-teal-500 mx-auto mb-1" />
                <p className="text-xl font-black text-slate-800">{value}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/40 shadow-sm gap-1.5">
          {(["profile", "privacy", "activity"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm capitalize transition-all ${
                activeTab === tab
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-slate-500 hover:bg-white/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 flex flex-col gap-5">
            {editing ? (
              <>
                {([
                  { label: "Display Name", key: "display_name" as keyof Profile, placeholder: "Your name" },
                  { label: "City",         key: "city"         as keyof Profile, placeholder: "e.g. Mumbai" },
                ] as const).map(({ label, key, placeholder }) => (
                  <div key={String(key)}>
                    <label className={labelCls}>{label}</label>
                    <input
                      className={inputCls}
                      placeholder={placeholder}
                      value={(editForm[key] as string) ?? ""}
                      onChange={e => setField(key, e.target.value)}
                    />
                  </div>
                ))}
                <div>
                  <label className={labelCls}>Pronouns</label>
                  <select
                    className={inputCls}
                    value={editForm.pronouns ?? ""}
                    onChange={e => setField("pronouns", e.target.value)}
                  >
                    <option value="">Select pronouns</option>
                    {PRONOUNS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Gender Identity</label>
                  <select
                    className={inputCls}
                    value={editForm.gender_identity ?? ""}
                    onChange={e => setField("gender_identity", e.target.value)}
                  >
                    <option value="">Select identity</option>
                    {GENDER_IDS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Bio</label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={3}
                    placeholder="A little about you..."
                    value={editForm.bio ?? ""}
                    onChange={e => setField("bio", e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                {profile?.bio && (
                  <div>
                    <p className={labelCls}>Bio</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{profile.bio}</p>
                  </div>
                )}
                {profile?.goals && profile.goals.length > 0 && (
                  <div>
                    <p className={labelCls}>Looking for</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.goals.map(g => (
                        <span key={g} className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-bold capitalize">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile?.skills && profile.skills.length > 0 && (
                  <div>
                    <p className={labelCls}>Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map(s => (
                        <span key={s} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {profile?.interests && profile.interests.length > 0 && (
                  <div>
                    <p className={labelCls}>Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map(i => (
                        <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{i}</span>
                      ))}
                    </div>
                  </div>
                )}
                {!profile?.bio && !profile?.goals?.length && !profile?.skills?.length && (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-3">✨</p>
                    <p className="text-slate-400 font-medium text-sm mb-4">Your profile is empty</p>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-teal-500/20 transition-colors"
                    >
                      Complete your profile →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-teal-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Privacy Controls</p>
            </div>
            {([
              { key: "anonymous_default",     label: "Post anonymously by default",  desc: "New posts default to anonymous mode",            Icon: EyeOff  },
              { key: "nickname_mode",         label: "Use nickname in support chat",  desc: "Shows 'Friend' instead of your name in AI chat", Icon: Shield  },
              { key: "show_pronouns_public",  label: "Show pronouns publicly",        desc: "Visible on your public profile",                  Icon: Eye     },
              { key: "show_city_public",      label: "Show city publicly",            desc: "Visible on your public profile",                  Icon: MapPin  },
            ] as { key: keyof Profile; label: string; desc: string; Icon: any }[]).map(({ key, label, desc, Icon }) => (
              <div key={String(key)} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </div>
                <Toggle on={!!(profile?.[key])} onToggle={() => togglePrivacy(key)} />
              </div>
            ))}
            <div className="mt-4 bg-[#F4F7F9] border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Anonymity Rules</p>
              <ul className="text-xs text-slate-500 flex flex-col gap-1.5">
                <li className="flex items-start gap-2"><span className="text-teal-500 font-bold">✓</span> Allowed: Posts, comments, support chat</li>
                <li className="flex items-start gap-2"><span className="text-red-400 font-bold">✗</span> Not allowed: Joining communities</li>
                <li className="flex items-start gap-2"><span className="text-red-400 font-bold">✗</span> Not allowed: Job applications</li>
              </ul>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-teal-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Joined Communities</p>
              </div>
              {communities.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-sm font-medium mb-3">No communities joined yet</p>
                  <a href="/connect" className="text-teal-600 font-bold text-sm hover:underline flex items-center gap-1 justify-center">
                    Browse communities <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                  {communities.map((c: any) => (
                    <div key={c.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-sm font-bold text-slate-700">{c.name}</p>
                      {c.description && <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-teal-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Saved Jobs</p>
              </div>
              {savedJobs.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-sm font-medium mb-3">No saved jobs yet</p>
                  <a href="/grow" className="text-teal-600 font-bold text-sm hover:underline flex items-center gap-1 justify-center">
                    Browse jobs <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                  {savedJobs.map((j: any) => (
                    <div key={j.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-sm font-bold text-slate-700">{j.job_title}</p>
                      {j.company && <p className="text-xs text-slate-400 mt-0.5">{j.company}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}