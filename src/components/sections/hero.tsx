"use client";

import { useRef } from "react";
import { gsap, useGSAP, whenReady, Highlight, Img, Magnetic, Star, prefersReduced } from "@/components/site/motion";
import { Btn, Shell } from "./shared";

type HeroData = {
  eyebrow?: string;
  headline?: string;
  subtext?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  images?: string[];
  badge?: string;
};

export function Hero({ data }: { data: HeroData }) {
  const ref = useRef<HTMLDivElement>(null);
  const lines = (data.headline || "").split("\n");
  const [img1, img2, img3] = data.images ?? [];

  useGSAP(
    () => {
      if (prefersReduced()) return;
      gsap.set(".h-line-inner", { yPercent: 115 });
      gsap.set(".h-fade", { opacity: 0, y: 30 });
      gsap.set(".h-img", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".h-pill", { width: 0 });

      const stop = whenReady(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(".h-line-inner", { yPercent: 0, duration: 1.4, stagger: 0.1 })
          .to(".h-pill", { width: "1.5em", duration: 1.2 }, 0.5)
          .to(".h-img", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, stagger: 0.15, ease: "expo.inOut" }, 0.2)
          .to(".h-fade", { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.6);
      });

      // Scroll choreography: rows slide apart, images drift at different speeds.
      const st = { trigger: ref.current, start: "top top", end: "bottom top", scrub: true };
      gsap.utils.toArray<HTMLElement>(".h-line").forEach((el, i) => {
        gsap.to(el, { xPercent: i % 2 ? 8 : -6, ease: "none", scrollTrigger: st });
      });
      gsap.to(".h-par-a", { yPercent: -18, ease: "none", scrollTrigger: st });
      gsap.to(".h-par-b", { yPercent: -45, ease: "none", scrollTrigger: st });
      gsap.to(".h-badge", { rotate: 180, ease: "none", scrollTrigger: st });
      return stop;
    },
    { scope: ref },
  );

  return (
    <Shell tone="light" className="overflow-hidden">
      <div ref={ref} className="container-x relative min-h-[100dvh] pb-16 pt-24">
        <div className="h-fade mb-8 flex items-center justify-between gap-6 border-b border-(--line) pb-4">
          <p className="eyebrow text-(--mute)">{data.eyebrow}</p>
        </div>

        <h1 className="display relative z-10 text-[clamp(2.6rem,8.4vw,10.5rem)] leading-[0.88]">
          {lines.map((line, i) => (
            <span key={i} className="h-line block">
              <span className="split-line block">
                <span className="h-line-inner flex items-center flex-wrap gap-x-[0.16em] will-change-transform md:flex-nowrap md:whitespace-nowrap">
                  <Highlight text={line} />
                  {i === 0 && img3 && (
                    <span className="h-pill relative hidden md:inline-block h-[0.7em] w-[1.5em] shrink-0 overflow-hidden rounded-full align-middle">
                      <Img src={img3} className="absolute inset-0 h-full w-full object-cover" />
                    </span>
                  )}
                </span>
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-10 grid grid-cols-12 gap-x-4 gap-y-10 md:mt-14 md:gap-x-6">
          <div className="col-span-12 flex flex-col gap-10 md:col-span-4">
            <p className="h-fade lede max-w-sm text-(--mute)">{data.subtext}</p>
            <div className="h-fade flex flex-wrap items-center gap-5">
              <Magnetic>
                <Btn href={data.primary?.href} label={data.primary?.label} />
              </Magnetic>
              {data.secondary?.label && (
                <a href={data.secondary.href} className="ulink text-sm font-semibold">
                  {data.secondary.label}
                </a>
              )}
            </div>
          </div>

          <div className="h-par-a relative col-span-8 md:col-span-5">
            <div className="bezel">
              <div className="h-img img-frame img-zoom aspect-[4/5] md:aspect-[5/6]">
                <Img src={img1} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div className="h-par-b relative col-span-4 md:col-span-3 md:pt-28">
            <div className="h-img img-frame img-zoom aspect-[3/4]">
              <Img src={img2} alt="" className="h-full w-full object-cover" />
            </div>
            {data.badge && <Badge text={data.badge} />}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Badge({ text }: { text: string }) {
  const chars = text.split("");
  return (
    <div className="h-fade h-badge absolute -left-10 -top-10 z-10 grid h-28 w-28 place-items-center md:-left-16 md:top-6 md:h-36 md:w-36">
      <div className="spin-slow absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-(--fg) text-[8.6px] font-semibold uppercase tracking-[0.18em]">
            <textPath href="#badge-circle" textLength="236" lengthAdjust="spacing">{chars.join("")}</textPath>
          </text>
        </svg>
      </div>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-xl text-white md:h-14 md:w-14"><Star /></span>
    </div>
  );
}
