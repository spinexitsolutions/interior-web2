"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "◎" },
  { href: "/admin/pages", label: "Pages", icon: "▤" },
  { href: "/admin/c/products", label: "Products", icon: "◧" },
  { href: "/admin/c/categories", label: "Categories", icon: "▦" },
  { href: "/admin/c/projects", label: "Projects", icon: "◩" },
  { href: "/admin/c/testimonials", label: "Testimonials", icon: "❝" },
  { href: "/admin/media", label: "Media", icon: "▣" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "✉" },
  { href: "/admin/settings", label: "Settings & theme", icon: "⚙" },
];

export function AdminNav({ unread }: { unread: number }) {
  const path = usePathname();
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
      {ITEMS.map((it) => {
        const active = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              active ? "bg-white text-stone-950" : "hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="w-4 text-center opacity-70">{it.icon}</span>
            {it.label}
            {it.label === "Inquiries" && unread > 0 && (
              <span className="ml-auto rounded-full bg-[var(--accent)] px-2 text-[11px] font-bold text-white">{unread}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
