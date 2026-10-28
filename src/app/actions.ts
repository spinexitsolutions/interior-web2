"use server";

import { mutate, newId } from "@/lib/db";

export type ContactState = { ok: boolean; message: string } | null;

export async function submitInquiry(_prev: ContactState, form: FormData): Promise<ContactState> {
  const get = (k: string) => String(form.get(k) ?? "").trim().slice(0, 4000);
  const name = get("name");
  const email = get("email");
  if (get("company")) return { ok: true, message: "Thank you!" }; // honeypot
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, message: "Please add your name and a valid email." };

  await mutate((db) => {
    db.inquiries.unshift({
      id: newId("inq"),
      name,
      email,
      phone: get("phone"),
      interest: get("interest"),
      message: get("message"),
      createdAt: new Date().toISOString(),
      read: false,
    });
  });
  return { ok: true, message: "Thank you. A designer will reach out within one working day." };
}
