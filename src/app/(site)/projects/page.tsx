import type { Metadata } from "next";
import { getPage } from "@/lib/db";
import { loadCtx, RenderSections } from "@/components/sections/render";
import { ProjectIndex } from "@/components/site/project-views";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("projects");
  return { title: page?.seoTitle ? { absolute: page.seoTitle } : "Projects", description: page?.seoDescription || undefined };
}

export default async function Projects() {
  const ctx = await loadCtx();
  const page = await getPage("projects");
  const [head, ...rest] = page?.sections ?? [];
  return (
    <>
      {head ? <RenderSections sections={[head]} ctx={ctx} /> : <div className="h-32" />}
      <ProjectIndex projects={ctx.projects} />
      <RenderSections sections={rest} ctx={ctx} />
    </>
  );
}
