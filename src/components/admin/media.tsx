"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uploadFiles } from "./fields";

type F = { name: string; url: string; size: number };

export function MediaManager() {
  const [files, setFiles] = useState<F[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [copied, setCopied] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(() => fetch("/api/admin/media").then((r) => r.json()).then((j) => setFiles(j.files ?? [])), []);
  useEffect(() => {
    load();
  }, [load]);

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    try {
      await uploadFiles(list);
      await load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold">Media</h1>
      <p className="text-sm text-stone-500">Upload images once, then pick them from any image field via “Library”.</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          upload(e.dataTransfer.files);
        }}
        onClick={() => input.current?.click()}
        className={`mt-8 grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-12 text-center transition ${drag ? "border-stone-900 bg-white" : "border-stone-300"}`}
      >
        <p className="font-semibold">{busy ? "Uploading…" : "Drop images here or click to upload"}</p>
        <p className="text-xs text-stone-500">PNG, JPG, WEBP, AVIF, GIF, SVG, MP4 · max 15 MB</p>
        <input ref={input} type="file" multiple hidden accept="image/*,video/mp4,video/webm" onChange={(e) => upload(e.target.files)} />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {files.map((f) => (
          <div key={f.name} className="group overflow-hidden rounded-xl border border-stone-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt="" className="aspect-square w-full object-cover" />
            <div className="flex items-center gap-2 p-2 text-xs">
              <span className="truncate text-stone-500">{(f.size / 1024).toFixed(0)} KB</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(f.url);
                  setCopied(f.name);
                }}
                className="ml-auto font-semibold"
              >
                {copied === f.name ? "Copied" : "Copy URL"}
              </button>
              <button
                onClick={async () => {
                  if (!confirm("Delete this file? Pages using it will show a placeholder.")) return;
                  await fetch(`/api/admin/media?name=${encodeURIComponent(f.name)}`, { method: "DELETE" });
                  load();
                }}
                className="font-semibold text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
