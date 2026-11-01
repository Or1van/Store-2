"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientIp, rateLimit, retryMessage } from "@/lib/rate-limit";
import { appUrl, getStripe } from "@/lib/stripe";
import { checkoutSchema, echo, fieldErrors, type FormState } from "@/lib/validation";

export async function checkoutAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/checkout");
  const values = echo(formData, "fullName", "phone", "city", "branch", "comment");

  const [byUser, byIp] = await Promise.all([
    rateLimit(`checkout:user:${user.id}`, 10, 10 * 60_000),
    rateLimit(`checkout:ip:${await clientIp()}`, 30, 10 * 60_000),
  ]);
  if (!byUser.ok || !byIp.ok) return { message: retryMessage(Math.max(byUser.retryAfterSec, byIp.retryAfterSec)), values };

  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  // Prices always come from the database, never from the client.
  const items = await db.cartItem.findMany({
    where: { userId: user.id, product: { active: true } },
    select: {
      quantity: true,
      size: true,
      color: true,
      product: {
        select: { id: true, name: true, priceCents: true, kind: true, colorNames: true, colorHexes: true },
      },
    },
  });
  if (items.length === 0) redirect("/cart");

  const totalCents = items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);
  const order = await db.order.create({
    data: {
      userId: user.id,
      totalCents,
      ...parsed.data,
      items: {
        create: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          size: i.size,
          color: i.color,
          colorHex: i.product.colorHexes[i.product.colorNames.indexOf(i.color)] ?? "#9b9c99",
          kind: i.product.kind,
          unitCents: i.product.priceCents,
          quantity: i.quantity,
        })),
      },
    },
    select: { id: true },
  });

  const stripe = getStripe();
  if (!stripe) {
    // Demo mode: no payment provider configured.
    await db.$transaction([
      db.order.update({ where: { id: order.id }, data: { status: "PAID" } }),
      db.cartItem.deleteMany({ where: { userId: user.id } }),
    ]);
    revalidatePath("/", "layout");
    redirect(`/checkout/success?order=${order.id}`);
  }

  const session = await stripe.checkout.sessions.create({
    locale: "auto",
    mode: "payment",
    customer_email: user.email,
    client_reference_id: order.id,
    metadata: { orderId: order.id, userId: user.id },
    line_items: items.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: "uah",
        unit_amount: i.product.priceCents,
        product_data: { name: `${i.product.name} — ${i.color}, ${i.size}` },
      },
    })),
    success_url: `${appUrl()}/checkout/success?order=${order.id}`,
    cancel_url: `${appUrl()}/cart?cancelled=1`,
  });

  await db.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
  if (!session.url) return { message: "Не вдалося відкрити сторінку оплати. Спробуйте ще раз.", values };
  redirect(session.url);
}
