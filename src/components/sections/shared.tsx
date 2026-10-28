import Link from "next/link";
import type { ReactNode } from "react";
import type { Category, Product, Project, Settings, Testimonial, Tone } from "@/lib/types";
import { Arrow } from "@/components/site/motion";

export type SectionCtx = {
  settings: Settings;
  products: Product[];
  categories: Category[];
  projects: Project[];
  testimonials: Testimonial[];
  query?: Record<string, string | undefined>;
};

export function Shell({
  tone = "light",
  className = "",
  children,
  id,
}: {
  tone?: Tone | string;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={`tone-${tone || "light"} relative ${className}`}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className = "" }: { children?: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p className={`eyebrow pill-tag w-fit text-(--mute) ${className}`}>{children}</p>
  );
}

export function Btn({
  href,
  label,
  ghost = false,
  className = "",
}: {
  href?: string;
  label?: string;
  ghost?: boolean;
  className?: string;
}) {
  if (!label || !href) return null;
  return (
    <Link href={href} className={`btn ${ghost ? "btn-ghost" : ""} ${className}`}>
      {label}
      <span className="arrow">
        <Arrow />
      </span>
    </Link>
  );
}

export function money(n: number, currency = "₹") {
  return `${currency}${Number(n || 0).toLocaleString("en-IN")}`;
}
