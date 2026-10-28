"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Result } from "@/app/admin/actions";
import { inputCls } from "./fields";

export function AccountForm({ email: initial, save }: { email: string; save: (json: string) => Promise<Result> }) {
  const [email, setEmail] = useState(initial);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<Result | null>(null);
  const [pending, start] = useTransition();
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-7">
      <h2 className="text-lg font-bold">Account</h2>
      <p className="text-sm text-stone-500">Change the admin login.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
        <button
          disabled={pending}
          onClick={() => start(async () => setMsg(await save(JSON.stringify({ email, password }))))}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Update login
        </button>
      </div>
      {msg && <p className={`mt-3 text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.message}</p>}
    </section>
  );
}

export function ResetDemo({ reset }: { reset: () => Promise<Result> }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/50 p-5 md:p-7">
      <h2 className="text-lg font-bold text-red-900">Danger zone</h2>
      <p className="text-sm text-red-800/70">Restore all demo content. This replaces every page, product, project and setting.</p>
      <button
        disabled={pending}
        onClick={() =>
          confirm("Replace ALL content with the demo content?") &&
          start(async () => {
            await reset();
            router.refresh();
            location.reload();
          })
        }
        className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700"
      >
        {pending ? "Restoring…" : "Restore demo content"}
      </button>
    </section>
  );
}
