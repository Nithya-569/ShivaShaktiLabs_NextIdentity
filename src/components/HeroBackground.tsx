/**
 * HeroBackground component displays a full-width background image
 * with a gradient overlay for the homepage hero section.
 */

"use client";

/** Default hero image from Unsplash */
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2689&auto=format&fit=crop";

/** Props for the HeroBackground component */
interface HeroBackgroundProps {
  /** Optional custom image URL. Falls back to default if not provided. */
  imageUrl?: string;
}

/**
 * HeroBackground renders a fixed background with image and gradient overlay.
 * Creates visual depth for the page header area.
 */
export function HeroBackground({ imageUrl = DEFAULT_IMAGE }: HeroBackgroundProps) {
  return (
    <div className="absolute top-0 left-0 w-full h-[55vh] md:h-[70vh] -z-10 overflow-hidden pointer-events-none">
      <img
        src={imageUrl}
        alt="Hero Background"
        className="w-full h-full object-cover object-center opacity-40 md:opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-[#F4F7F9]/50 to-[#F4F7F9] backdrop-blur-[1px]" />
    </div>
  );
}