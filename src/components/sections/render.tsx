import type { Section } from "@/lib/types";
import type { SectionCtx } from "./shared";
import { Hero } from "./hero";
import { ExpandImage, Gallery, Horizontal, Marquee, Statement } from "./scroll";
import { Cta, Faq, PageHeader, Process, ProductsSection, ProjectsStack, RichText, Services, Split, Stats, Testimonials } from "./content";
import { Contact } from "./contact";
import { Blinds, FloorPlan, Manifesto, MaskHero, Notes, Ring, ShopTheRoom, Strips, Trail } from "./signature";

export async function loadCtx(): Promise<SectionCtx> {
  const { getCollection, getSettings } = await import("@/lib/db");
  const [settings, products, categories, projects, testimonials] = await Promise.all([
    getSettings(),
    getCollection("products"),
    getCollection("categories"),
    getCollection("projects"),
    getCollection("testimonials"),
  ]);
  return { settings, products, categories, projects, testimonials };
}

export function RenderSections({ sections, ctx }: { sections: Section[]; ctx: SectionCtx }) {
  return (
    <>
      {sections
        .filter((s) => s.enabled)
        .map((s) => (
          <RenderSection key={s.id} section={s} ctx={ctx} />
        ))}
    </>
  );
}

function RenderSection({ section, ctx }: { section: Section; ctx: SectionCtx }) {
  const d = section.data ?? {};
  const currency = ctx.settings.brand.currency || "₹";

  switch (section.type) {
    case "hero":
      return <Hero data={d} product={ctx.products.find((p) => p.featured) ?? ctx.products[0]} currency={currency} />;
    case "maskHero":
      return <MaskHero data={d} />;
    case "manifesto":
      return <Manifesto data={d} />;
    case "shopTheRoom": {
      const spots = (d.spots ?? []).map((s: { x: number; y: number; product: string }) => ({
        x: Number(s.x) || 50,
        y: Number(s.y) || 50,
        product: ctx.products.find((p) => p.id === s.product),
      }));
      return <ShopTheRoom data={d} spots={spots} currency={currency} />;
    }
    case "strips": {
      const custom = (d.items ?? []).filter((i: { title?: string }) => i.title);
      const items = custom.length
        ? custom
        : ctx.categories.map((c) => ({ title: c.name, subtitle: c.description, image: c.image, href: `/shop?category=${c.slug}` }));
      return <Strips data={d} items={items} />;
    }
    case "blinds":
      return <Blinds data={d} project={ctx.projects.find((p) => p.id === d.project) ?? ctx.projects.find((p) => p.featured)} />;
    case "ring": {
      let list = d.mode === "featured" ? ctx.products.filter((p) => p.featured) : ctx.products;
      if (d.mode === "manual")
        list = (d.products ?? []).map((id: string) => ctx.products.find((p) => p.id === id)).filter(Boolean);
      return <Ring data={d} products={list.slice(0, Number(d.limit) || 10)} currency={currency} />;
    }
    case "floorPlan":
      return <FloorPlan data={d} />;
    case "trail":
      return <Trail data={d} />;
    case "notes":
      return <Notes data={d} items={ctx.testimonials} />;
    case "marquee":
      return <Marquee data={d} />;
    case "statement":
      return <Statement data={d} />;
    case "expandImage":
      return <ExpandImage data={d} />;
    case "horizontal": {
      const custom = (d.items ?? []).filter((i: { title?: string }) => i.title);
      const cards = custom.length
        ? custom
        : ctx.categories.map((c) => ({ title: c.name, subtitle: c.description, image: c.image, href: `/shop?category=${c.slug}` }));
      return <Horizontal data={d} cards={cards} />;
    }
    case "products": {
      let list = ctx.products;
      if (d.mode === "featured") list = list.filter((p) => p.featured);
      if (d.mode === "category") list = list.filter((p) => p.category === d.category);
      if (d.mode === "manual")
        list = (d.products ?? []).map((id: string) => ctx.products.find((p) => p.id === id)).filter(Boolean);
      return <ProductsSection data={d} products={list.slice(0, Number(d.limit) || 8)} currency={currency} />;
    }
    case "services":
      return <Services data={d} />;
    case "split":
      return <Split data={d} />;
    case "stats":
      return <Stats data={d} />;
    case "process":
      return <Process data={d} />;
    case "projects": {
      const list = d.featuredOnly ? ctx.projects.filter((p) => p.featured) : ctx.projects;
      return <ProjectsStack data={d} projects={list.slice(0, Number(d.limit) || 4)} />;
    }
    case "gallery":
      return <Gallery data={d} />;
    case "testimonials":
      return <Testimonials data={d} items={ctx.testimonials} />;
    case "faq":
      return <Faq data={d} />;
    case "cta":
      return <Cta data={d} />;
    case "pageHeader":
      return <PageHeader data={d} />;
    case "richText":
      return <RichText data={d} />;
    case "contact":
      return <Contact data={d} settings={ctx.settings} product={ctx.query?.product} />;
    default:
      return null;
  }
}
