import Link from "next/link";
import { readDB } from "@/lib/db";

export default async function Dashboard() {
  const db = await readDB();
  const stats = [
    { label: "Pages", value: db.pages.length, href: "/admin/pages" },
    { label: "Products", value: db.products.length, href: "/admin/c/products" },
    { label: "Projects", value: db.projects.length, href: "/admin/c/projects" },
    { label: "New inquiries", value: db.inquiries.filter((i) => !i.read).length, href: "/admin/inquiries" },
  ];
  const quick = [
    { title: "Edit the homepage", text: "Reorder, hide or add sections.", href: `/admin/pages/${db.pages.find((p) => p.slug === "home")?.id}` },
    { title: "Change colours & fonts", text: "Theme, typography, brand.", href: "/admin/settings" },
    { title: "Add a product", text: "Photos, price, finishes.", href: "/admin/c/products/new" },
    { title: "Publish a project", text: "Show off a finished space.", href: "/admin/c/projects/new" },
  ];
  return (
    <div className="py-10">
      <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Welcome back</p>
      <h1 className="display mt-2 text-5xl">{db.settings.brand.name}</h1>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-900">
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="display mt-2 text-5xl">{s.value}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 text-sm font-bold uppercase tracking-widest text-stone-500">Quick actions</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quick.map((q) => (
          <Link key={q.title} href={q.href} className="group rounded-2xl bg-stone-900 p-6 text-white transition hover:bg-black">
            <p className="text-lg font-semibold">{q.title}</p>
            <p className="mt-1 text-sm text-stone-400">{q.text}</p>
            <p className="mt-6 text-sm font-semibold text-[var(--accent)] transition group-hover:translate-x-1">Open →</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 text-sm font-bold uppercase tracking-widest text-stone-500">Latest inquiries</h2>
      <div className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
        {db.inquiries.slice(0, 5).map((q) => (
          <Link key={q.id} href="/admin/inquiries" className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50">
            {!q.read && <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
            <span className="font-semibold">{q.name}</span>
            <span className="truncate text-sm text-stone-500">{q.interest}: {q.message}</span>
            <span className="ml-auto shrink-0 text-xs text-stone-400">{new Date(q.createdAt).toLocaleDateString("en-IN")}</span>
          </Link>
        ))}
        {!db.inquiries.length && <p className="px-5 py-6 text-sm text-stone-500">No inquiries yet. They’ll appear here when someone submits the contact form.</p>}
      </div>
    </div>
  );
}
