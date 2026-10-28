"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Field } from "@/lib/schemas";
import { FONT_OPTIONS } from "@/lib/schemas";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type RefOptions = Record<string, { value: string; label: string; image?: string }[]>;
type V = Record<string, any>;

export const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10";

export function Fields({ schema, value, onChange, refs }: { schema: Field[]; value: V; onChange: (v: V) => void; refs: RefOptions }) {
  const set = (name: string, v: any) => onChange({ ...value, [name]: v });
  return (
    <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
      {schema.map((f) => (
        <FieldRow key={f.name} f={f} wide={f.wide || ["group", "list", "images", "refMulti", "textarea"].includes(f.type)}>
          <FieldInput f={f} value={value?.[f.name]} onChange={(v) => set(f.name, v)} refs={refs} />
        </FieldRow>
      ))}
    </div>
  );
}

function FieldRow({ f, wide, children }: { f: Field; wide?: boolean; children: ReactNode }) {
  if (f.type === "group")
    return (
      <fieldset className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 md:col-span-2">
        <legend className="px-1 text-xs font-bold uppercase tracking-wider text-stone-500">{f.label}</legend>
        {children}
      </fieldset>
    );
  if (f.type === "toggle") return <div className={wide ? "md:col-span-2" : ""}>{children}</div>;
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-semibold text-stone-600">{f.label}</span>
      {children}
      {f.help && <span className="mt-1 block text-xs text-stone-400">{f.help}</span>}
    </label>
  );
}

