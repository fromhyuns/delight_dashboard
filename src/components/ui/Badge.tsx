import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
};

const tones = {
  neutral: "border-stone-200 bg-stone-50 text-stone-700",
  accent: "border-violet-200 bg-accentSoft text-accent",
  success: "border-emerald-200 bg-emerald-50 text-success",
  warning: "border-amber-200 bg-amber-50 text-warning",
  danger: "border-red-200 bg-red-50 text-danger",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
