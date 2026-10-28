"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Project } from "@/lib/types";
import { Services } from "@/components/sections/content";
import { gsap, useGSAP, Img, ParallaxImg, Reveal, SplitHeading } from "./motion";

export function ProjectIndex({ projects }: { projects: Project[] }) {
  const [view, setView] = useState<"list" | "grid">("list");
  return (
    <div className="tone-light">
      <div className="container-x flex justify-end gap-2 pt-4">
        {(["list", "grid"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full border px-4 py-2 text-sm capitalize ${view === v ? "border-(--fg) bg-(--fg) text-(--tbg)" : "border-(--line)"}`}
          >
            {v}
          </button>
        ))}
      </div>
      {view === "list" ? (
        <Services
          data={{
            tone: "light",
            items: projects.map((p) => ({ title: p.title, tags: [p.location, p.year, p.type], image: p.cover, href: `/projects/${p.slug}` })),
          }}
        />
      ) : (
        <Reveal className="container-x grid gap-x-6 gap-y-16 py-20 md:grid-cols-2">
          {projects.map((p, i) => (
            <Link key={p.id} href={`/projects/${p.slug}`} data-reveal data-cursor="View" className={`group block ${i % 2 ? "md:mt-32" : ""}`}>
              <div className="img-frame img-zoom aspect-[4/5]">
                <Img src={p.cover} className="h-full w-full object-cover" />
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="display h-md transition-colors group-hover:text-accent">{p.title}</h3>
                <span className="text-sm text-(--mute)">{p.location} · {p.year}</span>
              </div>
            </Link>
          ))}
        </Reveal>
      )}
    </div>
  );
}

export function ProjectDetail({ p, next }: { p: Project; next?: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.fromTo(".pd-hero-img", { scale: 1.25 }, { scale: 1, duration: 2.2, ease: "expo.out" });
      gsap.to(".pd-hero-img", { yPercent: 20, ease: "none", scrollTrigger: { trigger: ".pd-hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.from(".pd-meta > *", { opacity: 0, y: 20, duration: 1, stagger: 0.08, delay: 0.5, ease: "expo.out" });
    },
    { scope: ref },
  );
  const paragraphs = p.body.split(/\n{2,}/).filter(Boolean);

  return (
    <div ref={ref}>
      <section className="pd-hero relative h-[100svh] overflow-hidden text-white">
        <Img src={p.cover} className="pd-hero-img absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        <div className="container-x absolute inset-x-0 bottom-0 pb-10">
          <p className="eyebrow mb-6 text-white/70">{p.type}, {p.location}</p>
          <SplitHeading as="h1" immediate text={p.title} className="display h-giant" />
          <dl className="pd-meta mt-10 grid grid-cols-2 gap-6 border-t border-white/30 pt-6 text-sm md:grid-cols-4">
            {[["Location", p.location], ["Year", p.year], ["Type", p.type], ["Area", p.area]].map(([k, v]) => (
              <div key={k}>
                <dt className="text-white/60">{k}</dt>
                <dd className="mt-1 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="tone-light">
        <div className="container-x grid grid-cols-12 gap-y-10 py-28 md:gap-x-6 md:py-40">
          <p className="eyebrow col-span-12 text-(--mute) md:col-span-3">The story</p>
          <div className="col-span-12 md:col-span-8">
            <SplitHeading text={p.summary} className="display h-md" />
            <Reveal className="mt-12 grid gap-8 md:grid-cols-2">
              {paragraphs.map((t, i) => (
                <p key={i} data-reveal className="lede text-(--mute)">{t}</p>
              ))}
            </Reveal>
          </div>
        </div>
        <div className="container-x grid grid-cols-12 gap-4 pb-28 md:gap-6">
          {p.gallery.map((src, i) => {
            const layout = ["col-span-12 aspect-[16/9]", "col-span-12 md:col-span-5 aspect-[4/5]", "col-span-12 md:col-span-7 aspect-[4/5] md:mt-40", "col-span-12 md:col-span-8 md:col-start-3 aspect-[3/2]"][i % 4];
            return <ParallaxImg key={i} src={src} className={layout} />;
          })}
        </div>
      </section>

      {next && (
        <Link href={`/projects/${next.slug}`} className="tone-dark group relative block overflow-hidden" data-cursor="Next">
          <Img src={next.cover} className="absolute inset-0 h-full w-full object-cover opacity-30 transition-all duration-[1.4s] group-hover:scale-105 group-hover:opacity-50" />
          <div className="container-x relative py-32 md:py-48">
            <p className="eyebrow text-(--mute)">Next project</p>
            <p className="display h-giant mt-6 transition-transform duration-700 group-hover:translate-x-6">{next.title} →</p>
          </div>
        </Link>
      )}
    </div>
  );
}
