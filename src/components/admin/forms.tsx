"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import type { Field } from "@/lib/schemas";
import { SECTIONS } from "@/lib/schemas";
import type { Page, Section } from "@/lib/types";
import type { Result } from "@/app/admin/actions";
import { Fields, IconBtn, inputCls, type RefOptions } from "./fields";

/* eslint-disable @typescript-eslint/no-explicit-any */

function useToast() {
  const [toast, setToast] = useState<Result | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  const node = toast && (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.ok ? "bg-emerald-600" : "bg-red-600"}`}
    >
      {toast.message}
    </div>
  );
  return [node, setToast] as const;
}

function SaveBar({ title, children, dirty, pending, onSave }: { title: ReactNode; children?: ReactNode; dirty: boolean; pending: boolean; onSave: () => void }) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onSave]);
  return (
    <div className="sticky top-0 z-30 -mx-6 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-100/90 px-6 py-4 backdrop-blur md:-mx-10 md:px-10">
      <div className="min-w-0">{title}</div>
      <div className="flex items-center gap-2">
        {children}
        <button
          onClick={onSave}
          disabled={pending}
          className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition ${dirty ? "bg-stone-900 hover:bg-black" : "bg-stone-500"} disabled:opacity-60`}
        >
          {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ generic form */

export function SchemaForm({
  title,
  schema,
  initial,
  save,
  refs = {},
  extra,
  onSaved,
}: {
  title: ReactNode;
  schema: Field[];
  initial: Record<string, any>;
  save: (json: string) => Promise<Result>;
  refs?: RefOptions;
  extra?: ReactNode;
  onSaved?: (r: Result) => void;
}) {
  const [value, setValue] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const [toast, setToast] = useToast();

  const submit = () =>
    start(async () => {
      const r = await save(JSON.stringify(value));
      setToast(r);
      if (r.ok) {
        setDirty(false);
        onSaved?.(r);
      }
    });

  return (
    <>
      <SaveBar title={title} dirty={dirty} pending={pending} onSave={submit}>
        {extra}
      </SaveBar>
      <div className="rounded-2xl border border-stone-200 bg-white p-5 md:p-7">
        <Fields
          schema={schema}
          value={value}
          refs={refs}
          onChange={(v) => {
            setValue(v);
            setDirty(true);
          }}
        />
      </div>
      {toast}
    </>
  );
}

export function CollectionItemForm({
  collection,
  id,
  title,
  schema,
  initial,
  refs,
  save,
  remove,
  viewHref,
}: {
  collection: string;
  id: string;
  title: string;
  schema: Field[];
  initial: Record<string, any>;
  refs: RefOptions;
  save: (collection: string, id: string, json: string) => Promise<Result>;
  remove: (collection: string, id: string) => Promise<Result>;
  viewHref?: string;
}) {
  const router = useRouter();
  return (
    <SchemaForm
      title={
        <div>
          <Link href={`/admin/c/${collection}`} className="text-xs font-semibold text-stone-500 hover:text-stone-900">
            ← Back
          </Link>
          <h1 className="truncate text-xl font-bold">{title}</h1>
        </div>
      }
      schema={schema}
      initial={initial}
      refs={refs}
      save={(json) => save(collection, id, json)}
      onSaved={(r) => {
        if (id === "new" && r.id) router.replace(`/admin/c/${collection}/${r.id}`);
        else router.refresh();
      }}
      extra={
        id !== "new" && (
          <>
            {viewHref && (
              <a href={viewHref} target="_blank" className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold">
                View ↗
              </a>
            )}
            <DeleteButton
              onConfirm={async () => {
                const r = await remove(collection, id);
                if (r.ok) router.replace(`/admin/c/${collection}`);
                return r;
              }}
            />
          </>
        )
      }
    />
  );
}

export function DeleteButton({ onConfirm, label = "Delete" }: { onConfirm: () => Promise<Result>; label?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this permanently?")) return;
        start(async () => {
          const r = await onConfirm();
          if (!r.ok) alert(r.message);
        });
      }}
      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
    >
      {pending ? "…" : label}
    </button>
  );
}

