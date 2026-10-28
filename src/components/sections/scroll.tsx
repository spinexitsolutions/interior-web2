"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, Img, SplitHeading, ParallaxImg, Star, prefersReduced } from "@/components/site/motion";
import { Eyebrow, Shell } from "./shared";

/* -------------------------------------------------------------------------- */
/*                                   Marquee                                  */
/* -------------------------------------------------------------------------- */

export function Marquee({ data }: { data: { items?: string[]; outline?: boolean; speed?: number; tone?: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const items = data.items?.length ? data.items : ["Design", "Craft", "Living"];

  useGSAP(
    () => {
      if (prefersReduced()) return;
      const tween = gsap.to(".mq-track", { xPercent: -50, ease: "none", duration: data.speed || 25, repeat: -1 });
      let dir = 1;
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (self.direction !== dir) dir = self.direction;
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 6);
          gsap.to(tween, { timeScale: dir * boost, duration: 0.2, overwrite: true });
          gsap.to(tween, { timeScale: dir, duration: 1.2, delay: 0.2, ease: "power2.out" });
        },
      });
      gsap.to(".mq-star", { rotate: 360, repeat: -1, duration: 8, ease: "none" });
    },
    { scope: ref },
  );

  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((w, i) => (
        <span key={i} className="flex items-center">
          <span className={`display px-[0.35em] text-[clamp(3.5rem,10vw,10rem)] leading-[1.05] ${data.outline ? "outline-text" : ""}`}>
            {w}
          </span>
          <span className="mq-star inline-grid text-[clamp(1.5rem,3.4vw,3rem)] text-accent"><Star /></span>
        </span>
      ))}
    </div>
  );

  return (
    <Shell tone={data.tone} className="overflow-hidden border-y border-(--line) py-6 md:py-10">
      <div ref={ref}>
        <div className="mq-track flex w-max will-change-transform">
          {row}
          {row}
        </div>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Statement                                 */
/* -------------------------------------------------------------------------- */

export function Statement({
  data,
}: {
  data: { eyebrow?: string; text?: string; signature?: string; images?: string[]; tone?: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const words = (data.text || "").split(/\s+/).filter(Boolean);
  const [a, b] = data.images ?? [];

  useGSAP(
    () => {
      gsap.fromTo(
        ".st-word",
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: ".st-text", start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
      gsap.fromTo(".st-a", { y: 120 }, { y: -120, ease: "none", scrollTrigger: { trigger: ref.current, scrub: true } });
      gsap.fromTo(".st-b", { y: 200, rotate: 6 }, { y: -160, rotate: -4, ease: "none", scrollTrigger: { trigger: ref.current, scrub: true } });
    },
    { scope: ref },
  );

  return (
    <Shell tone={data.tone} className="overflow-hidden">
      <div ref={ref} className="container-x relative grid grid-cols-12 gap-6 py-28 md:py-44">
        <div className="col-span-12 md:col-span-2">
          <Eyebrow>{data.eyebrow}</Eyebrow>
        </div>
        <div className="col-span-12 md:col-span-9">
          <p className="st-text display text-[clamp(1.9rem,4.3vw,4.4rem)] leading-[1.04]">
            {words.map((w, i) => (
              <span key={i} className="st-word inline-block pr-[0.25em]">
                {w}
              </span>
            ))}
          </p>
          {data.signature && <p className="mt-10 text-sm font-semibold text-(--mute)">{data.signature}</p>}
        </div>
        {a && (
          <div className="st-a pointer-events-none absolute right-[4%] top-[8%] hidden w-[16vw] md:block">
            <div className="img-frame aspect-[3/4]">
              <Img src={a} className="h-full w-full object-cover" />
            </div>
          </div>
        )}
        {b && (
          <div className="st-b pointer-events-none absolute bottom-[2%] left-[6%] hidden w-[13vw] md:block">
            <div className="img-frame aspect-square">
              <Img src={b} className="h-full w-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Expand image                                */
/* -------------------------------------------------------------------------- */

export function ExpandImage({ data }: { data: { image?: string; eyebrow?: string; title?: string; caption?: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top top", end: "+=120%", scrub: true, pin: true },
      });
      tl.fromTo(".ex-frame", { clipPath: "inset(22% 30% 22% 30% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" })
        .fromTo(".ex-img", { scale: 1.35 }, { scale: 1, ease: "none" }, 0)
        .fromTo(".ex-side", { opacity: 1 }, { opacity: 0, ease: "none", duration: 0.3 }, 0)
        .fromTo(".ex-title", { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, ease: "power2.out", duration: 0.4 }, 0.6);
    },
    { scope: ref },
  );

  return (
    <section className="tone-light relative">
      <div ref={ref} className="relative h-[100svh] overflow-hidden">
        <div className="ex-side container-x absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2 justify-between">
          <span className="display h-lg">{data.eyebrow?.split(" ")[0]}</span>
          <span className="display h-lg">{data.eyebrow?.split(" ").slice(1).join(" ")}</span>
        </div>
        <div className="ex-frame absolute inset-0 z-10 overflow-hidden" data-cursor="Wow">
          <Img src={data.image} className="ex-img absolute inset-0 h-full w-full object-cover will-change-transform" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />
          <div className="ex-title container-x absolute inset-x-0 bottom-10 flex flex-wrap items-end justify-between gap-4 text-white">
            <h2 className="display h-giant">{data.title}</h2>
            <p className="max-w-xs text-sm text-white/80">{data.caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Horizontal scroll                             */
/* -------------------------------------------------------------------------- */

export type HCard = { title: string; subtitle?: string; image?: string; href?: string };

export function Horizontal({ data, cards }: { data: { eyebrow?: string; title?: string; tone?: string }; cards: HCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const track = ref.current!.querySelector<HTMLElement>(".hz-track")!;
        const dist = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: () => `+=${dist()}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>(".hz-img").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -12 },
            {
              xPercent: 12,
              ease: "none",
              scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
            },
          );
        });
        gsap.to(".hz-progress", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: () => `+=${dist()}`, scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [cards.length] },
  );

  return (
    <Shell tone={data.tone} className="overflow-hidden">
      <div ref={ref} className="relative md:h-[100svh]">
        <div className="hz-track no-scrollbar flex h-full items-center gap-5 overflow-x-auto px-[var(--gutter)] py-24 md:w-max md:gap-8 md:overflow-visible md:py-0">
          <div className="flex w-[80vw] shrink-0 flex-col justify-center pr-6 md:w-[34vw]">
            <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>
            <SplitHeading text={data.title || ""} className="display h-xl" />
          </div>
          {cards.map((c, i) => (
            <Link
              key={i}
              href={c.href || "#"}
              data-cursor="Open"
              className="group relative block h-[62vh] w-[78vw] shrink-0 md:h-[68vh] md:w-[30vw]"
            >
              <div className="img-frame h-[calc(100%-4.5rem)] w-full">
                <Img src={c.image} className="hz-img absolute inset-0 h-full w-[124%] max-w-none object-cover transition-transform duration-[1.2s] group-hover:scale-105" style={{ left: "-12%" }} />
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <h3 className="display h-md transition-colors group-hover:text-accent">{c.title}</h3>
                  {c.subtitle && <p className="mt-1 line-clamp-1 text-sm text-(--mute)">{c.subtitle}</p>}
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-(--line) transition-all group-hover:rotate-[-45deg] group-hover:bg-accent group-hover:text-white">
                  →
                </span>
              </div>
            </Link>
          ))}
          <div className="w-[10vw] shrink-0" />
        </div>
        <div className="absolute inset-x-[var(--gutter)] bottom-8 hidden h-px bg-(--line) md:block">
          <div className="hz-progress h-px origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </Shell>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Scattered gallery                             */
/* -------------------------------------------------------------------------- */

const SPOTS = [
  "left-[3%] top-[6%] w-[30vw] md:w-[17vw] aspect-[3/4]",
  "right-[5%] top-[2%] w-[26vw] md:w-[14vw] aspect-square",
  "left-[30%] top-[64%] w-[24vw] md:w-[12vw] aspect-[4/5]",
  "right-[16%] top-[56%] w-[34vw] md:w-[20vw] aspect-[4/3]",
  "left-[6%] top-[72%] w-[22vw] md:w-[11vw] aspect-square hidden md:block",
  "right-[34%] top-[8%] w-[18vw] md:w-[10vw] aspect-[3/4] hidden md:block",
];

export function Gallery({ data }: { data: { eyebrow?: string; title?: string; images?: string[]; tone?: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".gl-item").forEach((el, i) => {
        const speed = [-160, -320, -220, -120, -380, -260][i % 6];
        gsap.fromTo(el, { y: 160 }, { y: speed, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.fromTo(".gl-title", { scale: 0.86 }, { scale: 1.05, ease: "none", scrollTrigger: { trigger: ref.current, scrub: true } });
    },
    { scope: ref },
  );

  return (
    <Shell tone={data.tone} className="overflow-hidden">
      <div ref={ref} className="relative h-[130vh] md:h-[150vh]">
        <div className="gl-title absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
          <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow>
          <SplitHeading text={data.title || ""} className="display h-xl" />
        </div>
        {(data.images ?? []).slice(0, 6).map((src, i) => (
          <div key={i} className={`gl-item absolute ${SPOTS[i]}`}>
            <div className="img-frame img-zoom h-full w-full">
              <Img src={src} className="h-full w-full object-cover" />
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export { ParallaxImg };
