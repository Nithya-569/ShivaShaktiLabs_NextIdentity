// ─────────────────────────────────────────────
//  NextIdentity — Mock Data
// ─────────────────────────────────────────────

export type StatusBadge = "mentor" | "hiring" | "open" | "collab";
export type Member = {
  id: string;
  initials: string;
  name: string;
  role: string;
  location: string;
  tags: string[];
  status: StatusBadge;
  colorClass: string; // tailwind bg + text combo key
};

export type Resource = {
  id: string;
  category: "Guide" | "Podcast" | "Workshop" | "Course" | "Tool" | "Cohort";
  title: string;
  meta: string;
  emoji: string;
  bgColor: string;
};

export type Opportunity = {
  id: string;
  type: "Role" | "Project" | "Grant" | "Event" | "Community";
  title: string;
  description: string;
  tags: string[];
  date: string;
  emoji: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  title: string;
  initials: string;
  colorKey: string;
};

export type ProgressItem = {
  label: string;
  pct: number;
};

// ── Members ──────────────────────────────────

export const MEMBERS: Member[] = [
  {
    id: "m1",
    initials: "SR",
    name: "Sunita Rao",
    role: "UX Strategist",
    location: "Bengaluru",
    tags: ["Design Systems", "Research", "SaaS"],
    status: "mentor",
    colorClass: "purple",
  },
  {
    id: "m2",
    initials: "JK",
    name: "James Kwon",
    role: "Founder",
    location: "Seoul",
    tags: ["Fintech", "B2B", "Fundraising"],
    status: "open",
    colorClass: "amber",
  },
  {
    id: "m3",
    initials: "AL",
    name: "Amara Lawal",
    role: "Growth Lead",
    location: "Lagos",
    tags: ["PLG", "Africa markets", "Hiring"],
    status: "hiring",
    colorClass: "green",
  },
  {
    id: "m4",
    initials: "MP",
    name: "Marco Pellegrini",
    role: "Creative Consultant",
    location: "Milan",
    tags: ["Brand", "Film", "Mentor"],
    status: "mentor",
    colorClass: "coral",
  },
  {
    id: "m5",
    initials: "PL",
    name: "Priya Lakshmi",
    role: "Climate Tech",
    location: "Singapore",
    tags: ["Deep tech", "Policy", "Open"],
    status: "open",
    colorClass: "blue",
  },
  {
    id: "m6",
    initials: "TN",
    name: "Tanya Nair",
    role: "Ceramics Founder",
    location: "London",
    tags: ["Craft", "DTC", "Ex-finance"],
    status: "collab",
    colorClass: "pink",
  },
  {
    id: "m7",
    initials: "DC",
    name: "Diego Cortez",
    role: "EdTech Founder",
    location: "Mexico City",
    tags: ["EdTech", "B2C", "Pre-seed"],
    status: "open",
    colorClass: "amber",
  },
  {
    id: "m8",
    initials: "FO",
    name: "Fatima Ouédraogo",
    role: "Policy Advisor",
    location: "Paris",
    tags: ["Policy", "Climate", "Mentor"],
    status: "mentor",
    colorClass: "purple",
  },
];

// ── Resources ─────────────────────────────────

export const RESOURCES: Resource[] = [
  {
    id: "r1",
    category: "Guide",
    title: "How to tell your career story when it doesn't follow a straight line",
    meta: "14 min read · by Sunita Rao",
    emoji: "📖",
    bgColor: "rgba(245,166,35,0.1)",
  },
  {
    id: "r2",
    category: "Podcast",
    title: "From engineering to venture: what actually transfers",
    meta: "42 min · Episode 31",
    emoji: "🎙",
    bgColor: "rgba(130,100,240,0.1)",
  },
  {
    id: "r3",
    category: "Workshop",
    title: "Skills inventory: mapping what you know to what's next",
    meta: "Live · Jun 14 · 90 min",
    emoji: "🧪",
    bgColor: "rgba(99,200,87,0.1)",
  },
  {
    id: "r4",
    category: "Course",
    title: "Freelance architecture: pricing, packaging, and positioning",
    meta: "6 modules · Self-paced",
    emoji: "💡",
    bgColor: "rgba(240,130,100,0.1)",
  },
  {
    id: "r5",
    category: "Tool",
    title: "The pivot map: a visual framework for career transition planning",
    meta: "Interactive template",
    emoji: "🗺",
    bgColor: "rgba(50,150,240,0.1)",
  },
  {
    id: "r6",
    category: "Cohort",
    title: "6-week founder fundamentals for first-time builders",
    meta: "Starts Jul 1 · 24 seats left",
    emoji: "✦",
    bgColor: "rgba(200,100,200,0.1)",
  },
];

