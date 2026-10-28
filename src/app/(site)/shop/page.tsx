import type { Metadata } from "next";
import { getPage } from "@/lib/db";
import { loadCtx, RenderSections } from "@/components/sections/render";
import { ShopGrid } from "@/components/site/shop-grid";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("shop");
  return { title: page?.seoTitle ? { absolute: page.seoTitle } : "Shop", description: page?.seoDescription || undefined };
}

export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const ctx = await loadCtx();
  const page = await getPage("shop");
  const sections = page?.sections ?? [];
  const [head, ...rest] = sections;
  return (
    <>
      {head ? <RenderSections sections={[head]} ctx={ctx} /> : <div className="h-32" />}
      <ShopGrid
        products={ctx.products}
        categories={ctx.categories}
        currency={ctx.settings.brand.currency}
        initialCategory={category ?? "all"}
      />
      <RenderSections sections={rest} ctx={ctx} />
    </>
  );
}
