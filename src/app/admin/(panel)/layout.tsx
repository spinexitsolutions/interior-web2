import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { logout } from "../actions";
import { AdminNav } from "@/components/admin/nav";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const db = await readDB();
  const unread = db.inquiries.filter((i) => !i.read).length;
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="flex flex-col bg-stone-950 text-stone-300 lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center justify-between px-6 py-6">
          <Link href="/admin" className="display text-2xl text-white">
            {db.settings.brand.logoText}
            <span className="text-[var(--accent)]">.</span>
            <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-widest text-stone-500">CMS</span>
          </Link>
        </div>
        <AdminNav unread={unread} />
        <div className="mt-auto hidden border-t border-white/10 p-5 text-xs lg:block">
          <p className="truncate text-stone-500">{admin.email}</p>
          <div className="mt-3 flex gap-3">
            <a href="/" target="_blank" className="font-semibold text-white hover:underline">
              View site ↗
            </a>
            <form action={logout}>
              <button className="font-semibold text-stone-400 hover:text-white">Log out</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-6 pb-20 md:px-10">{children}</main>
    </div>
  );
}
