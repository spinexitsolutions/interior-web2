"use client";

import { useState, useTransition } from "react";
import type { Inquiry } from "@/lib/types";
import type { Result } from "@/app/admin/actions";

export function InquiryRow({ q, setRead, remove }: { q: Inquiry; setRead: (id: string, r: boolean) => Promise<Result>; remove: (id: string) => Promise<Result> }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className={`rounded-2xl border bg-white ${q.read ? "border-stone-200" : "border-[var(--accent)]"}`}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!q.read) start(() => setRead(q.id, true).then(() => {}));
        }}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        {!q.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />}
        <span className="font-semibold">{q.name}</span>
        <span className="hidden rounded-md bg-stone-100 px-2 py-0.5 text-xs md:inline">{q.interest || "General"}</span>
        <span className="truncate text-sm text-stone-500">{q.message}</span>
        <span className="ml-auto shrink-0 text-xs text-stone-400">{new Date(q.createdAt).toLocaleString("en-IN")}</span>
      </button>
      {open && (
        <div className="border-t border-stone-100 px-5 py-4 text-sm">
          <p className="whitespace-pre-line">{q.message || "No message"}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={`mailto:${q.email}`} className="rounded-lg bg-stone-900 px-3 py-1.5 font-semibold text-white">Reply to {q.email}</a>
            {q.phone && <a href={`tel:${q.phone}`} className="rounded-lg border border-stone-300 px-3 py-1.5 font-semibold">Call {q.phone}</a>}
            <button disabled={pending} onClick={() => start(() => setRead(q.id, false).then(() => {}))} className="rounded-lg border border-stone-300 px-3 py-1.5 font-semibold">
              Mark unread
            </button>
            <button
              disabled={pending}
              onClick={() => confirm("Delete this inquiry?") && start(() => remove(q.id).then(() => {}))}
              className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
