"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product, Project, Testimonial } from "@/lib/types";
import { gsap, ScrollTrigger, useGSAP, Img, Reveal, SplitHeading, ParallaxImg, Magnetic, Highlight, Arrow, Star } from "@/components/site/motion";
import { Btn, Eyebrow, Shell, money } from "./shared";

type L = { label?: string; href?: string };

/* -------------------------------------------------------------------------- */
/*                                  Services                                  */
/* -------------------------------------------------------------------------- */

export function Services({
  data,
}: {
  data: { eyebrow?: string; title?: string; tone?: string; items?: { title: string; tags?: string[]; image?: string; href?: string }[] };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const items = data.items ?? [];

  useGSAP(
    () => {
      const el = preview.current!;
      const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = ref.current!.getBoundingClientRect();
        xTo(e.clientX - r.left);
        yTo(e.clientY - r.top);
      };
      ref.current!.addEventListener("pointermove", move);
      return () => ref.current?.removeEventListener("pointermove", move);
    },
    { scope: ref },
  );

  useEffect(() => {
    gsap.to(preview.current, { scale: active >= 0 ? 1 : 0, opacity: active >= 0 ? 1 : 0, duration: 0.5, ease: "power3" });
  }, [active]);

  return (
    <Shell tone={data.tone} className="overflow-hidden">
      <div ref={ref} className="container-x relative py-28 md:py-40">
        <div className="mb-14 grid grid-cols-12 gap-6">
          <Eyebrow className="col-span-12 md:col-span-3">{data.eyebrow}</Eyebrow>
          <SplitHeading text={data.title || ""} className="display h-lg col-span-12 md:col-span-9" />
        </div>
        <div onMouseLeave={() => setActive(-1)}>
        <Reveal as="ul" className="border-t border-(--line)">
          {items.map((it, i) => (
            <li key={i} data-reveal onMouseEnter={() => setActive(i)} className="border-b border-(--line)">
              <Link href={it.href || "#"} className="group grid grid-cols-12 items-center gap-4 py-6 md:py-9" data-cursor="Explore">
                <span className="eyebrow col-span-2 text-(--mute) md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                <span className="display col-span-10 text-[clamp(1.8rem,4.6vw,4.6rem)] leading-none transition-[transform,color] duration-700 [transition-timing-function:var(--ease-out)] group-hover:translate-x-6 group-hover:text-accent md:col-span-7">
                  {it.title}
                </span>
                <span className="col-span-12 flex flex-wrap gap-2 md:col-span-3 md:justify-end">
                  {it.tags?.map((t) => (
                    <span key={t} className="rounded-full border border-(--line) px-3 py-1 text-xs text-(--mute)">
                      {t}
                    </span>
                  ))}
                </span>
                <span className="hidden justify-end md:col-span-1 md:flex">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-(--line) transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                    <Arrow />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </Reveal>
        </div>
        <div
          ref={preview}
          className="pointer-events-none absolute left-0 top-0 z-20 hidden h-[300px] w-[240px] -translate-x-1/2 -translate-y-1/2 scale-0 overflow-hidden rounded-(--radius) opacity-0 md:block"
        >
          {items.map((it, i) => (
            <Img
              key={i}
              src={it.image}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${active === i ? "scale-100 opacity-100" : "scale-125 opacity-0"}`}
            />
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Image + text                                */
/* -------------------------------------------------------------------------- */

export function Split({
  data,
}: {
  data: { eyebrow?: string; title?: string; body?: string; bullets?: string[]; image?: string; image2?: string; side?: string; cta?: L; tone?: string };
}) {
  const left = data.side !== "right";
  return (
    <Shell tone={data.tone}>
      <div className="container-x grid grid-cols-12 items-center gap-y-14 py-28 md:gap-x-6 md:py-40">
        <div className={`relative col-span-12 md:col-span-6 ${left ? "" : "md:order-2 md:col-start-7"}`}>
          <ParallaxImg src={data.image || ""} className="aspect-[4/5] w-[86%]" />
          {data.image2 && (
            <div className={`absolute -bottom-10 w-[42%] ${left ? "right-0" : "right-0"}`}>
              <ParallaxImg src={data.image2} amount={20} className="aspect-square border-[6px] border-(--tbg)" />
            </div>
          )}
        </div>
        <div className={`col-span-12 md:col-span-5 ${left ? "md:col-start-8" : "md:order-1 md:col-start-1"}`}>
          <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>
          <SplitHeading text={data.title || ""} className="display h-lg" />
          <Reveal className="mt-8 space-y-8">
            <p data-reveal className="lede text-(--mute)">
              {data.body}
            </p>
            {!!data.bullets?.length && (
              <ul data-reveal className="border-t border-(--line)">
                {data.bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-4 border-b border-(--line) py-4 font-medium">
                    <Star className="text-accent" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            <div data-reveal>
              <Btn href={data.cta?.href} label={data.cta?.label} />
            </div>
          </Reveal>
        </div>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Stats                                   */
/* -------------------------------------------------------------------------- */

export function Stats({ data }: { data: { eyebrow?: string; tone?: string; items?: { value: number; suffix?: string; label: string }[] } }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".stat-num").forEach((el) => {
        const end = Number(el.dataset.value || 0);
        const o = { v: 0 };
        gsap.to(o, {
          v: end,
          duration: 2.2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString("en-IN")),
        });
      });
    },
    { scope: ref },
  );
  return (
    <Shell tone={data.tone}>
      <div ref={ref} className="container-x py-24 md:py-32">
        <Eyebrow className="mb-14">{data.eyebrow}</Eyebrow>
        <Reveal className="grid grid-cols-2 border-t border-(--line) md:grid-cols-4">
          {(data.items ?? []).map((s, i) => (
            <div key={i} data-reveal className={`border-b border-(--line) py-8 pr-4 md:border-b-0 ${i ? "md:border-l md:pl-8" : ""}`}>
              <p className="display flex items-start text-[clamp(3.4rem,8vw,8rem)] leading-[0.9]">
                <span className="stat-num tabular-nums" data-value={s.value}>
                  0
                </span>
                <span className="ml-1 text-[0.35em] text-accent">{s.suffix}</span>
              </p>
              <p className="mt-4 text-sm text-(--mute)">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Process                                  */
/* -------------------------------------------------------------------------- */

export function Process({
  data,
}: {
  data: { eyebrow?: string; title?: string; image?: string; tone?: string; steps?: { title: string; text: string }[] };
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".pr-step").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 40%",
          toggleClass: { targets: el, className: "is-active" },
        });
      });
      gsap.fromTo(".pr-fill", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".pr-list", start: "top 60%", end: "bottom 50%", scrub: true } });
    },
    { scope: ref },
  );

  return (
    <Shell tone={data.tone}>
      <div ref={ref} className="container-x grid grid-cols-12 gap-y-12 py-28 md:gap-x-6 md:py-40">
        <div className="col-span-12 md:col-span-5">
          <div className="md:sticky md:top-28">
            <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>
            <SplitHeading text={data.title || ""} className="display h-lg" />
            {data.image && <ParallaxImg src={data.image} className="mt-10 hidden aspect-[4/3] w-4/5 md:block" />}
          </div>
        </div>
        <div className="pr-list relative col-span-12 md:col-span-6 md:col-start-7">
          <div className="absolute bottom-0 left-[1.15rem] top-0 w-px bg-(--line)">
            <div className="pr-fill h-full w-px origin-top bg-accent" />
          </div>
          {(data.steps ?? []).map((s, i) => (
            <div
              key={i}
              className="pr-step group relative pb-20 pl-16 opacity-35 transition-opacity duration-500 last:pb-0 [&.is-active]:opacity-100"
            >
              <span className="absolute left-0 top-1 grid h-[2.3rem] w-[2.3rem] place-items-center rounded-full border border-(--line) bg-(--tbg) text-xs font-bold transition-colors duration-500 group-[.is-active]:border-accent group-[.is-active]:bg-accent group-[.is-active]:text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="display h-md">{s.title}</h3>
              <p className="lede mt-4 max-w-md text-(--mute)">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Projects stack                              */
/* -------------------------------------------------------------------------- */

export function ProjectsStack({ data, projects }: { data: { eyebrow?: string; title?: string; cta?: L; tone?: string }; projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".pj-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card.querySelector(".pj-inner"), {
          scale: 0.9,
          filter: "brightness(0.55)",
          ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 12%", scrub: true },
        });
      });
    },
    { scope: ref, dependencies: [projects.length] },
  );

  return (
    <Shell tone={data.tone}>
      <div ref={ref} className="container-x py-28 md:py-36">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <div>
            <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>
            <SplitHeading text={data.title || ""} className="display h-xl" />
          </div>
          <Btn href={data.cta?.href} label={data.cta?.label} ghost />
        </div>
        <div>
          {projects.map((p, i) => (
            <div key={p.id} className="pj-card sticky top-[8vh] pb-6" style={{ zIndex: i + 1 }}>
              <Link
                href={`/projects/${p.slug}`}
                data-cursor="View"
                className="pj-inner group relative block h-[78vh] origin-top overflow-hidden rounded-(--radius) text-white will-change-transform"
              >
                <Img src={p.cover} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] [transition-timing-function:var(--ease-out)] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />
                <div className="absolute inset-x-0 bottom-0 grid grid-cols-12 items-end gap-6 p-6 md:p-10">
                  <h3 className="display h-giant col-span-12 md:col-span-8">{p.title}</h3>
                  <dl className="col-span-12 grid grid-cols-3 gap-4 text-sm md:col-span-4">
                    {[
                      ["Location", p.location],
                      ["Year", p.year],
                      ["Area", p.area],
                    ].map(([k, v]) => (
                      <div key={k} className="border-t border-white/30 pt-3">
                        <dt className="text-white/60">{k}</dt>
                        <dd className="font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Testimonials                                */
/* -------------------------------------------------------------------------- */

export function Testimonials({ data, items }: { data: { eyebrow?: string; tone?: string }; items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const DURATION = 7000;

  useEffect(() => {
    if (items.length < 2) return;
    const t = setTimeout(() => setI((v) => (v + 1) % items.length), DURATION);
    return () => clearTimeout(t);
  }, [i, items.length]);

  useGSAP(
    () => {
      gsap.fromTo(".ts-word", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.015 });
      gsap.fromTo(".ts-bar", { scaleX: 0 }, { scaleX: 1, duration: DURATION / 1000, ease: "none" });
    },
    { scope: ref, dependencies: [i] },
  );

  if (!items.length) return null;
  const t = items[i];

  return (
    <Shell tone={data.tone}>
      <div ref={ref} className="container-x grid grid-cols-12 gap-y-10 py-28 md:gap-x-6 md:py-40">
        <div className="col-span-12 md:col-span-3">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <span className="display mt-6 block text-[9rem] leading-[0.6] text-accent">“</span>
        </div>
        <div className="col-span-12 md:col-span-9">
          <blockquote key={i} className="display text-[clamp(1.7rem,3.6vw,3.6rem)] leading-[1.08]">
            {t.quote.split(" ").map((w, k) => (
              <span key={k} className="inline-block overflow-hidden pr-[0.25em] align-top">
                <span className="ts-word inline-block">{w}</span>
              </span>
            ))}
          </blockquote>
          <div className="mt-14 flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <Img src={t.avatar} className="h-14 w-14 rounded-full object-cover" />
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-(--mute)">{t.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {items.map((_, k) => (
                <button
                  key={k}
                  onClick={() => setI(k)}
                  aria-label={`Testimonial ${k + 1}`}
                  className="relative h-1 w-14 overflow-hidden rounded-full bg-(--line)"
                >
                  {k === i && <span className="ts-bar absolute inset-0 origin-left bg-accent" />}
                  {k < i && <span className="absolute inset-0 bg-(--fg)" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                     FAQ                                    */
/* -------------------------------------------------------------------------- */

export function Faq({ data }: { data: { eyebrow?: string; title?: string; tone?: string; items?: { q: string; a: string }[] } }) {
  const [open, setOpen] = useState(0);
  return (
    <Shell tone={data.tone}>
      <div className="container-x grid grid-cols-12 gap-y-10 py-28 md:gap-x-6 md:py-36">
        <div className="col-span-12 md:col-span-4">
          <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>
          <SplitHeading text={data.title || ""} className="display h-lg" />
        </div>
        <Reveal className="col-span-12 border-t border-(--line) md:col-span-7 md:col-start-6">
          {(data.items ?? []).map((f, i) => (
            <div key={i} data-reveal className="border-b border-(--line)">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-7 text-left">
                <span className="display text-[clamp(1.2rem,1.9vw,1.75rem)] leading-tight">{f.q}</span>
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-(--line) text-xl transition-all duration-500 ${
                    open === i ? "rotate-45 border-accent bg-accent text-white" : ""
                  }`}
                >
                  +
                </span>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-700 [transition-timing-function:var(--ease-out)] ${open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <p className="max-w-xl pb-8 text-(--mute)">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                     CTA                                    */
/* -------------------------------------------------------------------------- */

export function Cta({ data }: { data: { eyebrow?: string; title?: string; button?: L; image?: string; tone?: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.fromTo(".cta-title", { scale: 0.82 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "center center", scrub: true } });
      gsap.fromTo(".cta-bg", { yPercent: -15 }, { yPercent: 15, ease: "none", scrollTrigger: { trigger: ref.current, scrub: true } });
    },
    { scope: ref },
  );
  const hasImg = !!data.image;
  return (
    <Shell tone={data.tone} className="overflow-hidden">
      <div ref={ref} className="relative flex min-h-[90svh] items-center justify-center py-28">
        {hasImg && (
          <>
            <Img src={data.image} className="cta-bg absolute inset-0 h-[130%] w-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}
        <div className={`container-x relative flex flex-col items-center text-center ${hasImg ? "text-white" : ""}`}>
          <Eyebrow className="mb-8">{data.eyebrow}</Eyebrow>
          <h2 className="cta-title display h-giant">
            {(data.title || "").split("\n").map((l, i) => (
              <span key={i} className="block">
                <Highlight text={l} />
              </span>
            ))}
          </h2>
          {data.button?.label && (
            <Magnetic strength={0.5} className="mt-12">
              <Link
                href={data.button.href || "/contact"}
                className="group grid h-40 w-40 place-items-center rounded-full bg-(--fg) text-center text-sm font-semibold text-(--tbg) transition-transform duration-500 hover:scale-110 md:h-48 md:w-48"
              >
                <span className="flex flex-col items-center gap-2 px-6">
                  <Arrow className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                  {data.button.label}
                </span>
              </Link>
            </Magnetic>
          )}
        </div>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Page header                                */
/* -------------------------------------------------------------------------- */

export function PageHeader({ data }: { data: { eyebrow?: string; title?: string; subtitle?: string; image?: string; tone?: string } }) {
  return (
    <Shell tone={data.tone}>
      <div className="container-x pb-16 pt-32 md:pt-36">
        <Eyebrow className="mb-8">{data.eyebrow}</Eyebrow>
        <SplitHeading as="h1" immediate text={data.title || ""} className="display h-giant" />
        {data.subtitle && (
          <Reveal className="mt-10 max-w-[52ch]" delay={0.4}>
            <p className="lede text-(--mute)">{data.subtitle}</p>
          </Reveal>
        )}
        {data.image && <ParallaxImg src={data.image} className="mt-16 aspect-[16/10] w-full md:aspect-[21/9]" amount={14} zoom />}
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Products                                  */
/* -------------------------------------------------------------------------- */

export function ProductCard({ p, currency, big = false }: { p: Product; currency: string; big?: boolean; index?: number }) {
  const [a, b] = p.images;
  return (
    <Link href={`/shop/${p.slug}`} className="group block h-full" data-cursor="View">
      <div className={`bezel ${big ? "md:h-[calc(100%-5rem)]" : ""}`}>
      <div className={`img-frame relative w-full ${big ? "aspect-[4/5] md:aspect-auto md:h-full" : "aspect-[4/5]"}`}>
        <Img src={a} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-all duration-[1.1s] [transition-timing-function:var(--ease-out)] group-hover:scale-105" />
        {b && (
          <Img
            src={b}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-[1.1s] [transition-timing-function:var(--ease-out)] [clip-path:inset(100%_0_0_0)] group-hover:opacity-100 group-hover:[clip-path:inset(0_0_0_0)]"
          />
        )}
        <div className="absolute inset-x-3 top-3 flex justify-between">
          {!p.inStock && <span className="rounded-full bg-black/70 px-2.5 py-1 text-[0.65rem] font-semibold text-white">Made to order</span>}
          {p.compareAt > p.price && <span className="rounded-full bg-accent px-2.5 py-1 text-[0.65rem] font-semibold text-white">Sale</span>}
        </div>
        {p.colors?.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {p.colors.map((c) => (
              <span key={c.name} title={c.name} className="h-4 w-4 rounded-full border-2 border-white" style={{ background: c.hex }} />
            ))}
          </div>
        )}
      </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className={`display leading-tight ${big ? "h-md" : "text-xl"}`}>{p.name}</h3>
          <p className="mt-1 text-sm capitalize text-(--mute)">{p.category}</p>
        </div>
        <p className="shrink-0 text-right text-sm font-semibold">
          {money(p.price, currency)}
          {p.compareAt > p.price && <span className="block text-xs font-normal text-(--mute) line-through">{money(p.compareAt, currency)}</span>}
        </p>
      </div>
    </Link>
  );
}

export function ProductsSection({
  data,
  products,
  currency,
}: {
  data: { eyebrow?: string; title?: string; layout?: string; cta?: L; tone?: string };
  products: Product[];
  currency: string;
}) {
  const rail = data.layout === "rail";
  return (
    <Shell tone={data.tone} className="overflow-hidden">
      <div className="container-x py-28 md:py-36">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <div>
            <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>
            <SplitHeading text={data.title || ""} className="display h-xl max-w-4xl" />
          </div>
          <Btn href={data.cta?.href} label={data.cta?.label} ghost />
        </div>

        {rail ? (
          <Reveal className="no-scrollbar -mx-[var(--gutter)] flex snap-x gap-5 overflow-x-auto px-[var(--gutter)] pb-4">
            {products.map((p, i) => (
              <div key={p.id} data-reveal className="w-[72vw] shrink-0 snap-start md:w-[26vw]">
                <ProductCard p={p} currency={currency} index={i} />
              </div>
            ))}
          </Reveal>
        ) : (
          <Reveal className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-12 md:gap-x-6 md:gap-y-14" stagger={0.1}>
            {products.map((p, i) => (
              <div
                key={p.id}
                data-reveal
                className={i === 0 ? "col-span-2 md:col-span-6 md:row-span-2" : "col-span-1 md:col-span-3"}
              >
                <ProductCard p={p} currency={currency} big={i === 0} index={i} />
              </div>
            ))}
          </Reveal>
        )}
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Rich text                                 */
/* -------------------------------------------------------------------------- */

function inline(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p));
}

export function RichText({ data }: { data: { eyebrow?: string; body?: string; tone?: string } }) {
  const blocks = (data.body || "").split(/\n{2,}/);
  return (
    <Shell tone={data.tone}>
      <div className="container-x grid grid-cols-12 gap-6 py-24 md:py-32">
        <div className="col-span-12 md:col-span-3">
          <Eyebrow>{data.eyebrow}</Eyebrow>
        </div>
        <Reveal className="col-span-12 max-w-3xl space-y-6 md:col-span-8" stagger={0.05}>
          {blocks.map((b, i) => {
            if (b.startsWith("## "))
              return (
                <h2 key={i} data-reveal className="display h-md pt-6">
                  {b.slice(3)}
                </h2>
              );
            if (b.split("\n").every((l) => l.startsWith("- ")))
              return (
                <ul key={i} data-reveal className="space-y-2">
                  {b.split("\n").map((l, k) => (
                    <li key={k} className="flex gap-3">
                      <Star className="mt-1 shrink-0 text-accent" />
                      {inline(l.slice(2))}
                    </li>
                  ))}
                </ul>
              );
            return (
              <p key={i} data-reveal className="lede">
                {inline(b)}
              </p>
            );
          })}
        </Reveal>
      </div>
    </Shell>
  );
}
