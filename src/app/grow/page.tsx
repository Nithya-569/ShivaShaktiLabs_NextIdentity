"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Building,
  ChevronRight,
  Sparkles,
  HandHeart,
  Plus,
  X,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  Zap,
  Wifi,
  Loader2,
  Trash2,
  BadgeCheck,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  getCommunityJobs,
  createJob,
  deleteJob,
  type Job,
} from "@/services/jobs";

// ─── Mentor seed data ─────────────────────────────────────────
const MENTORS = [
  {
    id: 1,
    name: "Sanya Arora",
    role: "Tech Lead @ Flipkart",
    identity: "Trans woman",
    tags: ["Career", "Tech"],
    city: "Bangalore",
  },
  {
    id: 2,
    name: "Kiran Patel",
    role: "Gender Rights Lawyer",
    identity: "Non-binary",
    tags: ["Legal", "Rights"],
    city: "Mumbai",
  },
  {
    id: 3,
    name: "Dr. Ananya R.",
    role: "Affirming Therapist",
    identity: "Trans woman",
    tags: ["Mental Health"],
    city: "Delhi",
  },
  {
    id: 4,
    name: "Rohan Mehta",
    role: "HR Lead @ Infosys",
    identity: "Trans man",
    tags: ["HR", "Hiring"],
    city: "Pune",
  },
];

const JOB_TYPES = [
  "Full Time",
  "Part Time",
  "Contract",
  "Freelance",
  "Internship",
];

const EMPTY_FORM = {
  title: "",
  company_name: "",
  city: "",
  area: "",
  job_type: "Full Time",
  salary: "",
  description: "",
  contact_phone: "",
  contact_whatsapp: "",
  contact_email: "",
  is_inclusive: true,
  immediate_joining: false,
  is_remote: false,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;

  return `${Math.floor(hrs / 24)}d ago`;
}

