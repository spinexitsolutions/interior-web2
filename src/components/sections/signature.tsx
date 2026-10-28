"use client";

/* Signature sections: the effects that make this site unlike a template.
   Each one is a self-contained client island driven by GSAP ScrollTrigger or pointer events. */

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import type { Product, Project, Testimonial } from "@/lib/types";
import { gsap, ScrollTrigger, useGSAP, whenReady, Img, Arrow, Highlight, SplitHeading, Magnetic, prefersReduced } from "@/components/site/motion";
import { Btn, Eyebrow, Shell, money } from "./shared";

type L = { label?: string; href?: string };

/* -------------------------------------------------------------------------- */
/*  1. Mask hero: a giant word is a window onto a room; scrolling walks you    */
/*     through the letters until the whole room is revealed.                   */
/* -------------------------------------------------------------------------- */

export function MaskHero({
  data,
}: {
  data: { word?: string; image?: string; headline?: string; subtext?: string; primary?: L; secondary?: L };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const word = (data.word || "aangan").trim();

  useGSAP(
    () => {
      const reduce = prefersReduced();
      if (!reduce) {
        gsap.set(".mh-char", { yPercent: 110 });
        gsap.set(".mh-intro", { opacity: 0, y: 20 });
      }
      const stop = whenReady(() => {
        if (reduce) return;
        gsap.to(".mh-char", { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.06 });
        gsap.to(".mh-intro", { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", delay: 0.6, stagger: 0.08 });
      });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.8 },
      });
      tl.to(".mh-mask", { scale: 14, ease: "power2.in", duration: 1 }, 0)
        .to(".mh-mask", { opacity: 0, ease: "none", duration: 0.25 }, 0.7)
        .fromTo(".mh-photo", { scale: 1.35 }, { scale: 1, ease: "none", duration: 1 }, 0)
        .to(".mh-intro", { opacity: 0, y: -30, duration: 0.2 }, 0)
        .fromTo(".mh-shade", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.8)
        .fromTo(".mh-final > *", { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.2 }, 0.85);
      return stop;
    },
    { scope: ref },
  );

  // Size the word so it always spans the viewport, whatever its length.
  const size = `min(40vh, calc(92vw / ${Math.max(word.length, 3) * 1.08}))`;

  return (
    <section ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 h-[100dvh] overflow-hidden bg-black">
        <Img src={data.image} className="mh-photo absolute inset-0 h-full w-full object-cover will-change-transform" />
        <div className="mh-shade absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        {/* Multiply blend: page colour everywhere, photo only through the white letters. */}
        <div className="mh-mask absolute inset-0 grid place-items-center bg-(--bg) mix-blend-multiply will-change-transform">
          <h1 aria-label={word} className="display flex overflow-hidden uppercase leading-[0.95] text-white" style={{ fontSize: size, fontWeight: 800 }}>
            {word.split("").map((c, i) => (
              <span key={i} className="mh-char inline-block">
                {c}
              </span>
            ))}
          </h1>
        </div>

        <div className="container-x pointer-events-none absolute inset-x-0 bottom-8 flex flex-wrap items-end justify-between gap-6 text-(--fg)">
          <p className="mh-intro lede max-w-sm text-(--mute)">{data.subtext}</p>
          <div className="mh-intro pointer-events-auto">
            <Btn href={data.primary?.href} label={data.primary?.label} />
          </div>
        </div>

        <div className="mh-final container-x absolute inset-x-0 bottom-0 pb-14 text-white">
          <h2 className="display h-xl max-w-5xl">
            {(data.headline || "").split("\n").map((l, i) => (
              <span key={i} className="block">
                <Highlight text={l} />
              </span>
            ))}
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Btn href={data.primary?.href} label={data.primary?.label} />
            {data.secondary?.label && (
              <Link href={data.secondary.href || "#"} className="ulink text-sm font-semibold">
                {data.secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  2. Manifesto: a paragraph where small photos open up between the words.   */
/* -------------------------------------------------------------------------- */

export function Manifesto({ data }: { data: { text?: string; images?: string[]; signature?: string; tone?: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const parts = (data.text || "").split(/(\[\d\])/g);

  useGSAP(
    () => {
      if (prefersReduced()) return;
      gsap.utils.toArray<HTMLElement>(".mf-img").forEach((el) => {
        gsap.fromTo(
          el,
          { width: "0em", opacity: 0 },
          { width: "2.4em", opacity: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", end: "top 45%", scrub: true } },
        );
      });
      gsap.fromTo(
        ".mf-word",
        { opacity: 0.18 },
        { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: ".mf-text", start: "top 75%", end: "bottom 55%", scrub: true } },
      );
    },
    { scope: ref },
  );

  return (
    <Shell tone={data.tone}>
      <div ref={ref} className="container-x py-32 md:py-48">
        <p className="mf-text display max-w-[18ch] text-[clamp(2rem,5.4vw,5.6rem)] leading-[1.12] md:max-w-none">
          {parts.map((p, i) => {
            const m = p.match(/^\[(\d)\]$/);
            if (m) {
              const src = data.images?.[Number(m[1]) - 1];
              return (
                <span key={i} className="mf-img relative mx-[0.12em] inline-block h-[0.8em] w-[2.4em] overflow-hidden rounded-full align-[-0.05em]">
                  <Img src={src} className="absolute inset-0 h-full w-full object-cover" />
                </span>
              );
            }
            return p
              .split(/(\s+)/)
              .map((w, k) => (w.trim() ? <span key={`${i}-${k}`} className="mf-word"><Highlight text={w} /></span> : w));
          })}
        </p>
        {data.signature && <p className="mt-14 text-sm font-semibold text-(--mute)">{data.signature}</p>}
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*  3. Shop the room: hotspots on a photo open product cards.                 */
/* -------------------------------------------------------------------------- */

type Spot = { x: number; y: number; product?: Product };

export function ShopTheRoom({
  data,
  spots,
  currency,
}: {
  data: { title?: string; eyebrow?: string; image?: string; tone?: string };
  spots: Spot[];
  currency: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useGSAP(
    () => {
      gsap.fromTo(".sr-frame", { clipPath: "inset(12% 10% 12% 10% round 32px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 24px)",
        ease: "none",
        scrollTrigger: { trigger: ".sr-frame", start: "top 90%", end: "top 25%", scrub: true },
      });
      gsap.from(".sr-dot", {
        scale: 0,
        stagger: 0.12,
        ease: "back.out(2)",
        duration: 0.7,
        scrollTrigger: { trigger: ".sr-frame", start: "top 40%" },
      });
    },
    { scope: ref },
  );

  return (
    <Shell tone={data.tone}>
      <div ref={ref} className="container-x py-24 md:py-36">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>
            <SplitHeading text={data.title || ""} className="display h-lg max-w-3xl" />
          </div>
          <p className="max-w-xs text-sm text-(--mute)">Tap a marker to see the piece.</p>
        </div>

        <div className="sr-frame relative aspect-[4/5] overflow-hidden rounded-(--radius) md:aspect-[16/9]" onClick={() => setOpen(null)}>
          <Img src={data.image} className="absolute inset-0 h-full w-full object-cover" />
          {spots.map((s, i) =>
            s.product ? (
              <div key={i} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(open === i ? null : i);
                  }}
                  aria-label={`Show ${s.product.name}`}
                  className="sr-dot relative -translate-x-1/2 -translate-y-1/2"
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-white/60" />
                  <span
                    className={`relative grid h-9 w-9 place-items-center rounded-full text-lg font-light transition-all duration-500 ${
                      open === i ? "rotate-45 bg-accent text-(--on-dark)" : "bg-white text-black"
                    }`}
                  >
                    +
                  </span>
                </button>
                <Link
                  href={`/shop/${s.product.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute z-10 flex w-64 items-center gap-3 rounded-2xl bg-(--bg)/90 p-2 pr-3 text-(--fg) shadow-2xl ring-1 ring-white/10 backdrop-blur-xl transition-all duration-500 [transition-timing-function:var(--ease-out)] ${
                    s.x > 60 ? "right-6" : "left-6"
                  } ${s.y > 60 ? "bottom-2" : "top-2"} ${open === i ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"}`}
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Img src={s.product.images[0]} className="h-full w-full object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{s.product.name}</span>
                    <span className="block text-sm text-(--mute)">{money(s.product.price, currency)}</span>
                  </span>
                  <Arrow className="shrink-0" />
                </Link>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*  4. Accordion strips: rooms as tall slices that open on hover.             */
/* -------------------------------------------------------------------------- */

export function Strips({
  data,
  items,
}: {
  data: { title?: string; eyebrow?: string; tone?: string };
  items: { title: string; subtitle?: string; image?: string; href?: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useGSAP(
    () => {
      gsap.from(".st-strip", {
        yPercent: 30,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    },
    { scope: ref },
  );

  return (
    <Shell tone={data.tone}>
      <div ref={ref} className="container-x py-24 md:py-36">
        <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>
        <SplitHeading text={data.title || ""} className="display h-lg mb-12 max-w-3xl" />
        <div className="flex h-[130vh] flex-col gap-2 md:h-[72vh] md:flex-row md:gap-3">
          {items.map((it, i) => {
            const on = active === i;
            return (
              <Link
                key={i}
                href={it.href || "#"}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`st-strip group relative min-h-0 min-w-0 overflow-hidden rounded-(--radius) transition-[flex-grow] duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                  on ? "grow-[6]" : "grow"
                } basis-0`}
              >
                <Img
                  src={it.image}
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ${on ? "scale-100" : "scale-125"}`}
                />
                <div className={`absolute inset-0 transition-colors duration-700 ${on ? "bg-black/25" : "bg-black/55"}`} />
                <span
                  className={`display absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-xl text-white transition-opacity duration-500 md:block ${
                    on ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {it.title}
                </span>
                <div
                  className={`absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-white transition-all duration-700 md:p-8 ${
                    on ? "translate-y-0 opacity-100 md:delay-200" : "translate-y-0 opacity-100 md:translate-y-6 md:opacity-0"
                  }`}
                >
                  <div>
                    <h3 className="display h-md">{it.title}</h3>
                    {it.subtitle && <p className="mt-2 hidden max-w-sm text-sm text-white/75 md:block">{it.subtitle}</p>}
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-black transition-transform duration-500 group-hover:rotate-45">
                    <Arrow />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*  5. Blinds: a project photo opens like window blinds as it scrolls in.     */
/* -------------------------------------------------------------------------- */

const SLATS = 12;

export function Blinds({ data, project }: { data: { eyebrow?: string; image?: string; tone?: string }; project?: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const image = data.image || project?.cover;

  useGSAP(
    () => {
      if (prefersReduced()) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top top", end: "+=110%", scrub: 0.6, pin: true },
      });
      tl.fromTo(".bl-slat", { scaleX: 0, rotateY: -70 }, { scaleX: 1, rotateY: 0, ease: "power2.out", stagger: 0.04, duration: 0.6 })
        .fromTo(".bl-copy > *", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.3 }, 0.55);
    },
    { scope: ref },
  );

  if (!image) return null;
  return (
    <Shell tone={data.tone} className="overflow-hidden">
      <div ref={ref} className="relative h-[100dvh]">
        <div className="absolute inset-0 flex [perspective:1400px]">
          {Array.from({ length: SLATS }).map((_, i) => (
            // Each slat shows its own vertical slice of one full-width photo.
            <div key={i} className="bl-slat relative h-full flex-1 origin-left overflow-hidden will-change-transform">
              <Img
                src={image}
                className="absolute top-0 h-full max-w-none object-cover"
                style={{ width: `${SLATS * 100}%`, left: `-${i * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        {project && (
          <div className="bl-copy container-x absolute inset-x-0 bottom-0 pb-12 text-white">
            {data.eyebrow && <p className="eyebrow mb-6 text-white/70">{data.eyebrow}</p>}
            <h2 className="display h-xl">{project.title}</h2>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
              <p className="max-w-md text-white/80">{project.summary}</p>
              <Link href={`/projects/${project.slug}`} className="btn">
                View the project
                <span className="arrow">
                  <Arrow />
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*  6. Ring: products on a 3D carousel that turns as you scroll.              */
/* -------------------------------------------------------------------------- */

export function Ring({ data, products, currency }: { data: { title?: string; eyebrow?: string; cta?: L; tone?: string }; products: Product[]; currency: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const n = products.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".rg-ring",
          { rotateY: 0 },
          {
            rotateY: -360 + 360 / n,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top top", end: `+=${n * 45}%`, scrub: 0.8, pin: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [n] },
  );

  if (!n) return null;
  return (
    <Shell tone={data.tone} className="overflow-hidden">
      <div ref={ref} className="relative flex min-h-[100dvh] flex-col justify-center py-24 md:py-0">
        <div className="container-x pointer-events-none relative z-10 mb-10 text-center md:absolute md:inset-x-0 md:top-24 md:mb-0">
          <Eyebrow className="mx-auto mb-5">{data.eyebrow}</Eyebrow>
          <h2 className="display h-lg">{data.title}</h2>
        </div>

        {/* Desktop: 3D ring */}
        <div className="hidden h-[70vh] items-center justify-center [perspective:2200px] md:flex">
          <div className="rg-ring relative h-[46vh] w-[24vh] [transform-style:preserve-3d]">
            {products.map((p, i) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="group absolute inset-0 [backface-visibility:hidden]"
                style={{ transform: `rotateY(${(360 / n) * i}deg) translateZ(calc(24vh * ${0.62 / Math.tan(Math.PI / n)} + 3vh))` }}
              >
                <div className="h-[82%] overflow-hidden rounded-(--radius)">
                  <Img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <p className="mt-3 truncate text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-(--mute)">{money(p.price, currency)}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile: swipeable row */}
        <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-[var(--gutter)] md:hidden">
          {products.map((p) => (
            <Link key={p.id} href={`/shop/${p.slug}`} className="w-[64vw] shrink-0 snap-start">
              <div className="aspect-[3/4] overflow-hidden rounded-(--radius)">
                <Img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              </div>
              <p className="mt-3 font-semibold">{p.name}</p>
              <p className="text-sm text-(--mute)">{money(p.price, currency)}</p>
            </Link>
          ))}
        </div>

        {data.cta?.label && (
          <div className="relative z-10 mt-10 flex justify-center md:absolute md:inset-x-0 md:bottom-10 md:mt-0">
            <Btn href={data.cta.href} label={data.cta.label} />
          </div>
        )}
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*  7. Floor plan: a plan draws itself, steps advance, then the real room.    */
/* -------------------------------------------------------------------------- */

const ROOMS = [
  { d: "M40 40 H470 V300 H40 Z", label: "Living", x: 255, y: 175 },
  { d: "M470 40 H760 V220 H470", label: "Kitchen", x: 615, y: 135 },
  { d: "M470 220 H760 V460 H470", label: "Bedroom", x: 615, y: 345 },
  { d: "M40 300 H300 V460 H40 Z", label: "Study", x: 170, y: 385 },
  { d: "M300 300 H470 V460 H300", label: "Bath", x: 385, y: 385 },
];
const FURNITURE = [
  "M80 80 h170 v50 h-170 z", // sofa
  "M120 170 h90 v60 h-90 z", // coffee table
  "M330 90 m-45 0 a45 45 0 1 0 90 0 a45 45 0 1 0 -90 0", // dining
  "M500 60 h240 v40 h-240 z", // counter
  "M560 270 h150 v160 h-150 z", // bed
  "M70 330 h140 v40 h-140 z", // desk
];

export function FloorPlan({ data }: { data: { title?: string; eyebrow?: string; image?: string; steps?: { title: string; text: string }[]; tone?: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const steps = data.steps ?? [];
  const [step, setStep] = useState(0);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=260%",
          scrub: 0.6,
          pin: true,
          onUpdate: (self) => setStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999))),
        },
      });
      tl.fromTo(".fp-wall", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", stagger: 0.08, duration: 0.35 }, 0)
        .fromTo(".fp-furn", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", stagger: 0.05, duration: 0.25 }, 0.3)
        .fromTo(".fp-label", { opacity: 0 }, { opacity: 1, stagger: 0.05, duration: 0.1 }, 0.45)
        .fromTo(".fp-photo", { clipPath: "circle(0% at 32% 40%)" }, { clipPath: "circle(120% at 32% 40%)", ease: "power1.in", duration: 0.35 }, 0.68);
    },
    { scope: ref, dependencies: [steps.length] },
  );

  return (
    <Shell tone={data.tone} className="overflow-hidden">
      <div ref={ref} className="container-x grid min-h-[100dvh] grid-cols-12 items-center gap-y-8 py-24 md:gap-x-10">
        <div className="col-span-12 md:col-span-4">
          <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>
          <h2 className="display text-[clamp(2rem,3.3vw,3.4rem)] leading-[1.02]">
            {(data.title || "").split("\n").map((l, i) => (
              <span key={i} className="block">
                <Highlight text={l} />
              </span>
            ))}
          </h2>
          <div className="relative mt-10 min-h-[11rem]">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 [transition-timing-function:var(--ease-out)] ${
                  step === i ? "translate-y-0 opacity-100" : step > i ? "-translate-y-6 opacity-0" : "translate-y-6 opacity-0"
                }`}
              >
                <p className="text-sm font-semibold text-accent">{s.title}</p>
                <p className="lede mt-3 text-(--mute)">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            {steps.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === step ? "w-10 bg-accent" : "w-4 bg-(--line)"}`} />
            ))}
          </div>
        </div>

        <div className="relative col-span-12 aspect-[8/5] md:col-span-8">
          <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full" fill="none">
            {ROOMS.map((r, i) => (
              <path key={i} d={r.d} pathLength={1} strokeDasharray="1" className="fp-wall stroke-(--fg)" strokeWidth={4} />
            ))}
            {FURNITURE.map((d, i) => (
              <path key={i} d={d} pathLength={1} strokeDasharray="1" className="fp-furn stroke-accent" strokeWidth={2} />
            ))}
            {ROOMS.map((r) => (
              <text key={r.label} x={r.x} y={r.y} textAnchor="middle" className="fp-label fill-(--mute) text-[15px] font-semibold uppercase tracking-[0.2em]">
                {r.label}
              </text>
            ))}
          </svg>
          {data.image && (
            <div className="fp-photo absolute inset-0 overflow-hidden rounded-(--radius)">
              <Img src={data.image} className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*  8. Trail: moving the cursor leaves a trail of photos behind it.           */
/* -------------------------------------------------------------------------- */

export function Trail({ data }: { data: { title?: string; images?: string[]; cta?: L; tone?: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const state = useRef({ x: 0, y: 0, i: 0 });
  const images = data.images ?? [];

  const spawn = (x: number, y: number) => {
    if (!layer.current || !images.length) return;
    const el = layer.current.children[state.current.i % layer.current.children.length] as HTMLElement;
    state.current.i++;
    gsap.killTweensOf(el);
    gsap.set(el, { x, y, xPercent: -50, yPercent: -50, zIndex: state.current.i, rotate: gsap.utils.random(-8, 8) });
    gsap
      .timeline()
      .fromTo(el, { scale: 0.3, opacity: 1 }, { scale: 1, duration: 0.5, ease: "expo.out" })
      .to(el, { scale: 0.6, opacity: 0, y: y + 40, duration: 0.7, ease: "power2.in" }, 0.6);
  };

  const onMove = (e: RPointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const s = state.current;
    if (Math.hypot(x - s.x, y - s.y) > 90) {
      s.x = x;
      s.y = y;
      spawn(x, y);
    }
  };

  // Touch devices get an ambient version that plays by itself.
  useEffect(() => {
    if (window.matchMedia("(hover: hover)").matches || prefersReduced()) return;
    const id = setInterval(() => {
      const r = ref.current?.getBoundingClientRect();
      if (r) spawn(gsap.utils.random(r.width * 0.15, r.width * 0.85), gsap.utils.random(r.height * 0.2, r.height * 0.8));
    }, 700);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Shell tone={data.tone} className="overflow-hidden">
      <div ref={ref} onPointerMove={onMove} className="relative flex min-h-[90vh] flex-col items-center justify-center py-28 text-center">
        <div ref={layer} className="pointer-events-none absolute inset-0">
          {Array.from({ length: Math.min(10, Math.max(images.length, 1) * 2) }).map((_, i) => (
            <div key={i} className="absolute left-0 top-0 h-48 w-40 overflow-hidden rounded-(--radius) opacity-0 shadow-2xl md:h-64 md:w-52">
              <Img src={images[i % Math.max(images.length, 1)]} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <h2 className="display h-giant pointer-events-none relative z-[100] mix-blend-difference text-white">
          {(data.title || "").split("\n").map((l, i) => (
            <span key={i} className="block">
              {l}
            </span>
          ))}
        </h2>
        {data.cta?.label && (
          <Magnetic className="relative z-[101] mt-12">
            <Btn href={data.cta.href} label={data.cta.label} />
          </Magnetic>
        )}
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*  9. Notes: testimonials as paper cards you can throw off the stack.        */
/* -------------------------------------------------------------------------- */

export function Notes({ data, items }: { data: { title?: string; eyebrow?: string; tone?: string }; items: Testimonial[] }) {
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const drag = useRef<{ id: number; x: number; y: number; el: HTMLElement } | null>(null);
  const tilts = [-4, 3, -2, 5, -5, 2];

  const throwTop = (el: HTMLElement, dir = 1) => {
    gsap.to(el, {
      x: dir * window.innerWidth * 0.7,
      y: -80,
      rotate: dir * 30,
      opacity: 0,
      duration: 0.6,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(el, { x: 0, y: 0, rotate: 0, opacity: 1 });
        setOrder((o) => [...o.slice(1), o[0]]);
      },
    });
  };

  const down = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, el };
  };
  const move = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    gsap.set(d.el, { x: dx, y: dy, rotate: dx / 18 });
  };
  const up = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 120) throwTop(d.el, Math.sign(dx));
    else gsap.to(d.el, { x: 0, y: 0, rotate: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
  };

  if (!items.length) return null;
  return (
    <Shell tone={data.tone} className="overflow-hidden">
      <div className="container-x grid grid-cols-12 items-center gap-y-16 py-28 md:gap-x-10 md:py-40">
        <div className="col-span-12 md:col-span-5">
          <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>
          <SplitHeading text={data.title || ""} className="display h-lg" />
          <p className="mt-6 max-w-sm text-(--mute)">Drag a card away to read the next one.</p>
          <button
            onClick={(e) => {
              const top = (e.currentTarget.closest("section") as HTMLElement).querySelector<HTMLElement>("[data-top='true']");
              if (top) throwTop(top);
            }}
            className="btn btn-ghost mt-8"
          >
            Next story
            <span className="arrow">
              <Arrow />
            </span>
          </button>
        </div>
        <div className="relative col-span-12 h-[440px] md:col-span-6 md:col-start-7">
          {order
            .slice()
            .reverse()
            .map((idx, k, arr) => {
              const t = items[idx];
              const isTop = k === arr.length - 1;
              return (
                <article
                  key={t.id}
                  data-top={isTop}
                  onPointerDown={isTop ? down : undefined}
                  onPointerMove={isTop ? move : undefined}
                  onPointerUp={isTop ? up : undefined}
                  onPointerCancel={isTop ? up : undefined}
                  className={`absolute inset-x-0 top-0 mx-auto flex h-[420px] max-w-md touch-none select-none flex-col justify-between rounded-[22px] bg-(--dark) p-8 text-(--on-dark) shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] ${
                    isTop ? "cursor-grab active:cursor-grabbing" : ""
                  }`}
                  style={{ transform: `rotate(${tilts[idx % tilts.length]}deg)` }}
                >
                  <p className="display text-[clamp(1.25rem,2vw,1.6rem)] leading-snug">“{t.quote}”</p>
                  <div className="flex items-center gap-3">
                    <Img src={t.avatar} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm opacity-60">{t.role}</p>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </Shell>
  );
}

export { ScrollTrigger };
