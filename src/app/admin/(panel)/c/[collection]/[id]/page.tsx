import { notFound } from "next/navigation";
import { getCollection } from "@/lib/db";
import { getRefs } from "@/lib/refs";
import { COLLECTIONS } from "@/lib/schemas";
import type { CollectionName } from "@/lib/types";
import { CollectionItemForm } from "@/components/admin/forms";
import { deleteItem, saveItem } from "../../../../actions";

const PUBLIC: Record<string, string> = { products: "/shop/", projects: "/projects/", categories: "/shop?category=" };

export default async function EditItem({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  const def = COLLECTIONS[collection];
  if (!def) notFound();
  const items = (await getCollection(collection as CollectionName)) as unknown as Record<string, unknown>[];
  const item =
    id === "new"
      ? Object.fromEntries(
          def.fields.map((f) => [
            f.name,
            ["images", "tags", "list"].includes(f.type) ? [] : f.type === "toggle" ? f.name === "inStock" : f.type === "number" ? (f.name === "order" ? items.length + 1 : 0) : "",
          ]),
        )
      : items.find((x) => x.id === id);
  if (!item) notFound();
  const title = id === "new" ? `New ${def.singular.toLowerCase()}` : String(item[def.titleField] || "Untitled");
  return (
    <CollectionItemForm
      key={id}
      collection={collection}
      id={id}
      title={title}
      schema={def.fields}
      initial={item}
      refs={await getRefs()}
      save={saveItem}
      remove={deleteItem}
      viewHref={PUBLIC[collection] && item.slug ? `${PUBLIC[collection]}${item.slug}` : undefined}
    />
  );
}
