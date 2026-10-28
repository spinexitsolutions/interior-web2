"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import Lenis from "lenis";
import type { Settings } from "@/lib/types";
import { gsap, ScrollTrigger, useGSAP, Img, Roll, Arrow, Magnetic } from "./motion";

/* -------------------------------------------------------------------------- */
/*                                Smooth scroll                               */
/* -------------------------------------------------------------------------- */

const LenisCtx = createContext<RefObject<Lenis | null> | null>(null);
export const useLenis = () => useContext(LenisCtx);

export function SmoothScroll({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.current = l;
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(t);
  }, [pathname]);

  // Late-loading images change layout; keep trigger positions honest.
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}

/* -------------------------------------------------------------------------- */
/*                                  Preloader                                 */
/* -------------------------------------------------------------------------- */

export function Preloader({ word }: { word: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);

  useGSAP(
    () => {
      const root = document.documentElement;
      let seen = false;
      try {
        seen = sessionStorage.getItem("intro-seen") === "1";
      } catch {}
      const finish = () => {
        root.dataset.loading = "0";
        window.dispatchEvent(new Event("app:ready"));
        setShow(false);
      };
      if (seen) return finish();
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {}

      const counter = { v: 0 };
      const num = ref.current!.querySelector(".pl-num")!;
      const tl = gsap.timeline({ onComplete: finish });
      tl.from(".pl-char", { yPercent: 120, duration: 1, ease: "expo.out", stagger: 0.05 })
        .to(counter, {
          v: 100,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: () => (num.textContent = String(Math.round(counter.v)).padStart(3, "0")),
        }, 0)
        .to(".pl-bar", { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0)
        .to(".pl-char", { yPercent: -120, duration: 0.7, ease: "expo.in", stagger: 0.03 }, ">-0.1")
        .to(ref.current, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, ">-0.3")
        .add(() => {
          root.dataset.loading = "0";
          window.dispatchEvent(new Event("app:ready"));
        }, "<0.35");
    },
    { scope: ref },
  );

  if (!show) return null;
  return (
    <div
      ref={ref}
      className="tone-dark fixed inset-0 z-[100] flex flex-col justify-between p-[var(--gutter)]"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <div className="eyebrow flex justify-between text-(--mute)">
        <span>Loading the studio</span>
        <span className="pl-num tabular-nums">000</span>
      </div>
      <div className="display h-giant flex overflow-hidden">
        {word.split("").map((c, i) => (
          <span key={i} className="pl-char inline-block">
            {c === " " ? " " : c}
          </span>
        ))}
      </div>
      <div className="h-px w-full bg-(--line)">
        <div className="pl-bar h-px origin-left scale-x-0 bg-accent" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Custom cursor                               */
/* -------------------------------------------------------------------------- */

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.documentElement.classList.add("has-custom-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.15, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.15, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3" });
    gsap.set([dot.current, ring.current], { opacity: 1 });

    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: Event) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, textarea, select");
      const text = t?.dataset.cursor ?? "";
      setLabel(text);
      gsap.to(ring.current, {
        scale: text ? 2.8 : t ? 1.7 : 1,
        backgroundColor: text ? "var(--accent)" : "rgba(0,0,0,0)",
        borderColor: text ? "var(--accent)" : "currentColor",
        duration: 0.4,
        ease: "power3",
      });
      gsap.to(dot.current, { scale: t ? 0 : 1, duration: 0.3 });
    };
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[95] text-white mix-blend-difference" aria-hidden>
      <div ref={dot} className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-current opacity-0" />
      <div
        ref={ring}
        className="absolute -left-5 -top-5 grid h-10 w-10 place-items-center rounded-full border border-current opacity-0"
      >
        <span className="text-[5px] font-bold uppercase tracking-[0.15em] text-white">{label}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */

