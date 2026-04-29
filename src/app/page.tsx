/**
 * Homepage component for NextIdentity application.
 *
 * This is the main landing page that displays:
 * - Hero section with background image
 * - Mobile header with user authentication status
 * - Grid of action cards for main app features
 *
 * Features:
 * - Real-time authentication state via Supabase
 * - Responsive design for mobile and desktop
 * - Reusable component architecture
 */

"use client";

import { useEffect, useState } from "react";
import { Bot, EyeOff, Briefcase, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { HeroBackground } from "@/components/HeroBackground";
import { MobileHeader } from "@/components/MobileHeader";
import { ActionCard } from "@/components/ActionCard";

// Action card configuration
const ACTION_CARDS = [
  { href: "/support", icon: Bot, iconBgColor: "#5BB29B", title: "Talk to", subtitle: "AI Support" },
  { href: "/connect", icon: EyeOff, iconBgColor: "#E693B1", title: "Post", subtitle: "Anonymously" },
  { href: "/grow", icon: Briefcase, iconBgColor: "#6EB9A2", title: "Find Jobs", subtitle: "Near Me" },
  { href: "/find", icon: MapPin, iconBgColor: "#B8A3E1", title: "Explore", subtitle: "Resources" },
] as const;

/**
 * HomePage - Main entry point for the NextIdentity application.
 * Displays authentication-aware homepage with navigation to core features.
 */
export default function HomePage() {
  // Track authenticated user state
  const [user, setUser] = useState<unknown>(null);

  // Subscribe to Supabase auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session) => {
      const currentUser = session?.user || null;
      setUser((prevUser: unknown) =>
        (prevUser as { id?: string })?.id === currentUser?.id ? prevUser : currentUser
      );
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full relative min-h-screen">
      <HeroBackground />

      <div className="px-6 md:px-12 pt-10 md:pt-24 flex flex-col gap-10 max-w-[1200px] mx-auto w-full">
        <MobileHeader user={user} />

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
          {ACTION_CARDS.map((card) => (
            <ActionCard
              key={card.href}
              href={card.href}
              icon={card.icon}
              iconBgColor={card.iconBgColor}
              title={card.title}
              subtitle={card.subtitle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}