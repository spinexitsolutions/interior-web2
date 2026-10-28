"use client";

import { useMemo, useRef, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/sections/content";
import { gsap, useGSAP } from "./motion";

export function ShopGrid({
  products,
  categories,
  currency,
  initialCategory,
}: {
  products: Product[];
  categories: Category[];
  currency: string;
  initialCategory: string;
}) {
  const [cat, setCat] = useState(initialCategory || "all");
  const [sort, setSort] = useState("featured");
  const ref = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    const l = products.filter((p) => cat === "all" || p.category === cat);
    if (sort === "low") return [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...l].sort((a, b) => b.price - a.price);
    return [...l].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [products, cat, sort]);

  useGSAP(
    () => {
      gsap.fromTo(".sg-item", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.06 });
    },
    { scope: ref, dependencies: [cat, sort] },
  );

  const choose = (slug: string) => {
    setCat(slug);
    const url = new URL(window.location.href);
    if (slug === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", slug);
    window.history.replaceState(null, "", url);
  };

  const counts = (slug: string) => (slug === "all" ? products.length : products.filter((p) => p.category === slug).length);

  return (
    <section className="tone-light">
      <div className="container-x pb-28">
        <div className="sticky top-0 z-20 -mx-[var(--gutter)] mb-12 flex flex-wrap items-center justify-between gap-4 border-y border-(--line) bg-(--tbg)/85 px-[var(--gutter)] py-4 backdrop-blur-md">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {[{ slug: "all", name: "All" }, ...categories].map((c) => (
              <button
                key={c.slug}
                onClick={() => choose(c.slug)}
                className={`flex shrink-0 items-start gap-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  cat === c.slug ? "border-(--fg) bg-(--fg) text-(--tbg)" : "border-(--line) hover:border-(--fg)"
                }`}
              >
                {c.name}
                <sup className="text-[0.6rem] opacity-60">{counts(c.slug)}</sup>
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-(--line) bg-transparent px-4 py-2 text-sm"
            aria-label="Sort"
          >
            <option value="featured">Featured first</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>

        <div ref={ref} className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 md:gap-y-16 xl:grid-cols-4">
          {list.map((p, i) => (
            <div key={p.id} className={`sg-item ${i % 7 === 0 ? "col-span-2 md:col-span-2" : ""}`}>
              <ProductCard p={p} currency={currency} index={i} big={i % 7 === 0} />
            </div>
          ))}
          {!list.length && <p className="col-span-full py-20 text-center text-(--mute)">Nothing here yet.</p>}
        </div>
      </div>
    </section>
  );
}
