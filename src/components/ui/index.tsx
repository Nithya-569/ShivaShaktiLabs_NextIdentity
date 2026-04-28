"use client";

import { cn } from "@/lib/utils";
import { COLOR_MAP, STATUS_MAP, type StatusBadge } from "@/lib/mock-data";
import { ReactNode } from "react";

// ─── Avatar ──────────────────────────────────
interface AvatarProps {
  initials: string;
  colorKey: string;
  size?: "sm" | "md" | "lg";
}
export function Avatar({ initials, colorKey, size = "md" }: AvatarProps) {
  const colors = COLOR_MAP[colorKey] ?? COLOR_MAP["amber"];
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shrink-0",
        sizeClasses[size]
      )}
      style={{
        background: colors.bg,
        color: colors.text,
        fontFamily: "var(--font-syne)",
      }}
    >
      {initials}
    </div>
  );
}

// ─── StatusBadge ─────────────────────────────
export function StatusBadgePill({ status }: { status: StatusBadge }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
}

// ─── Tag ─────────────────────────────────────
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-xs px-2.5 py-0.5 rounded-full font-medium"
      style={{
        background: "var(--surface2)",
        color: "var(--muted)",
        border: "1px solid var(--border)",
      }}
    >
      {children}
    </span>
  );
}

// ─── AmberTag ────────────────────────────────
export function AmberTag({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-xs px-2.5 py-0.5 rounded-full font-medium"
      style={{
        background: "rgba(245,166,35,0.1)",
        color: "var(--amber)",
        border: "1px solid rgba(245,166,35,0.25)",
      }}
    >
      {children}
    </span>
  );
}

// ─── Chip (filter) ───────────────────────────
interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}
export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-medium px-3 py-1 rounded-full transition-all duration-150"
      style={{
        border: `1px solid ${selected ? "var(--amber)" : "var(--border)"}`,
        background: selected ? "rgba(245,166,35,0.1)" : "var(--surface)",
        color: selected ? "var(--amber)" : "var(--muted)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

// ─── Button ──────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  children: ReactNode;
}
export function Button({
  variant = "primary",
  children,
  className,
  ...props
}: ButtonProps) {
  const styles = {
    primary: {
      background: "var(--amber)",
      color: "var(--ink)",
      border: "none",
      fontFamily: "var(--font-syne)",
      fontWeight: "700",
      letterSpacing: "0.03em",
      textTransform: "uppercase" as const,
      fontSize: "0.8rem",
    },
    ghost: {
      background: "transparent",
      color: "var(--text)",
      border: "1px solid var(--border)",
      fontFamily: "var(--font-dm)",
      fontWeight: "500",
    },
    outline: {
      background: "transparent",
      color: "var(--text)",
      border: "1px solid var(--border)",
      fontFamily: "var(--font-dm)",
      fontWeight: "500",
      fontSize: "0.8rem",
      width: "100%",
    },
  };
  return (
    <button
      className={cn(
        "px-5 py-3 rounded-lg transition-all duration-150 hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      style={styles[variant]}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Card ────────────────────────────────────
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}
export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl p-6 transition-all duration-200",
        hover && "cursor-pointer hover:-translate-y-1",
        className
      )}
      style={{
        background: "var(--ink2)",
        border: "1px solid var(--border)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Section Header ──────────────────────────
interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  sub?: string;
  center?: boolean;
}
export function SectionHeader({
  eyebrow,
  title,
  sub,
  center,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-10", center && "text-center")}>
      {eyebrow && (
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--amber)" }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="text-3xl font-black mb-3"
        style={{
          fontFamily: "var(--font-syne)",
          letterSpacing: "-0.03em",
          color: "var(--text)",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          className="text-sm leading-relaxed max-w-xl"
          style={{ color: "var(--muted)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────
interface ProgressBarProps {
  label: string;
  pct: number;
}
export function ProgressBar({ label, pct }: ProgressBarProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span style={{ color: "var(--text)" }}>{label}</span>
        <span style={{ color: "var(--amber)" }}>{pct}%</span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--surface2)" }}
      >
        <div
          className="h-full rounded-full progress-fill"
          style={{ width: `${pct}%`, background: "var(--amber)" }}
        />
      </div>
    </div>
  );
}

// ─── Page Header Band ─────────────────────────
interface PageHeaderProps {
  eyebrow: string;
  title: string;
  sub: string;
  children?: ReactNode;
}
export function PageHeader({ eyebrow, title, sub, children }: PageHeaderProps) {
  return (
    <div
      className="border-b"
      style={{
        background: "var(--ink2)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-5xl mx-auto px-8 py-12">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--amber)" }}
        >
          {eyebrow}
        </p>
        <h1
          className="text-4xl font-black mb-2"
          style={{
            fontFamily: "var(--font-syne)",
            letterSpacing: "-0.04em",
            color: "var(--text)",
          }}
        >
          {title}
        </h1>
        <p className="text-sm mb-0" style={{ color: "var(--muted)" }}>
          {sub}
        </p>
        {children}
      </div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────
export function Divider() {
  return (
    <div
      className="max-w-5xl mx-auto w-full"
      style={{ height: "1px", background: "var(--border)" }}
    />
  );
}
