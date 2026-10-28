import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/db";
import { COLLECTIONS } from "@/lib/schemas";
import type { CollectionName } from "@/lib/types";

export default async function CollectionList({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const def = COLLECTIONS[collection];
  if (!def) notFound();
  const items = (await getCollection(collection as CollectionName)) as unknown as Record<string, unknown>[];
  const img = (it: Record<string, unknown>) => {
    const v = def.imageField ? it[def.imageField] : "";
    return Array.isArray(v) ? (v[0] as string) : (v as string);
  };
  return (
    <div className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{def.label}</h1>
          <p className="text-sm text-stone-500">{items.length} items</p>
        </div>
        <Link href={`/admin/c/${collection}/new`} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
          + New {def.singular.toLowerCase()}
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {items.map((it) => (
          <Link
            key={it.id as string}
            href={`/admin/c/${collection}/${it.id}`}
            className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-stone-900"
          >
            <div className="aspect-[4/3] bg-stone-100">
              {img(it) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img(it)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              )}
            </div>
            <div className="p-4">
              <p className="truncate font-semibold">{String(it[def.titleField] || "Untitled")}</p>
              {def.subtitleField && <p className="truncate text-sm capitalize text-stone-500">{String(it[def.subtitleField] ?? "")}</p>}
              <div className="mt-2 flex gap-1.5">
                {it.featured === true && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">FEATURED</span>}
                {it.inStock === false && <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-bold text-stone-600">MADE TO ORDER</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