function FieldInput({ f, value, onChange, refs }: { f: Field; value: any; onChange: (v: any) => void; refs: RefOptions }) {
  switch (f.type) {
    case "text":
      return <input className={inputCls} value={value ?? ""} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case "textarea":
      return (
        <textarea
          className={`${inputCls} min-h-[96px] font-[inherit]`}
          rows={Math.min(12, Math.max(3, String(value ?? "").split("\n").length + 1))}
          value={value ?? ""}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return <input type="number" step="any" className={inputCls} value={value ?? 0} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />;
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-stone-300 bg-white p-1" />
          <input className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "toggle":
      return (
        <button
          type="button"
          onClick={() => onChange(!value)}
          className="flex w-full items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm"
        >
          <span className="font-medium text-stone-700">{f.label}</span>
          <span className={`relative h-5 w-9 rounded-full transition ${value ? "bg-emerald-600" : "bg-stone-300"}`}>
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
          </span>
        </button>
      );
    case "select":
      return (
        <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">None</option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "font":
      return (
        <div>
          <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
            {FONT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FontPreview font={value} />
        </div>
      );
    case "tags":
      return <TagsInput value={value ?? []} onChange={onChange} />;
    case "image":
      return <ImageInput value={value ?? ""} onChange={onChange} />;
    case "images":
      return <ImagesInput value={value ?? []} onChange={onChange} />;
    case "ref":
      return (
        <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">None</option>
          {(refs[f.collection!] ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "refMulti":
      return <RefMulti options={refs[f.collection!] ?? []} value={value ?? []} onChange={onChange} />;
    case "group":
      return <Fields schema={f.fields ?? []} value={value ?? {}} onChange={onChange} refs={refs} />;
    case "list":
      return <ListInput f={f} value={value ?? []} onChange={onChange} refs={refs} />;
    default:
      return null;
  }
}

function FontPreview({ font }: { font?: string }) {
  useEffect(() => {
    if (!font) return;
    const id = `gf-${font.replace(/ /g, "-")}`;
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;600&display=swap`;
    document.head.appendChild(l);
  }, [font]);
  return (
    <p className="mt-2 truncate rounded-lg bg-white px-3 py-2 text-2xl font-semibold text-stone-900" style={{ fontFamily: `"${font}"` }}>
      Aa Calm rooms 0123
    </p>
  );
}

function TagsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts]);
    setDraft("");
  };
  return (
    <div className={`${inputCls} flex flex-wrap items-center gap-1.5`}>
      {value.map((t, i) => (
        <span key={i} className="flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-xs">
          {t}
          <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="text-stone-400 hover:text-red-600">
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder="Type and press Enter"
        className="min-w-[120px] flex-1 bg-transparent py-1 text-sm outline-none"
      />
    </div>
  );
}

function RefMulti({ options, value, onChange }: { options: RefOptions[string]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="grid max-h-72 grid-cols-2 gap-2 overflow-auto rounded-lg border border-stone-200 bg-white p-2 md:grid-cols-3">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            className={`flex items-center gap-2 rounded-lg border p-1.5 text-left text-xs transition ${on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 hover:border-stone-400"}`}
          >
            {o.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={o.image} alt="" className="h-8 w-8 rounded object-cover" />
            )}
            <span className="line-clamp-2">{o.label}</span>
            {on && <span className="ml-auto pr-1">{value.indexOf(o.value) + 1}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ListInput({ f, value, onChange, refs }: { f: Field; value: V[]; onChange: (v: V[]) => void; refs: RefOptions }) {
  const [open, setOpen] = useState<number>(-1);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="rounded-lg border border-stone-200 bg-white">
          <div className="flex items-center gap-2 px-3 py-2">
            <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex-1 truncate text-left text-sm font-medium">
              <span className="mr-2 text-stone-400">{i + 1}.</span>
              {String(item[f.itemLabel || "title"] || "Untitled")}
            </button>
            <IconBtn onClick={() => move(i, -1)} label="Move up">↑</IconBtn>
            <IconBtn onClick={() => move(i, 1)} label="Move down">↓</IconBtn>
            <IconBtn onClick={() => onChange(value.filter((_, k) => k !== i))} label="Remove" danger>
              ✕
            </IconBtn>
          </div>
          {open === i && (
            <div className="border-t border-stone-100 p-3">
              <Fields schema={f.fields ?? []} value={item} onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} refs={refs} />
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          onChange([...value, {}]);
          setOpen(value.length);
        }}
        className="w-full rounded-lg border border-dashed border-stone-300 py-2 text-sm font-medium text-stone-600 hover:border-stone-900 hover:text-stone-900"
      >
        + Add item
      </button>
    </div>
  );
}

export function IconBtn({ children, onClick, label, danger }: { children: ReactNode; onClick: () => void; label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`grid h-7 w-7 place-items-center rounded-md text-xs text-stone-500 transition hover:bg-stone-100 ${danger ? "hover:text-red-600" : "hover:text-stone-900"}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ images */

export async function uploadFiles(files: FileList | File[]) {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("file", f));
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.urls as string[];
}

function Thumb({ src, className = "" }: { src: string; className?: string }) {
  const [bad, setBad] = useState(false);
  if (!src || bad) return <div className={`grid place-items-center bg-stone-100 text-[10px] text-stone-400 ${className}`}>{src ? "can't preview" : "no image"}</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" onError={() => setBad(true)} className={`object-cover ${className}`} />;
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="flex gap-3">
      <Thumb key={value} src={value} className="h-20 w-20 shrink-0 rounded-lg border border-stone-200" />
      <div className="flex-1 space-y-2">
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://images.unsplash.com/… or upload" />
        <div className="flex flex-wrap gap-2">
          <SmallBtn onClick={() => file.current?.click()}>{busy ? "Uploading…" : "Upload"}</SmallBtn>
          <SmallBtn onClick={() => setPicker(true)}>Library</SmallBtn>
          {value && <SmallBtn onClick={() => onChange("")}>Clear</SmallBtn>}
        </div>
        <input
          ref={file}
          type="file"
          accept="image/*,video/mp4,video/webm"
          hidden
          onChange={async (e) => {
            if (!e.target.files?.length) return;
            setBusy(true);
            try {
              onChange((await uploadFiles(e.target.files))[0]);
            } catch (err) {
              alert((err as Error).message);
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </div>
      {picker && <MediaPicker onClose={() => setPicker(false)} onPick={(urls) => onChange(urls[0])} />}
    </div>
  );
}

function ImagesInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {value.map((src, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-stone-200">
            <Thumb key={src} src={src} className="h-full w-full" />
            <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-[10px] text-white">{i + 1}</span>
            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition group-hover:opacity-100">
              <button type="button" onClick={() => move(i, -1)} className="rounded bg-white/90 px-1.5 text-xs">←</button>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="rounded bg-white/90 px-1.5 text-xs text-red-600">✕</button>
              <button type="button" onClick={() => move(i, 1)} className="rounded bg-white/90 px-1.5 text-xs">→</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <input className={`${inputCls} flex-1`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste an image URL" />
        <SmallBtn
          onClick={() => {
            if (url.trim()) onChange([...value, url.trim()]);
            setUrl("");
          }}
        >
          Add URL
        </SmallBtn>
        <SmallBtn onClick={() => file.current?.click()}>{busy ? "Uploading…" : "Upload"}</SmallBtn>
        <SmallBtn onClick={() => setPicker(true)}>Library</SmallBtn>
      </div>
      <input
        ref={file}
        type="file"
        multiple
        accept="image/*"
        hidden
        onChange={async (e) => {
          if (!e.target.files?.length) return;
          setBusy(true);
          try {
            onChange([...value, ...(await uploadFiles(e.target.files))]);
          } catch (err) {
            alert((err as Error).message);
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      {picker && <MediaPicker multiple onClose={() => setPicker(false)} onPick={(urls) => onChange([...value, ...urls])} />}
    </div>
  );
}

export function SmallBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-900">
      {children}
    </button>
  );
}

type MediaFile = { name: string; url: string; size: number };

export function MediaPicker({ onClose, onPick, multiple }: { onClose: () => void; onPick: (urls: string[]) => void; multiple?: boolean }) {
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [sel, setSel] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((j) => setFiles(j.files ?? []));
  }, []);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h3 className="font-semibold">Media library</h3>
          <button type="button" onClick={onClose} className="text-stone-500">✕</button>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-3 overflow-auto p-5 sm:grid-cols-5">
          {files === null && <p className="col-span-full text-sm text-stone-500">Loading…</p>}
          {files?.length === 0 && <p className="col-span-full text-sm text-stone-500">No uploads yet. Use the Upload button.</p>}
          {files?.map((f) => {
            const on = sel.includes(f.url);
            return (
              <button
                type="button"
                key={f.name}
                onClick={() => (multiple ? setSel(on ? sel.filter((s) => s !== f.url) : [...sel, f.url]) : (onPick([f.url]), onClose()))}
                className={`aspect-square overflow-hidden rounded-lg border-2 ${on ? "border-stone-900" : "border-transparent"}`}
              >
                <Thumb src={f.url} className="h-full w-full" />
              </button>
            );
          })}
        </div>
        {multiple && (
          <div className="flex justify-end border-t border-stone-200 px-5 py-3">
            <button
              type="button"
              disabled={!sel.length}
              onClick={() => {
                onPick(sel);
                onClose();
              }}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Add {sel.length || ""} selected
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
