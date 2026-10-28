"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { money } from "@/components/sections/shared";
import { gsap, useGSAP, Img, Arrow, Reveal, Star } from "./motion";

export function ProductView({ p, currency, categoryName }: { p: Product; currency: string; categoryName: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState(0);
  const [open, setOpen] = useState<string>("details");

  useGSAP(
    () => {
      gsap.from(".pv-title .split-inner", { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.08, delay: 0.1 });
      gsap.from(".pv-fade", { opacity: 0, y: 30, duration: 1, ease: "expo.out", stagger: 0.06, delay: 0.3 });
      gsap.utils.toArray<HTMLElement>(".pv-img").forEach((el) => {
        gsap.fromTo(el, { clipPath: "inset(8% 8% 8% 8%)" }, {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "top 30%", scrub: true },
        });
      });
    },
    { scope: ref },
  );

  const panels = [
    { key: "details", title: "Details", body: p.description },
    { key: "dims", title: "Dimensions", body: p.dimensions },
    { key: "materials", title: "Materials", body: p.materials.join(" · ") },
    { key: "care", title: "Delivery & care", body: "Made to order in 5-8 weeks. White-glove delivery in metro cities. Wipe with a dry cloth; re-oil wood once a year." },
  ];

  return (
    <div ref={ref} className="tone-light">
      <div className="container-x grid grid-cols-12 gap-y-10 pb-24 pt-28 md:gap-x-10 md:pt-32">
        <div className="col-span-12 space-y-4 md:col-span-7">
          {p.images.map((src, i) => (
            <div key={i} className="pv-img img-frame aspect-[4/5]">
              <Img src={src} alt={`${p.name} ${i + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <aside className="col-span-12 md:col-span-5">
          <div className="md:sticky md:top-28">
            <nav className="pv-fade eyebrow mb-8 flex gap-2 text-(--mute)">
              <Link href="/shop" className="ulink">Shop</Link> /
              <Link href={`/shop?category=${p.category}`} className="ulink">{categoryName}</Link>
            </nav>
            <h1 className="pv-title display h-lg">
              {p.name.split(" ").map((w, i) => (
                <span key={i} className="split-line inline-block pr-[0.22em]">
                  <span className="split-inner inline-block">{w}</span>
                </span>
              ))}
            </h1>
            <p className="pv-fade mt-6 flex items-baseline gap-3 text-2xl font-semibold">
              {money(p.price, currency)}
              {p.compareAt > p.price && <span className="text-base font-normal text-(--mute) line-through">{money(p.compareAt, currency)}</span>}
            </p>
            <p className="pv-fade lede mt-6 text-(--mute)">{p.shortDescription}</p>

            {p.colors.length > 0 && (
              <div className="pv-fade mt-10">
                <p className="eyebrow mb-4 text-(--mute)">
                  Finish: <span className="text-(--fg)">{p.colors[color]?.name}</span>
                </p>
                <div className="flex gap-3">
                  {p.colors.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(i)}
                      aria-label={c.name}
                      className={`h-11 w-11 rounded-full border-2 p-1 transition-all ${i === color ? "scale-110 border-(--fg)" : "border-transparent"}`}
                    >
                      <span className="block h-full w-full rounded-full" style={{ background: c.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pv-fade mt-10 flex flex-wrap gap-3">
              <Link
                href={`/contact?product=${encodeURIComponent(`${p.name}${p.colors[color] ? ` (${p.colors[color].name})` : ""}`)}`}
                className="btn flex-1 justify-between"
              >
                {p.inStock ? "Enquire to order" : "Request made-to-order"}
                <span className="arrow"><Arrow /></span>
              </Link>
            </div>
            <p className="pv-fade mt-4 flex items-center gap-2 text-xs text-(--mute)"><Star className="text-accent" />{p.inStock ? "Ready to ship in 2-3 weeks" : "Made to order in 6-8 weeks"}</p>

            <Reveal className="mt-12 border-t border-(--line)">
              {panels.filter((x) => x.body).map((x) => (
                <div key={x.key} data-reveal className="border-b border-(--line)">
                  <button onClick={() => setOpen(open === x.key ? "" : x.key)} className="flex w-full items-center justify-between py-5 text-left font-semibold">
                    {x.title}
                    <span className={`text-xl transition-transform duration-500 ${open === x.key ? "rotate-45" : ""}`}>+</span>
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-700 ${open === x.key ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <p className="overflow-hidden pb-0 text-(--mute) [&:not(:empty)]:pb-5">{x.body}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </aside>
      </div>
    </div>
  );
}
