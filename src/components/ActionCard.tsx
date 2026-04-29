/**
 * Reusable action card component for the homepage.
 * Displays an icon with a title and subtitle, linked to a destination.
 *
 * @example
 * ```tsx
 * <ActionCard
 *   href="/support"
 *   icon={Bot}
 *   iconBgColor="#5BB29B"
 *   title="Talk to"
 *   subtitle="AI Support"
 * />
 * ```
 */

"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

/** Props for the ActionCard component */
interface ActionCardProps {
  /** The URL to navigate to when clicked */
  href: string;
  /** The Lucide icon component to display */
  icon: LucideIcon;
  /** Background color for the icon container (hex or CSS color) */
  iconBgColor: string;
  /** Title text displayed below the icon */
  title: string;
  /** Subtitle text displayed below the title */
  subtitle: string;
}

/**
 * ActionCard component renders a clickable card with an icon and text.
 * Used for navigation to main app features from the homepage.
 */
export function ActionCard({ href, icon: Icon, iconBgColor, title, subtitle }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-5 border border-white/40 shadow-sm hover:shadow-md transition-all group"
    >
      <div
        className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform"
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
      </div>
      <span className="text-slate-800 font-bold text-xl md:text-2xl">
        {title}<br />{subtitle}
      </span>
    </Link>
  );
}