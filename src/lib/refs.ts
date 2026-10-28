import "server-only";
import { getCollection } from "./db";
import type { RefOptions } from "@/components/admin/fields";

export async function getRefs(): Promise<RefOptions> {
  const [products, categories, projects, testimonials] = await Promise.all([
    getCollection("products"),
    getCollection("categories"),
    getCollection("projects"),
    getCollection("testimonials"),
  ]);
  return {
    products: products.map((p) => ({ value: p.id, label: p.name, image: p.images[0] })),
    categories: categories.map((c) => ({ value: c.slug, label: c.name, image: c.image })),
    projects: projects.map((p) => ({ value: p.id, label: p.title, image: p.cover })),
    testimonials: testimonials.map((t) => ({ value: t.id, label: t.name, image: t.avatar })),
  };
}
