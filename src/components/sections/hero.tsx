"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Product } from "@/lib/types";
import { gsap, useGSAP, whenReady, Highlight, Img, Magnetic, Arrow, prefersReduced } from "@/components/site/motion";
import { Btn, Shell, money } from "./shared";

type HeroData = {
  eyebrow?: string;
  headline?: string;
  subtext?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  images?: string[];
};

export function Hero({ data, product, currency }: { data: HeroData; product?: Product; currency: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const lines = (data.headline || "").split("\n");
  const [main, side1, side2] = data.images ?? [];

  useGSAP(
    () => {
      if (prefersReduced()) return;
      gsap.set(".h-line-inner", { yPercent: 115 });
      gsap.set(".h-fade", { opacity: 0, y: 30 });
      gsap.set(".h-img", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".h-img img", { scale: 1.3 });
      gsap.set(".h-card", { opacity: 0, y: 40 });

      const stop = whenReady(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(".h-line-inner", { yPercent: 0, duration: 1.4, stagger: 0.1 })
          .to(".h-img", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, stagger: 0.12, ease: "expo.inOut" }, 0.1)
          .to(".h-img img", { scale: 1, duration: 2.2, stagger: 0.12 }, 0.3)
          .to(".h-fade", { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.6)
          .to(".h-card", { opacity: 1, y: 0, duration: 1.2 }, 1.1);
      });

      // On scroll the large photo drifts slower than the page, the small ones faster.
      const st = { trigger: ref.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".h-main img", { yPercent: 12, ease: "none", scrollTrigger: st });
      gsap.to(".h-side", { yPercent: -30, ease: "none", stagger: 0.1, scrollTrigger: st });
      return stop;
    },
    { scope: ref },
  );

  return (
    <Shell tone="light" className="overflow-hidden">
      <div ref={ref} className="container-x relative grid min-h-[100dvh] grid-cols-12 items-center gap-x-6 gap-y-12 pb-16 pt-28">
        {/* Copy */}
        <div className="col-span-12 lg:col-span-6">
          {data.eyebrow && <p className="h-fade eyebrow pill-tag mb-8 text-(--mute)">{data.eyebrow}</p>}
          <h1 className="display text-[clamp(2.9rem,6.6vw,7.6rem)] leading-[0.9]">
            {lines.map((line, i) => (
              <span key={i} className="split-line block">
                <span className="h-line-inner block will-change-transform">
                  <Highlight text={line} />
                </span>
              </span>
            ))}
          </h1>
          <p className="h-fade lede mt-8 max-w-md text-(--mute)">{data.subtext}</p>
          <div className="h-fade mt-10 flex flex-wrap items-center gap-6">
            <Magnetic>
              <Btn href={data.primary?.href} label={data.primary?.label} />
            </Magnetic>
            {data.secondary?.label && (
              <Link href={data.secondary.href || "#"} className="ulink text-sm font-semibold">
                {data.secondary.label}
              </Link>
            )}
          </div>

          {(side1 || side2) && (
            <div className="mt-14 hidden grid-cols-2 gap-4 sm:grid lg:max-w-lg">
              {[side1, side2].filter(Boolean).map((src, i) => (
                <div key={i} className={`h-side ${i ? "mt-10" : ""}`}>
                  <div className="h-img img-frame img-zoom aspect-[4/3]">
                    <Img src={src} className="h-full w-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature image with a live product card */}
        <div className="relative col-span-12 lg:col-span-6">
          <div className="bezel">
            <div className="h-img h-main img-frame aspect-[4/5] max-h-[78vh] w-full">
              <Img src={main} className="absolute left-0 top-[-15%] h-[115%] w-full object-cover" />
            </div>
          </div>
          {product && (
            <Link
              href={`/shop/${product.slug}`}
              className="h-card group absolute bottom-6 left-6 right-6 flex items-center gap-4 rounded-[calc(var(--radius)+4px)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] p-2.5 pr-3 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45)] ring-1 ring-white/30 backdrop-blur-xl sm:right-auto sm:max-w-sm"
            >
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-(--radius)">
                <Img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-(--mute)">In this room</span>
                <span className="display block truncate text-lg leading-tight">{product.name}</span>
                <span className="block text-sm font-semibold">{money(product.price, currency)}</span>
              </span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white transition-transform duration-500 group-hover:rotate-45">
                <Arrow />
              </span>
            </Link>
          )}
        </div>
      </div>
    </Shell>
  );
}