// ── Opportunities ─────────────────────────────

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "o1",
    type: "Role",
    title: "Product Designer (Career Changer welcome)",
    description:
      "Pebble Studio is seeking a designer who brings an unusual background. Portfolio encouraged, degree not required.",
    tags: ["Design", "Full-time"],
    date: "2 days ago",
    emoji: "💼",
  },
  {
    id: "o2",
    type: "Project",
    title: "Co-founder wanted: climate data startup",
    description:
      "Technical co-founder needed for pre-seed climate intelligence platform. Looking for someone obsessed with the problem, not the title.",
    tags: ["Climate", "Equity"],
    date: "5 days ago",
    emoji: "🤝",
  },
  {
    id: "o3",
    type: "Grant",
    title: "Open Society fellowship for emerging journalists",
    description:
      "$50K fellowship for journalists pivoting to investigative or solutions-focused work. Applications close July 31.",
    tags: ["Media", "$50K"],
    date: "1 week ago",
    emoji: "🏆",
  },
  {
    id: "o4",
    type: "Event",
    title: "Pivot Breakfast — London · Jun 18",
    description:
      "Informal morning gathering for professionals in transition. Share, listen, connect. No pitching, no panels.",
    tags: ["In person", "Free"],
    date: "Jun 18",
    emoji: "📍",
  },
  {
    id: "o5",
    type: "Community",
    title: "Ex-consultants building things",
    description:
      "A private circle of 300+ ex-consulting founders sharing deal flow, hiring, and brutal honesty about the transition.",
    tags: ["Private", "Ongoing"],
    date: "Ongoing",
    emoji: "🌐",
  },
  {
    id: "o6",
    type: "Project",
    title: "Freelance data analyst (3-month contract)",
    description:
      "Fintech scale-up looking for a data analyst comfortable with ambiguity. Open to candidates pivoting from adjacent fields.",
    tags: ["Data", "Remote"],
    date: "3 days ago",
    emoji: "🔬",
  },
];

// ── Testimonials ──────────────────────────────

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "I went from a 10-year banking career to running a ceramics studio. NextIdentity helped me find the people who'd done weird pivots before me.",
    name: "Tanya Nair",
    title: "Ceramics founder · ex-HSBC",
    initials: "TN",
    colorKey: "amber",
  },
  {
    id: "t2",
    quote:
      "I found my technical co-founder here within two weeks of posting. The signal-to-noise ratio is unlike any other platform.",
    name: "Diego Cortez",
    title: "Founder · EdTech · Mexico City",
    initials: "DC",
    colorKey: "purple",
  },
];

// ── Progress ──────────────────────────────────

export const PROGRESS_ITEMS: ProgressItem[] = [
  { label: "Identity Clarity Track", pct: 68 },
  { label: "Narrative Building", pct: 42 },
  { label: "Network Activation", pct: 85 },
];

// ── Stats ─────────────────────────────────────

export const STATS = [
  { value: "42K", label: "Members" },
  { value: "180+", label: "Countries" },
  { value: "12K", label: "Intros made" },
];

// ── Hero members (compact) ────────────────────

export const HERO_MEMBERS = [
  {
    initials: "SR",
    name: "Sunita Rao",
    role: "Ex-Engineer → UX Strategist",
    status: "mentor" as StatusBadge,
    colorKey: "purple",
  },
  {
    initials: "JK",
    name: "James Kwon",
    role: "Founder · Fintech · Seoul",
    status: "open" as StatusBadge,
    colorKey: "amber",
  },
  {
    initials: "AL",
    name: "Amara Lawal",
    role: "Growth Lead · SaaS · Lagos",
    status: "hiring" as StatusBadge,
    colorKey: "green",
  },
  {
    initials: "MP",
    name: "Marco Pellegrini",
    role: "Creative Director → Consultant",
    status: "mentor" as StatusBadge,
    colorKey: "coral",
  },
];

// ── FAQs ─────────────────────────────────────