export default function GrowPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "mentors">("jobs");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Filters
  const [filterCity, setFilterCity] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRemote, setFilterRemote] = useState(false);
  const [filterImmediate, setFilterImmediate] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState("");

  const setField = (k: string, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  // ─── Auth ────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setCurrentUser(data?.user ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_e, session) => {
        setCurrentUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ─── Load + realtime ─────────────────────────────────────
  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    const data = await getCommunityJobs();
    setJobs(data);
    setLoadingJobs(false);
  }, []);

  useEffect(() => {
    loadJobs();

    const channel = supabase
      .channel("jobs_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        () => loadJobs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadJobs]);

  // ─── Post job ────────────────────────────────────────────
  async function handlePostJob() {
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Job title is required.");
      return;
    }

    if (!form.company_name.trim()) {
      setFormError("Business name is required.");
      return;
    }

    if (!form.city.trim()) {
      setFormError("City is required.");
      return;
    }

    if (!form.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    setPosting(true);

    const { error } = await createJob(form);

    setPosting(false);

    if (error) {
      setFormError(error.message ?? "Failed to post job.");
      return;
    }

    setShowModal(false);
    setForm(EMPTY_FORM);
  }

  // ─── Delete ──────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Delete this job post?")) return;

    const { error } = await deleteJob(id);

    if (error) console.error("delete error:", error);
  }

  // ─── Filter logic ────────────────────────────────────────
  const filtered = jobs.filter((j) => {
    if (
      filterCity &&
      !(j.city ?? "")
        .toLowerCase()
        .includes(filterCity.toLowerCase())
    )
      return false;

    if (filterType && j.job_type !== filterType) return false;
    if (filterRemote && !j.is_remote) return false;
    if (filterImmediate && !j.immediate_joining) return false;

    return true;
  });

  // ─── Unique cities for filter ────────────────────────────
  const cities = Array.from(
    new Set(jobs.map((j) => j.city).filter(Boolean))
  ) as string[];

  // ─── Shared input style ─────────────────────────────
  const inputCls =
    "w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all";

  return (
    <div className="w-full relative min-h-screen pb-32">
      <div className="absolute inset-0 bg-[#F4F7F9] -z-10 fixed" />

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-6 md:px-12 pt-8 md:pt-16">
        {/* Header */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
            Grow 💼
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Find inclusive careers and mentorship carefully curated for you.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/60 p-2 rounded-2xl border border-white/40 shadow-sm overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${
              activeTab === "jobs"
                ? "bg-teal-700 text-white shadow-md"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <Briefcase className="w-5 h-5" /> Jobs
          </button>

          <button
            onClick={() => setActiveTab("mentors")}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${
              activeTab === "mentors"
                ? "bg-teal-700 text-white shadow-md"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <HandHeart className="w-5 h-5" /> Mentors
          </button>
        </div>

        {/* JOBS TAB */}
        {activeTab === "jobs" && (
          <>
            {/* Banner */}
            <div className="w-full bg-[#E5F5EF] border border-[#B3E1D4] rounded-[2rem] p-6 shadow-sm flex items-center justify-between overflow-hidden relative">
              <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-32 h-32 text-[#B3E1D4] opacity-30 pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-teal-900 font-black text-xl">
                  AI Resume Builder
                </h3>
                <p className="text-teal-800 text-sm mt-2 font-medium max-w-sm">
                  Create a safe, skill-focused resume in 2 minutes without
                  revealing sensitive history.
                </p>

                <button className="mt-4 px-6 py-2.5 bg-teal-700 text-white font-bold rounded-xl shadow-sm hover:bg-teal-600 transition-colors">
                  Start Now
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Local Jobs
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-0.5">
                  Jobs posted by community members near you
                </p>
              </div>

              {currentUser ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-teal-700 hover:bg-teal-600 text-white rounded-2xl font-bold text-sm shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Post Local Job
                </button>
              ) : (
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium block">
                    Want to post a job?
                  </span>
                  <span className="text-xs text-teal-600 font-bold">
                    Sign in required
                  </span>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="bg-white border border-slate-200 text-slate-600 rounded-2xl px-4 py-2 text-sm font-bold"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white border border-slate-200 text-slate-600 rounded-2xl px-4 py-2 text-sm font-bold"
              >
                <option value="">All Types</option>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setFilterRemote(!filterRemote)}
                className="px-4 py-2 rounded-2xl font-bold text-sm border"
              >
                Remote
              </button>

              <button
                onClick={() => setFilterImmediate(!filterImmediate)}
                className="px-4 py-2 rounded-2xl font-bold text-sm border"
              >
                Immediate
              </button>
            </div>

            {/* Jobs */}
            {loadingJobs ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium text-sm">
                  Loading local jobs...
                </span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-slate-400 font-medium">
                  No jobs found.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isOwner={currentUser?.id === job.posted_by}
                    onDelete={() => handleDelete(job.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* MENTORS TAB */}
        {activeTab === "mentors" && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Mentor Matching
            </h2>

            {MENTORS.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-slate-100 rounded-[2rem] p-6"
              >
                <p className="font-bold text-slate-800">{m.name}</p>
                <p className="text-sm text-slate-500">{m.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
            <h3 className="text-xl font-black text-slate-800 mb-4">
              Post a Local Job
            </h3>

            <input
              className={inputCls}
              placeholder="Job Title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-slate-100 rounded-xl font-bold"
              >
                Cancel
              </button>

              <button
                onClick={handlePostJob}
                className="flex-1 py-3 bg-teal-700 text-white rounded-xl font-bold"
              >
                {posting ? "Posting..." : "Post Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────
function JobCard({
  job,
  isOwner,
  onDelete,
}: {
  job: Job;
  isOwner: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-slate-800 text-xl">{job.title}</p>
          <p className="text-slate-500">{job.company_name}</p>
        </div>

        {isOwner && (
          <button onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>

      {job.description && (
        <p className="text-sm text-slate-600">{job.description}</p>
      )}

      {(job.contact_phone ||
        job.contact_whatsapp ||
        job.contact_email) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {job.contact_phone && (
            <a
              href={`tel:${job.contact_phone}`}
              className="px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          )}

          {job.contact_whatsapp && (
            <a
              href={`https://wa.me/${job.contact_whatsapp.replace(
                /\D/g,
                ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          )}

          {job.contact_email && (
            <a
              href={`mailto:${job.contact_email}`}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          )}
        </div>
      )}
    </div>
  );
}