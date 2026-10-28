"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkCredentials, createSession, destroySession, hashPassword, requireAdmin } from "@/lib/auth";
import { mutate, newId, resetDB, slugify } from "@/lib/db";
import { COLLECTIONS, SECTIONS } from "@/lib/schemas";
import type { CollectionName, Page, Section } from "@/lib/types";

export type Result = { ok: boolean; message: string; id?: string };

const done = (message = "Saved"): Result => {
  revalidatePath("/", "layout");
  return { ok: true, message };
};

/* ---------------------------------------------------------------- auth */

export async function login(_: Result | null, form: FormData): Promise<Result> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (!(await checkCredentials(email, password))) return { ok: false, message: "Wrong email or password." };
  await createSession(email);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(json: string): Promise<Result> {
  await requireAdmin();
  const { email, password } = JSON.parse(json) as { email: string; password: string };
  if (!email || !password || password.length < 6) return { ok: false, message: "Use a valid email and a password of 6+ characters." };
  await mutate((db) => {
    db.admin = { email, passwordHash: hashPassword(password) };
  });
  return { ok: true, message: "Login details updated" };
}

/* ---------------------------------------------------------------- settings */

export async function saveSettings(json: string): Promise<Result> {
  await requireAdmin();
  const settings = JSON.parse(json);
  await mutate((db) => {
    db.settings = { ...db.settings, ...settings };
  });
  return done("Settings saved");
}

export async function resetDemo(): Promise<Result> {
  await requireAdmin();
  await resetDB();
  return done("Demo content restored");
}

/* ---------------------------------------------------------------- pages */

export async function savePage(id: string, json: string): Promise<Result> {
  await requireAdmin();
  const page = JSON.parse(json) as Page;
  const slug = slugify(page.slug || page.title) || "page";
  let error = "";
  await mutate((db) => {
    if (db.pages.some((p) => p.slug === slug && p.id !== id)) {
      error = `Another page already uses /${slug}`;
      return;
    }
    const i = db.pages.findIndex((p) => p.id === id);
    const sections = (page.sections ?? []).filter((s) => SECTIONS[s.type]);
    const next = { ...page, id, slug, sections };
    if (i >= 0) db.pages[i] = next;
  });
  if (error) return { ok: false, message: error };
  return done("Page saved");
}

export async function createPage(form: FormData) {
  await requireAdmin();
  const title = String(form.get("title") || "Untitled");
  const id = newId("page");
  await mutate((db) => {
    let slug = slugify(title) || "page";
    while (db.pages.some((p) => p.slug === slug)) slug += "-2";
    const header: Section = {
      id: newId("sec"),
      type: "pageHeader",
      enabled: true,
      data: { eyebrow: title, title, subtitle: "", image: "", tone: "light" },
    };
    db.pages.push({ id, slug, title, seoTitle: "", seoDescription: "", published: false, sections: [header] });
  });
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${id}`);
}

export async function deletePage(id: string): Promise<Result> {
  await requireAdmin();
  let blocked = false;
  await mutate((db) => {
    const p = db.pages.find((x) => x.id === id);
    if (p && ["home", "shop", "projects"].includes(p.slug)) blocked = true;
    else db.pages = db.pages.filter((x) => x.id !== id);
  });
  if (blocked) return { ok: false, message: "Core pages can't be deleted. Unpublish or edit them instead." };
  return done("Page deleted");
}

/* ---------------------------------------------------------------- collections */

function assertCollection(name: string): asserts name is CollectionName {
  if (!COLLECTIONS[name]) throw new Error("Unknown collection");
}

export async function saveItem(collection: string, id: string, json: string): Promise<Result> {
  await requireAdmin();
  assertCollection(collection);
  const def = COLLECTIONS[collection];
  const item = JSON.parse(json);
  if ("slug" in item || def.fields.some((f) => f.name === "slug")) {
    item.slug = slugify(item.slug || item[def.titleField] || "") || newId("item");
  }
  for (const f of def.fields) if (f.type === "number") item[f.name] = Number(item[f.name] || 0);
  let newIdValue = id;
  let error = "";
  await mutate((db) => {
    const list = db[collection] as { id: string; slug?: string }[];
    if (item.slug && list.some((x) => x.slug === item.slug && x.id !== id)) {
      error = `Slug “${item.slug}” is already used`;
      return;
    }
    if (id === "new") {
      newIdValue = newId(collection.slice(0, 3));
      list.push({ ...item, id: newIdValue });
    } else {
      const i = list.findIndex((x) => x.id === id);
      if (i >= 0) list[i] = { ...item, id };
    }
  });
  if (error) return { ok: false, message: error };
  return { ...done(id === "new" ? "Created" : "Saved"), id: newIdValue };
}

export async function deleteItem(collection: string, id: string): Promise<Result> {
  await requireAdmin();
  assertCollection(collection);
  await mutate((db) => {
    (db[collection] as { id: string }[]) = (db[collection] as { id: string }[]).filter((x) => x.id !== id);
  });
  return done("Deleted");
}

/* ---------------------------------------------------------------- inquiries */

export async function setInquiryRead(id: string, read: boolean): Promise<Result> {
  await requireAdmin();
  await mutate((db) => {
    const q = db.inquiries.find((x) => x.id === id);
    if (q) q.read = read;
  });
  revalidatePath("/admin", "layout");
  return { ok: true, message: read ? "Marked as read" : "Marked unread" };
}

export async function deleteInquiry(id: string): Promise<Result> {
  await requireAdmin();
  await mutate((db) => {
    db.inquiries = db.inquiries.filter((x) => x.id !== id);
  });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Deleted" };
}