export const FAQS = [
  {
    q: "Who is NextIdentity for?",
    a: "NextIdentity is for professionals in transition — career changers, early-stage founders, freelancers, and anyone deliberately reinventing their professional identity.",
  },
  {
    q: "Is it free to join?",
    a: "A free tier gives access to the community and basic resources. Pro membership (£15/mo) unlocks mentorship, cohorts, and full search.",
  },
  {
    q: "How does mentorship work?",
    a: "You request an intro to a mentor, they accept, and you schedule a 30-minute session. Mentors are vetted members who've opted in — no cold pitching.",
  },
  {
    q: "Can I post opportunities?",
    a: "Yes — roles, freelance projects, co-founder searches, and grant announcements can all be posted. Pro members get priority placement.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Settings → Account → Delete account. Your data is removed within 7 days. No re-engagement emails, no dark patterns.",
  },
];

// ── Chat bot replies ──────────────────────────

export const BOT_REPLIES = [
  "Great question! You can upgrade to Pro in Settings → Membership. It's £15/month with no annual lock-in.",
  "Mentors on NextIdentity are verified members who opt in. You can find them via Connect and filter by 'Is mentor'.",
  "Our free tier includes access to the community feed, public resources, and basic search. Pro unlocks everything.",
  "Career transitions are exactly what we're built for. Check out the Grow section for our Pivot Track resources.",
  "You can post a project or role opportunity from your dashboard. Pro members get featured placement.",
];

// ── Feature cards (Home) ──────────────────────

export const FEATURES = [
  {
    icon: "🤝",
    title: "Connect",
    desc: "Find peers, collaborators, and mentors who've walked the same uncertain path. No gatekeeping, no cold pitches.",
    href: "/connect",
  },
  {
    icon: "📈",
    title: "Grow",
    desc: "Curated resources, courses, and frameworks for building skills that actually translate across industries.",
    href: "/grow",
  },
  {
    icon: "💬",
    title: "Support",
    desc: "Community circles and 1:1 mentorship from people who've made real transitions — not just thought leaders.",
    href: "/support",
  },
  {
    icon: "🔍",
    title: "Find",
    desc: "Discover opportunities — roles, projects, grants, and communities — matched to where you're headed, not where you've been.",
    href: "/find",
  },
  {
    icon: "✦",
    title: "Identify",
    desc: "Reflect on your skills, values, and goals with guided tools that help you articulate your evolving professional identity.",
    href: null,
  },
  {
    icon: "⟳",
    title: "Coming soon",
    desc: "AI-powered identity mapping, portfolio builder, and cohort-based transition programs launching Q3 2025.",
    href: null,
    comingSoon: true,
  },
];

// ── Color helpers ─────────────────────────────

export const COLOR_MAP: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  amber: {
    bg: "rgba(245,166,35,0.2)",
    text: "#F5A623",
    border: "rgba(245,166,35,0.3)",
  },
  purple: {
    bg: "rgba(130,100,240,0.2)",
    text: "#A088F0",
    border: "rgba(130,100,240,0.3)",
  },
  green: {
    bg: "rgba(99,200,87,0.2)",
    text: "#63C857",
    border: "rgba(99,200,87,0.3)",
  },
  coral: {
    bg: "rgba(240,130,100,0.2)",
    text: "#F08264",
    border: "rgba(240,130,100,0.3)",
  },
  blue: {
    bg: "rgba(50,150,240,0.2)",
    text: "#4A9EF0",
    border: "rgba(50,150,240,0.3)",
  },
  pink: {
    bg: "rgba(200,100,200,0.2)",
    text: "#D070D0",
    border: "rgba(200,100,200,0.3)",
  },
};

export const STATUS_MAP: Record<
  StatusBadge,
  { label: string; bg: string; text: string; border: string }
> = {
  mentor: {
    label: "Mentor",
    bg: "rgba(130,100,240,0.15)",
    text: "#A088F0",
    border: "rgba(130,100,240,0.3)",
  },
  hiring: {
    label: "Hiring",
    bg: "rgba(245,166,35,0.15)",
    text: "#F5A623",
    border: "rgba(245,166,35,0.3)",
  },
  open: {
    label: "Open to collab",
    bg: "rgba(99,200,87,0.15)",
    text: "#63C857",
    border: "rgba(99,200,87,0.3)",
  },
  collab: {
    label: "Seeking collab",
    bg: "rgba(50,150,240,0.15)",
    text: "#4A9EF0",
    border: "rgba(50,150,240,0.3)",
  },
};
