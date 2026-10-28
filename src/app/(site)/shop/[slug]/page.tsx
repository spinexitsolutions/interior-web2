import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollection, getSettings } from "@/lib/db";
import { ProductView } from "@/components/site/product-view";
import { ProductsSection } from "@/components/sections/content";

type Props = { params: Promise<{ slug: string }> };

async function find(slug: string) {
  return (await getCollection("products")).find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await find((await params).slug);
  if (!p) return {};
  return { title: p.name, description: p.shortDescription, openGraph: { images: p.images.slice(0, 1) } };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [p, settings, products, categories] = await Promise.all([find(slug), getSettings(), getCollection("products"), getCollection("categories")]);
  if (!p) notFound();
  const related = products.filter((x) => x.id !== p.id && x.category === p.category);
  const fill = products.filter((x) => x.id !== p.id && x.category !== p.category);
  return (
    <>
      <ProductView p={p} currency={settings.brand.currency} categoryName={categories.find((c) => c.slug === p.category)?.name ?? p.category} />
      <ProductsSection
        data={{ eyebrow: "You may also like", title: "Pairs well with", layout: "rail", cta: { label: "Back to shop", href: "/shop" }, tone: "surface" }}
        products={[...related, ...fill].slice(0, 8)}
        currency={settings.brand.currency}
      />
    </>
  );
}
