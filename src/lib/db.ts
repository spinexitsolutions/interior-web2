import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createSeed } from "./seed";
import type { CollectionName, Collections, DB, Page, Settings } from "./types";

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");

let cache: { db: DB; mtime: number } | null = null;
let writing: Promise<void> = Promise.resolve();

export async function readDB(): Promise<DB> {
  try {
    const stat = await fs.stat(DB_FILE);
    if (cache && cache.mtime === stat.mtimeMs) return cache.db;
    const db = { ...createSeed(), ...JSON.parse(await fs.readFile(DB_FILE, "utf8")) } as DB;
    cache = { db, mtime: stat.mtimeMs };
    return db;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    const db = createSeed();
    await writeDB(db);
    return db;
  }
}

async function writeDB(db: DB) {
  // Serialise writes and swap the file atomically so a crash never leaves half a JSON file.
  writing = writing.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DB_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, DB_FILE);
    const stat = await fs.stat(DB_FILE);
    cache = { db, mtime: stat.mtimeMs };
  });
  return writing;
}

export async function mutate(fn: (db: DB) => void | Promise<void>) {
  const db = structuredClone(await readDB());
  await fn(db);
  await writeDB(db);
  return db;
}

export const getSettings = async (): Promise<Settings> => (await readDB()).settings;

export async function getPage(slug: string): Promise<Page | undefined> {
  return (await readDB()).pages.find((p) => p.slug === slug);
}

export async function getCollection<K extends CollectionName>(name: K): Promise<Collections[K]> {
  const items = (await readDB())[name] as Collections[K];
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) as Collections[K];
}

export async function resetDB() {
  await writeDB(createSeed());
}

export function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}
