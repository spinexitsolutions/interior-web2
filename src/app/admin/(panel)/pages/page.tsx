import Link from "next/link";
import { readDB } from "@/lib/db";
import { createPage } from "../../actions";

export default async function PagesList() {
  const { pages } = await readDB();
  return (
    <div className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-sm text-stone-500">Every page is built from sections you can add, reorder and edit.</p>
        </div>
        <form action={createPage} className="flex gap-2">
          <input name="title" required placeholder="New page title" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
          <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">+ Create</button>
        </form>
      </div>
      <div className="mt-8 divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        {pages.map((p) => (
          <Link key={p.id} href={`/admin/pages/${p.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50">
            <span className="font-semibold">{p.title}</span>
            <span className="text-sm text-stone-400">/{p.slug === "home" ? "" : p.slug}</span>
            <span className="ml-auto text-xs text-stone-500">{p.sections.length} sections</span>
            <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${p.published ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}`}>
              {p.published ? "Live" : "Draft"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