export function Header({ settings, menuImages }: { settings: Settings; menuImages: string[] }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lenis = useLenis();
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Hide while scrolling down, reveal on the way up. ScrollTrigger batches this with the frame.
  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setHidden(self.scroll() > 320 && self.direction === 1 && !openRef.current),
    });
  });

  useEffect(() => {
    if (open) lenis?.current?.stop();
    else lenis?.current?.start();
  }, [open, lenis]);

  const { brand, nav, navCta } = settings;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-3 z-[80] px-3 transition-transform duration-700 [transition-timing-function:var(--ease-out)] md:top-4 ${
          hidden ? "-translate-y-[140%]" : ""
        }`}
      >
        <div
          className={`tone-light mx-auto flex h-16 max-w-[1180px] items-center justify-between rounded-full py-2 pl-6 pr-2 shadow-[0_10px_40px_-12px_color-mix(in_srgb,var(--ink)_25%,transparent)] ring-1 ring-(--line) backdrop-blur-xl transition-colors duration-500 ${
            open ? "bg-transparent! shadow-none ring-transparent" : "bg-[color-mix(in_srgb,var(--bg)_72%,transparent)]!"
          }`}
        >
          <Link href="/" onClick={() => setOpen(false)} className={`display text-[1.6rem] leading-none tracking-tight transition-colors ${open ? "text-on-dark" : ""}`} aria-label={brand.name}>
            {brand.logoImage ? (
              <Img src={brand.logoImage} alt={brand.name} className="h-8 w-auto" />
            ) : (
              <span>
                {brand.logoText}
                <span className="text-accent">.</span>
              </span>
            )}
          </Link>

          <nav className={`hidden items-center gap-8 text-[0.9rem] font-medium transition-opacity md:flex ${open ? "pointer-events-none opacity-0" : ""}`}>
            {nav.map((l, i) => (
              <Link key={l.href + i} href={l.href} className="group">
                <Roll>{l.label}</Roll>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={navCta.href || "/contact"}
              className={`hidden h-12 items-center rounded-full bg-(--fg) px-5 text-[0.85rem] font-semibold text-(--tbg) transition-[transform,opacity] active:scale-[0.98] lg:inline-flex ${open ? "pointer-events-none opacity-0" : ""}`}
            >
              <Roll>{navCta.label}</Roll>
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className={`flex h-12 items-center gap-3 rounded-full pl-5 pr-1.5 text-[0.85rem] font-semibold ring-1 transition-colors active:scale-[0.98] ${
                open ? "text-on-dark ring-white/25" : "ring-(--line)"
              }`}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-accent">
                <span className={`absolute h-[1.5px] w-3.5 bg-white transition-transform duration-500 [transition-timing-function:var(--ease-out)] ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
                <span className={`absolute h-[1.5px] w-3.5 bg-white transition-transform duration-500 [transition-timing-function:var(--ease-out)] ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>
      <MenuOverlay open={open} settings={settings} images={menuImages} onNavigate={() => setOpen(false)} />
    </>
  );
}

function MenuOverlay({ open, settings, images, onNavigate }: { open: boolean; settings: Settings; images: string[]; onNavigate: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline>(null);
  const [active, setActive] = useState(0);
  const links = [{ label: "Home", href: "/" }, ...settings.nav];

  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true })
        .set(ref.current, { visibility: "visible" })
        .fromTo(ref.current, { clipPath: "circle(0% at 95% 4%)" }, { clipPath: "circle(150% at 95% 4%)", duration: 1.1, ease: "expo.inOut" })
        .from(".m-link", { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.06 }, "-=0.5")
        .from(".m-fade", { opacity: 0, y: 20, duration: 0.8, stagger: 0.05 }, "<0.2");
    },
    { scope: ref },
  );

  useEffect(() => {
    if (!tl.current) return;
    if (open) tl.current.timeScale(1).play();
    else tl.current.timeScale(1.6).reverse();
  }, [open]);

  return (
    <div
      ref={ref}
      className="tone-dark invisible fixed inset-0 z-[70] overflow-hidden"
      style={{ clipPath: "circle(0% at 95% 4%)" }}
    >
      <div className="container-x grid h-full grid-cols-12 gap-6 pb-10 pt-32">
        <nav className="col-span-12 flex flex-col justify-center md:col-span-7">
          {links.map((l, i) => (
            <Link
              key={l.href + i}
              href={l.href}
              onMouseEnter={() => setActive(i)}
              onClick={onNavigate}
              className="group flex items-baseline overflow-hidden py-1"
            >
              <span className="m-link display inline-block text-[clamp(2.6rem,7.5vw,6.5rem)] transition-[color,transform] duration-500 group-hover:translate-x-4 group-hover:text-accent">
                {l.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="col-span-5 hidden flex-col justify-between md:flex">
          <div className="m-fade relative aspect-[4/5] w-full max-w-sm self-end overflow-hidden rounded-(--radius)">
            {images.map((src, i) => (
              <Img
                key={i}
                src={src}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                  i === active % images.length ? "scale-100 opacity-100" : "scale-110 opacity-0"
                }`}
              />
            ))}
          </div>
          <div className="m-fade grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="eyebrow mb-3 text-(--mute)">Say hello</p>
              <a href={`mailto:${settings.contact.email}`} className="ulink block">
                {settings.contact.email}
              </a>
              <a href={`tel:${settings.contact.phone}`} className="ulink block">
                {settings.contact.phone}
              </a>
            </div>
            <div>
              <p className="eyebrow mb-3 text-(--mute)">Follow</p>
              {settings.socials.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="ulink block">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Footer                                   */
/* -------------------------------------------------------------------------- */

export function Footer({ settings }: { settings: Settings }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.from(".f-char", {
        yPercent: 100,
        ease: "expo.out",
        duration: 1.4,
        stagger: 0.05,
        scrollTrigger: { trigger: ".f-big", start: "top 95%" },
      });
    },
    { scope: ref },
  );
  const { footer, contact, socials, nav, brand } = settings;
  const word = footer.bigText || brand.logoText;

  return (
    <footer ref={ref} className="tone-dark relative overflow-hidden pt-24">
      <div className="container-x grid grid-cols-12 gap-y-12 md:gap-x-6">
        <div className="col-span-12 md:col-span-5">
          <p className="display h-md max-w-md">{footer.note}</p>
          <Magnetic className="mt-10">
            <Link href={settings.navCta.href || "/contact"} className="btn" data-cursor="Go">
              {settings.navCta.label}
              <span className="arrow">
                <Arrow />
              </span>
            </Link>
          </Magnetic>
        </div>
        <div className="col-span-6 md:col-span-2 md:col-start-7">
          <p className="eyebrow mb-5 text-(--mute)">Pages</p>
          <ul className="space-y-2">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="ulink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-6 md:col-span-2">
          <p className="eyebrow mb-5 text-(--mute)">Social</p>
          <ul className="space-y-2">
            {socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noreferrer" className="ulink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-12 md:col-span-3">
          <p className="eyebrow mb-5 text-(--mute)">Studio</p>
          <p className="whitespace-pre-line">{contact.address}</p>
          <p className="mt-3 text-(--mute)">{contact.hours}</p>
          <a href={`mailto:${contact.email}`} className="ulink mt-3 inline-block">
            {contact.email}
          </a>
        </div>
      </div>

      <div className="container-x mt-20 flex flex-wrap justify-between gap-4 border-t border-(--line) py-6 text-xs text-(--mute)">
        <span>{footer.copyright}</span>
        <span>{brand.tagline}</span>
      </div>

      <div className="f-big display pointer-events-none flex select-none justify-center overflow-hidden leading-[0.78] text-[clamp(5rem,27vw,30rem)] -mb-[0.06em]">
        {word.split("").map((c, i) => (
          <span key={i} className="f-char inline-block">
            {c}
          </span>
        ))}
      </div>
    </footer>
  );
}

/** Content fade-in on every navigation. */
export function PageFade({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out" });
  });
  return <div ref={ref}>{children}</div>;
}