/* ------------------------------------------------------------------ page builder */

const uid = () => `sec_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function defaultsFor(type: string) {
  const data: Record<string, any> = {};
  for (const f of SECTIONS[type].fields) {
    if (f.type === "list" || f.type === "images" || f.type === "tags" || f.type === "refMulti") data[f.name] = [];
    else if (f.type === "group") data[f.name] = {};
    else if (f.type === "toggle") data[f.name] = false;
    else if (f.type === "number") data[f.name] = 0;
    else if (f.name === "tone") data[f.name] = "light";
    else data[f.name] = "";
  }
  if (data.title === "") data.title = SECTIONS[type].label.split(" ")[0];
  return data;
}

export function PageEditor({
  page,
  refs,
  save,
  remove,
}: {
  page: Page;
  refs: RefOptions;
  save: (id: string, json: string) => Promise<Result>;
  remove: (id: string) => Promise<Result>;
}) {
  const router = useRouter();
  const [p, setP] = useState(page);
  const [dirty, setDirty] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const [toast, setToast] = useToast();

  const update = (next: Page) => {
    setP(next);
    setDirty(true);
  };
  const setSections = (sections: Section[]) => update({ ...p, sections });
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= p.sections.length) return;
    const s = [...p.sections];
    [s[i], s[j]] = [s[j], s[i]];
    setSections(s);
  };
  const addAt = (index: number, type: string) => {
    const s = [...p.sections];
    const sec = { id: uid(), type, enabled: true, data: defaultsFor(type) };
    s.splice(index, 0, sec);
    setSections(s);
    setOpen(sec.id);
    setAdding(null);
  };

  const submit = () =>
    start(async () => {
      const r = await save(p.id, JSON.stringify(p));
      setToast(r);
      if (r.ok) {
        setDirty(false);
        router.refresh();
      }
    });

  const href = p.slug === "home" ? "/" : `/${p.slug}`;
  const core = ["home", "shop", "projects"].includes(page.slug);

  return (
    <>
      <SaveBar
        dirty={dirty}
        pending={pending}
        onSave={submit}
        title={
          <div>
            <Link href="/admin/pages" className="text-xs font-semibold text-stone-500 hover:text-stone-900">
              ← Pages
            </Link>
            <h1 className="truncate text-xl font-bold">{p.title}</h1>
          </div>
        }
      >
        <a href={href} target="_blank" className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold">
          View ↗
        </a>
        {!core && (
          <DeleteButton
            onConfirm={async () => {
              const r = await remove(p.id);
              if (r.ok) router.replace("/admin/pages");
              return r;
            }}
          />
        )}
      </SaveBar>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="order-2 space-y-3 xl:order-1">
          {(p.slug === "shop" || p.slug === "projects") && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              The first section shows above the {p.slug === "shop" ? "product grid" : "project list"}; the rest show below it.
            </p>
          )}
          <AddSlot onClick={() => setAdding(0)} />
          {p.sections.map((s, i) => {
            const def = SECTIONS[s.type];
            const isOpen = open === s.id;
            return (
              <div key={s.id}>
                <div className={`overflow-hidden rounded-2xl border bg-white transition ${isOpen ? "border-stone-900 shadow-lg" : "border-stone-200"} ${s.enabled ? "" : "opacity-60"}`}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-stone-100 text-xs font-bold text-stone-500">{i + 1}</span>
                    <button onClick={() => setOpen(isOpen ? null : s.id)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold">{def?.label ?? s.type}</p>
                      <p className="truncate text-xs text-stone-500">{String(s.data.title || s.data.headline || s.data.eyebrow || def?.description || "").replace(/\n/g, " ")}</p>
                    </button>
                    <button
                      onClick={() => setSections(p.sections.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)))}
                      className={`rounded-md px-2 py-1 text-[11px] font-bold ${s.enabled ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}`}
                    >
                      {s.enabled ? "Visible" : "Hidden"}
                    </button>
                    <IconBtn onClick={() => move(i, -1)} label="Move up">↑</IconBtn>
                    <IconBtn onClick={() => move(i, 1)} label="Move down">↓</IconBtn>
                    <IconBtn
                      onClick={() => {
                        const copy = { ...structuredClone(s), id: uid() };
                        const arr = [...p.sections];
                        arr.splice(i + 1, 0, copy);
                        setSections(arr);
                      }}
                      label="Duplicate"
                    >
                      ⧉
                    </IconBtn>
                    <IconBtn
                      danger
                      label="Delete section"
                      onClick={() => confirm("Remove this section?") && setSections(p.sections.filter((x) => x.id !== s.id))}
                    >
                      ✕
                    </IconBtn>
                  </div>
                  {isOpen && def && (
                    <div className="border-t border-stone-100 bg-stone-50/50 p-5">
                      <Fields
                        schema={def.fields}
                        value={s.data}
                        refs={refs}
                        onChange={(data) => setSections(p.sections.map((x) => (x.id === s.id ? { ...x, data } : x)))}
                      />
                    </div>
                  )}
                </div>
                <AddSlot onClick={() => setAdding(i + 1)} />
              </div>
            );
          })}
        </div>

        <aside className="order-1 xl:order-2">
          <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 xl:sticky xl:top-24">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Page settings</h2>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-stone-600">Title</span>
              <input className={inputCls} value={p.title} onChange={(e) => update({ ...p, title: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-stone-600">URL</span>
              <div className="flex items-center gap-1 text-sm text-stone-500">
                /
                <input className={inputCls} value={p.slug} disabled={core} onChange={(e) => update({ ...p, slug: e.target.value })} />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-stone-600">SEO title</span>
              <input className={inputCls} value={p.seoTitle} onChange={(e) => update({ ...p, seoTitle: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-stone-600">SEO description</span>
              <textarea className={inputCls} rows={3} value={p.seoDescription} onChange={(e) => update({ ...p, seoDescription: e.target.value })} />
            </label>
            <button
              type="button"
              onClick={() => update({ ...p, published: !p.published })}
              className="flex w-full items-center justify-between rounded-lg border border-stone-200 px-3 py-2.5 text-sm"
            >
              <span className="font-medium">Published</span>
              <span className={`relative h-5 w-9 rounded-full transition ${p.published ? "bg-emerald-600" : "bg-stone-300"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${p.published ? "left-[18px]" : "left-0.5"}`} />
              </span>
            </button>
            <p className="text-xs text-stone-400">Tip: Ctrl/⌘ + S saves. Remember to add the page to Settings → Navigation.</p>
          </div>
        </aside>
      </div>

      {adding !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setAdding(null)}>
          <div className="max-h-[85vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">Add a section</h3>
              <button onClick={() => setAdding(null)} className="text-stone-500">✕</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(SECTIONS).map(([type, def]) => (
                <button
                  key={type}
                  onClick={() => addAt(adding, type)}
                  className="rounded-xl border border-stone-200 p-4 text-left transition hover:border-stone-900 hover:shadow"
                >
                  <p className="font-semibold">{def.label}</p>
                  <p className="mt-1 text-xs text-stone-500">{def.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {toast}
    </>
  );
}

function AddSlot({ onClick }: { onClick: () => void }) {
  return (
    <div className="group flex h-6 items-center justify-center">
      <button
        onClick={onClick}
        className="rounded-full border border-dashed border-stone-300 bg-stone-100 px-3 py-0.5 text-xs font-semibold text-stone-500 opacity-60 transition group-hover:border-stone-900 group-hover:text-stone-900 group-hover:opacity-100"
      >
        + Add section
      </button>
    </div>
  );
}
