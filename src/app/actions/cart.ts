"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { addToCartSchema, fieldErrors, idSchema, MAX_QTY } from "@/lib/validation";

export type CartState = { ok?: boolean; message?: string; needsLogin?: boolean; errors?: Record<string, string> };

export async function addToCartAction(_prev: CartState, formData: FormData): Promise<CartState> {
  const user = await getCurrentUser();
  if (!user) return { needsLogin: true };

  const parsed = addToCartSchema.safeParse({
    productId: formData.get("productId"),
    size: formData.get("size") ?? "",
    color: formData.get("color") ?? "",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { productId, size, color } = parsed.data;

  const product = await db.product.findFirst({
    where: { id: productId, active: true },
    select: { id: true, name: true, sizes: true, colorNames: true },
  });
  if (!product) return { message: "Цей товар більше не продається." };
  if (!product.sizes.includes(size)) return { errors: { size: "Такого розміру немає." } };
  if (!product.colorNames.includes(color)) return { errors: { color: "Такого кольору немає." } };

  const key = { userId_productId_size_color: { userId: user.id, productId, size, color } };
  const existing = await db.cartItem.findUnique({ where: key, select: { quantity: true } });
  if (existing && existing.quantity >= MAX_QTY) {
    return { message: `У кошику вже ${MAX_QTY} шт. — це максимум для однієї позиції.` };
  }

  await db.cartItem.upsert({
    where: key,
    create: { userId: user.id, productId, size, color, quantity: 1 },
    update: { quantity: { increment: 1 } },
  });
  revalidatePath("/", "layout");
  return { ok: true, message: `${product.name}, ${color.toLowerCase()}, ${size} — у кошику.` };
}

const quantitySchema = z.object({
  itemId: idSchema,
  quantity: z.coerce.number().int().min(0).max(MAX_QTY),
});

export async function updateCartItemAction(formData: FormData) {
  const user = await requireUser("/cart");
  const parsed = quantitySchema.safeParse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return;

  const { itemId, quantity } = parsed.data;
  // Scoping by userId makes another user's item id a no-op.
  if (quantity === 0) {
    await db.cartItem.deleteMany({ where: { id: itemId, userId: user.id } });
  } else {
    await db.cartItem.updateMany({ where: { id: itemId, userId: user.id }, data: { quantity } });
  }
  revalidatePath("/", "layout");
}
