import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/lib/db";
import { loadCtx, RenderSections } from "@/components/sections/render";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug);
  if (!page) return {};
  return { title: page.seoTitle ? { absolute: page.seoTitle } : page.title, description: page.seoDescription || undefined };
}

export default async function CmsPage({ params, searchParams }: Props & { searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page || !page.published || slug === "home") notFound();
  return <RenderSections sections={page.sections} ctx={{ ...(await loadCtx()), query: await searchParams }} />;
}
