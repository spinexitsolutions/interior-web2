import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/lib/db";
import { loadCtx, RenderSections } from "@/components/sections/render";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return page?.seoTitle ? { title: { absolute: page.seoTitle }, description: page.seoDescription || undefined } : {};
}

export default async function Home() {
  const page = await getPage("home");
  if (!page) notFound();
  return <RenderSections sections={page.sections} ctx={await loadCtx()} />;
}
