"use server";

import { db } from "@/lib/db";
import { clientIp, rateLimit, retryMessage } from "@/lib/rate-limit";
import { echo, emailSchema, fieldErrors, type FormState } from "@/lib/validation";

const DONE = "Готово. Перший лист прийде разом із наступним дропом.";

export async function subscribeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: hidden from people, filled in by naive bots. Pretend it worked.
  if (formData.get("website")) return { ok: true, message: DONE };

  const limit = await rateLimit(`subscribe:ip:${await clientIp()}`, 5, 60 * 60_000);
  if (!limit.ok) return { message: retryMessage(limit.retryAfterSec), values: echo(formData, "email") };

  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { errors: fieldErrors(email.error), values: echo(formData, "email") };

  // Same answer for new and existing addresses, so the form cannot be used to test emails.
  await db.subscriber.upsert({ where: { email: email.data }, create: { email: email.data }, update: {} });
  return { ok: true, message: DONE };
}
