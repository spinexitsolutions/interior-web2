import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getSettings } from "@/lib/db";
import { googleFontsUrl } from "@/lib/schemas";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, brand } = await getSettings();
  return {
    title: { default: seo.title || brand.name, template: `%s | ${brand.name}` },
    description: seo.description,
    openGraph: { images: seo.ogImage ? [seo.ogImage] : [] },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { theme, features } = await getSettings();
  const vars = {
    "--brand-bg": theme.bg,
    "--brand-surface": theme.surface,
    "--brand-ink": theme.ink,
    "--brand-muted": theme.muted,
    "--brand-accent": theme.accent,
    "--brand-dark": theme.dark,
    "--brand-on-dark": theme.onDark,
    "--radius": `${theme.radius ?? 18}px`,
    "--font-display-family": `"${theme.displayFont}", ui-sans-serif, system-ui, sans-serif`,
    "--font-body-family": `"${theme.bodyFont}", ui-sans-serif, system-ui, sans-serif`,
    "--display-weight": theme.displayWeight,
    "--display-tracking": `${theme.displayTracking ?? -0.04}em`,
  } as CSSProperties;

  return (
    <html lang="en" style={vars} data-mode={theme.mode || "auto"} data-loading={features.preloader ? "1" : "0"} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={googleFontsUrl([theme.displayFont, theme.bodyFont, "Manrope"])} />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
