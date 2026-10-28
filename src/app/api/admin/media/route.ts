import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getAdmin } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/db";

export async function GET() {
  if (!(await getAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const names = (await fs.readdir(UPLOAD_DIR)).filter((n) => !n.startsWith("."));
  const files = await Promise.all(
    names.map(async (name) => {
      const s = await fs.stat(path.join(UPLOAD_DIR, name));
      return { name, url: `/uploads/${name}`, size: s.size, mtime: s.mtimeMs };
    }),
  );
  return NextResponse.json({ files: files.sort((a, b) => b.mtime - a.mtime) });
}

export async function DELETE(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const name = path.basename(new URL(req.url).searchParams.get("name") || "");
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
  await fs.rm(path.join(UPLOAD_DIR, name), { force: true });
  return NextResponse.json({ ok: true });
}
