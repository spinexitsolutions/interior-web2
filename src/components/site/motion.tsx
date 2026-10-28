"use client";

import { useRef, useState, type ReactNode, type ElementType, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Asterisk } from "@phosphor-icons/react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** Resolves once the intro preloader (if any) has finished. */
export function whenReady(cb: () => void) {
  if (typeof document === "undefined") return () => {};
  if (document.documentElement.dataset.loading !== "1") {
    cb();
    return () => {};
  }
  const h = () => cb();
  window.addEventListener("app:ready", h, { once: true });
  return () => window.removeEventListener("app:ready", h);
}

/** Renders text where *word* becomes a highlighted span. */
export function Highlight({ text }: { text: string }) {
  const parts = (text || "").split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") ? (
          <span key={i} className="hl">
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/** Multi-line heading; each line slides up from a mask when scrolled into view. */
export function SplitHeading({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  immediate = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const lines = (text || "").split("\n");
  useGSAP(
    () => {
      const inner = ref.current!.querySelectorAll(".split-inner");
      if (prefersReduced()) return;
      gsap.set(inner, { yPercent: 110, rotate: 2 });
      const play = () =>
        gsap.to(inner, { yPercent: 0, rotate: 0, duration: 1.2, ease: "expo.out", stagger: 0.09, delay });
      if (immediate) return whenReady(play);
      ScrollTrigger.create({ trigger: ref.current, start: "top 88%", once: true, onEnter: play });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="split-line block">
          <span className="split-inner block will-change-transform">
            <Highlight text={l || " "} />
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Fades & lifts children (or each [data-reveal] child) into view. */
export function Reveal({
  children,
  className = "",
  y = 40,
  stagger = 0.08,
  delay = 0,
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  delay?: number;
  as?: ElementType;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      const targets = el.querySelectorAll("[data-reveal]");
      const t = targets.length ? targets : [el];
      if (prefersReduced()) return;
      gsap.set(t, { y, opacity: 0 });
      ScrollTrigger.batch(t as unknown as Element[], {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger, delay }),
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/** Image that drifts inside its frame while scrolling. */
export function ParallaxImg({
  src,
  alt = "",
  className = "",
  amount = 12,
  scale = 1.18,
  zoom = false,
}: {
  src: string;
  alt?: string;
  className?: string;
  amount?: number;
  scale?: number;
  zoom?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const img = ref.current!.querySelector("img");
      if (prefersReduced()) return;
      gsap.fromTo(
        img,
        { yPercent: -amount, scale },
        {
          yPercent: amount,
          scale: zoom ? 1 : scale,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={`img-frame ${className}`}>
      <Img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover will-change-transform" />
    </div>
  );
}

/** <img> with a graceful fallback when a remote URL fails. */
export function Img({ src, alt = "", className = "", ...rest }: React.ImgHTMLAttributes<HTMLImageElement> & { src?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed)
    return (
      <span
        aria-hidden
        style={rest.style}
        className={`${className} block bg-[linear-gradient(135deg,var(--surface),color-mix(in_srgb,var(--accent)_25%,var(--surface)))]`}
      />
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      // An image can fail before hydration attaches onError; catch that case on mount.
      ref={(el) => {
        if (el?.complete && el.naturalWidth === 0) setFailed(true);
      }}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}

/** Element that leans toward the cursor. */
export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return <ArrowUpRight weight="bold" className={`h-3.5 w-3.5 ${className}`} aria-hidden />;
}

/** The brand glyph used for highlights and list markers. */
export function Star({ className = "" }: { className?: string }) {
  return <Asterisk weight="bold" className={`inline-block h-[0.9em] w-[0.9em] ${className}`} aria-hidden />;
}

export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>
        <span>{children}</span>
        <span aria-hidden>{children}</span>
      </span>
    </span>
  );
}
