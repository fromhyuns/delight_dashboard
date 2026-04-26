import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
};

const variants = {
  primary: "border-accent bg-accent text-white hover:bg-[#5847c4]",
  secondary: "border-line bg-white text-ink hover:bg-stone-50",
  quiet: "border-transparent bg-transparent text-muted hover:bg-stone-100 hover:text-ink",
};

export function ActionButton({ children, variant = "secondary", className = "", ...props }: ActionButtonProps) {
  return (
    <button
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:border-line disabled:bg-stone-50 disabled:text-muted disabled:opacity-70 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
