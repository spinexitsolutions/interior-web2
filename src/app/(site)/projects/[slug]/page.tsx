import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollection } from "@/lib/db";
import { ProjectDetail } from "@/components/site/project-views";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getCollection("projects")).find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.summary, openGraph: { images: [p.cover] } } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = await getCollection("projects");
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  return <ProjectDetail p={projects[i]} next={projects[(i + 1) % projects.length]} />;
}
