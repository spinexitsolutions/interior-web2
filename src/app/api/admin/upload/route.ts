import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getAdmin } from "@/lib/auth";
import { UPLOAD_DIR, slugify } from "@/lib/db";

const ALLOWED = /\.(png|jpe?g|webp|gif|avif|svg|mp4|webm)$/i;

export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No file" }, { status: 400 });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const urls: string[] = [];
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED.test(ext)) return NextResponse.json({ error: `File type ${ext} not allowed` }, { status: 400 });
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "Max 15 MB per file" }, { status: 400 });
    const base = slugify(path.basename(file.name, ext)).slice(0, 40) || "file";
    const name = `${Date.now().toString(36)}-${base}${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
    urls.push(`/uploads/${name}`);
  }
  return NextResponse.json({ urls });
}
