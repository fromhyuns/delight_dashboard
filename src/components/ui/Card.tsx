import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section className={`rounded-lg border border-line bg-panel shadow-card ${className}`}>
      {children}
    </section>
  );
}
