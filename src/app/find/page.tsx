"use client";

import { useState, useEffect } from "react";
import {
  MapPin, Compass, Phone, Shield, ChevronRight,
  Heart, Scale, Home, PhoneCall, CheckCircle,
  Globe, MessageCircle, Bot, ChevronLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────
type Resource = {
  id: string;
  title: string;
  category: string;
  sub_category: string | null;
  city: string | null;
  description: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  website: string | null;
  verified: boolean;
  source: string | null;
};

type Category = "healthcare" | "legal" | "safe_spaces" | "helplines";
type SubOption = { value: string; label: string };

// ─── Category config ──────────────────────────────────────────
const CATEGORIES = [
  {
    value: "healthcare",
    label: "Healthcare",
    emoji: "🏥",
    Icon: Heart,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    subs: [
      { value: "mental_health", label: "Mental Health" },
      { value: "hormone_therapy", label: "Hormone Therapy" },
      { value: "general_doctor", label: "General Doctor" },
    ],
  },
  {
    value: "legal",
    label: "Legal",
    emoji: "⚖️",
    Icon: Scale,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    subs: [
      { value: "name_change", label: "Name Change" },
      { value: "id_correction", label: "ID Correction" },
      { value: "legal_rights", label: "Legal Rights" },
    ],
  },
  {
    value: "safe_spaces",
    label: "Safe Spaces",
    emoji: "🏠",
    Icon: Home,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
    subs: [
      { value: "nearby", label: "Nearby Spaces" },
      { value: "online", label: "Online Spaces" },
    ],
  },
  {
    value: "helplines",
    label: "Helplines",
    emoji: "📞",
    Icon: PhoneCall,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    subs: [],
  },
] as const;

// ─── Component ────────────────────────────────────────────────
export default function FindPage() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [filteredByCity, setFilteredByCity] = useState(false);

  // ── Load user city ───────────────────────────
  useEffect(() => {
    async function loadCity() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("city")
          .eq("id", data.user.id)
          .single();

        if (profile?.city) setUserCity(profile.city);
      } catch (err) {
        console.error("loadCity error:", err);
      }
    }
    loadCity();
  }, []);

  // ── Fetch resources ─────────────────────────
  useEffect(() => {
    if (!activeCategory) {
      setResources([]);
      return;
    }
    fetchResources(activeCategory, activeSub);
  }, [activeCategory, activeSub, userCity]);

  async function fetchResources(category: Category, sub: string | null) {
    setLoading(true);

    let query = supabase
      .from("resources")
      .select("*")
      .eq("category", category)
      .order("verified", { ascending: false });

    if (sub && sub !== "_all") {
      query = query.eq("sub_category", sub);
    }

    try {
      if (userCity) {
        const { data: cityData } = await query.or(
          `city.eq.${userCity},city.is.null`
        );

        if (cityData && cityData.length > 0) {
          setResources(cityData as Resource[]);
          setFilteredByCity(true);
          return;
        }
      }

      const { data, error } = await query;
      if (error) console.error("fetchResources error:", error);

      setResources((data as Resource[]) ?? []);
      setFilteredByCity(false);
    } catch (err) {
      console.error("fetchResources crash:", err);
    } finally {
      setLoading(false);
    }
  }

  function selectCategory(cat: Category) {
    setActiveCategory(cat);
    setActiveSub(null);
  }

  function goBack() {
    if (activeSub) {
      setActiveSub(null);
    } else {
      setActiveCategory(null);
      setResources([]);
    }
  }

  const activeCatConfig = CATEGORIES.find(c => c.value === activeCategory);

  return (
    <div className="w-full relative min-h-screen pb-32">
      <div className="absolute inset-0 bg-[#F4F7F9] -z-10 fixed" />

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-6 md:px-12 pt-8 md:pt-16">

        {/* Header */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800">
            Find Places 🗺️
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Verified safe spaces, clinics, and resources near you.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <a
            href="tel:9152987821"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm"
          >
            <Phone className="w-4 h-4 text-teal-600" />
            Call Helpline
          </a>

          <a
            href="/support"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm"
          >
            <Bot className="w-4 h-4 text-purple-600" />
            Talk to AI
          </a>
        </div>

        {/* Categories */}
        {!activeCategory && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => {
              const Icon = cat.Icon;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => selectCategory(cat.value)}
                  className="bg-white border rounded-2xl p-6 flex flex-col items-center gap-3"
                >
                  <Icon className="w-6 h-6" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Results */}
        {resources.map(res => (
          <ResourceCard
            key={res.id}
            resource={res}
            catConfig={activeCatConfig!}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Resource Card ────────────────────────────────────────────
function ResourceCard({
  resource: res,
  catConfig,
}: {
  resource: Resource;
  catConfig: (typeof CATEGORIES)[number];
}) {
  const Icon = catConfig.Icon;

  return (
    <div className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Icon className="w-6 h-6" />
        <span className="font-bold">{res.title}</span>
      </div>

      {res.description && (
        <p className="text-sm text-slate-500">{res.description}</p>
      )}
    </div>
  );
}