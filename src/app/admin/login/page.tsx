"use client";

import { useActionState } from "react";
import { login, type Result } from "../actions";

export default function Login() {
  const [state, action, pending] = useActionState<Result | null, FormData>(login, null);
  return (
    <div className="grid min-h-screen bg-stone-100 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-stone-900 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <p className="display absolute bottom-10 left-10 max-w-md text-5xl text-white">Every room, every word, editable here.</p>
      </div>
      <div className="grid place-items-center p-6">
        <form action={action} className="w-full max-w-sm space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Studio CMS</p>
            <h1 className="mt-2 text-3xl font-bold">Sign in</h1>
          </div>
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-stone-900" />
          <input name="password" type="password" required placeholder="Password" className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-stone-900" />
          {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
          <button disabled={pending} className="w-full rounded-xl bg-stone-900 py-3 font-semibold text-white disabled:opacity-60">
            {pending ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-xs text-stone-400">First run: admin@aangan.studio / admin123. Change it in Settings → Account.</p>
        </form>
      </div>
    </div>
  );
}
