"use client";

import { useActionState, useState } from "react";
import type { Settings } from "@/lib/types";
import { submitInquiry, type ContactState } from "@/app/actions";
import { Reveal, SplitHeading, ParallaxImg, Arrow, Star } from "@/components/site/motion";
import { Eyebrow, Shell } from "./shared";

const field =
  "peer w-full border-b border-(--line) bg-transparent pb-3 pt-6 text-lg outline-none transition-colors placeholder:text-transparent focus:border-accent";
const label =
  "pointer-events-none absolute left-0 top-6 text-(--mute) transition-all duration-300 peer-focus:top-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs";

export function Contact({
  data,
  settings,
  product,
}: {
  product?: string;
  data: { eyebrow?: string; title?: string; text?: string; interests?: string[]; image?: string; tone?: string };
  settings: Settings;
}) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitInquiry, null);
  const productInterest = product ? data.interests?.find((i) => /product|shop/i.test(i)) : undefined;
  const [interest, setInterest] = useState(productInterest ?? data.interests?.[0] ?? "");
  const [message, setMessage] = useState(product ? `Hi! I'm interested in "${product}". ` : "");

  return (
    <Shell tone={data.tone}>
      <div className="container-x grid grid-cols-12 gap-y-16 pb-28 pt-36 md:gap-x-6 md:pt-44">
        <div className="col-span-12 md:col-span-5">
          <Eyebrow className="mb-8">{data.eyebrow}</Eyebrow>
          <SplitHeading as="h1" immediate text={data.title || ""} className="display h-xl" />
          <p className="lede mt-8 max-w-md text-(--mute)">{data.text}</p>

          <Reveal className="mt-14 grid grid-cols-2 gap-8 text-sm">
            <div data-reveal>
              <p className="eyebrow mb-3 text-(--mute)">Write</p>
              <a href={`mailto:${settings.contact.email}`} className="ulink">{settings.contact.email}</a>
            </div>
            <div data-reveal>
              <p className="eyebrow mb-3 text-(--mute)">Call</p>
              <a href={`tel:${settings.contact.phone}`} className="ulink">{settings.contact.phone}</a>
            </div>
            <div data-reveal>
              <p className="eyebrow mb-3 text-(--mute)">Visit</p>
              <p className="whitespace-pre-line">{settings.contact.address}</p>
            </div>
            <div data-reveal>
              <p className="eyebrow mb-3 text-(--mute)">Hours</p>
              <p>{settings.contact.hours}</p>
            </div>
          </Reveal>
          {data.image && <ParallaxImg src={data.image} className="mt-14 hidden aspect-[4/3] md:block" />}
        </div>

        <div className="col-span-12 md:col-span-6 md:col-start-7">
          {state?.ok ? (
            <div className="flex h-full min-h-[50vh] flex-col justify-center">
              <Star className="text-[6rem] text-accent" />
              <p className="display h-lg mt-6">{state.message}</p>
            </div>
          ) : (
            <form action={action} className="space-y-10 md:sticky md:top-28">
              <fieldset>
                <legend className="eyebrow mb-5 text-(--mute)">I’m interested in</legend>
                <div className="flex flex-wrap gap-2">
                  {(data.interests ?? []).map((i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setInterest(i)}
                      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                        interest === i ? "border-accent bg-accent text-white" : "border-(--line) hover:border-(--fg)"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="interest" value={interest} />
              </fieldset>

              <div className="grid gap-8 md:grid-cols-2">
                {[
                  ["name", "Your name", "text"],
                  ["email", "Email", "email"],
                  ["phone", "Phone (optional)", "tel"],
                ].map(([n, l, t]) => (
                  <label key={n} className={`relative block ${n === "phone" ? "md:col-span-2" : ""}`}>
                    <input name={n} type={t} placeholder={l} required={n !== "phone"} className={field} />
                    <span className={label}>{l}</span>
                  </label>
                ))}
              </div>
              <label className="relative block">
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us about the space"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${field} resize-none`}
                />
                <span className={label}>Tell us about the space</span>
              </label>
              <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

              {state && !state.ok && <p className="text-sm text-accent">{state.message}</p>}
              <button type="submit" disabled={pending} className="btn disabled:opacity-60">
                {pending ? "Sending…" : "Send enquiry"}
                <span className="arrow">
                  <Arrow />
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </Shell>
  );
}
