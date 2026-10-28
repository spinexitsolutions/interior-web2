import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { getRefs } from "@/lib/refs";
import { PageEditor } from "@/components/admin/forms";
import { deletePage, savePage } from "../../../actions";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = (await readDB()).pages.find((p) => p.id === id);
  if (!page) notFound();
  return <PageEditor key={page.id} page={page} refs={await getRefs()} save={savePage} remove={deletePage} />;
}
