"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { echo, fieldErrors, idSchema, ORDER_STATUSES, productSchema, type FormState } from "@/lib/validation";

function refresh() {
  revalidatePath("/", "layout");
}

function prismaCode(error: unknown) {
  return error && typeof error === "object" && "code" in error ? String(error.code) : undefined;
}

export async function saveProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const values = echo(formData, ...formData.keys());
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const category = await db.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } });
  if (!category) return { errors: { categoryId: "Категорію не знайдено." }, values };

  const rawId = formData.get("id");
  try {
    if (rawId) {
      const id = idSchema.safeParse(rawId);
      if (!id.success) return { message: "Невірний ідентифікатор.", values };
      await db.product.update({ where: { id: id.data }, data: parsed.data });
    } else {
      await db.product.create({ data: parsed.data });
    }
  } catch (error) {
    if (prismaCode(error) === "P2002") return { errors: { slug: "Такий slug уже існує." }, values };
    if (prismaCode(error) === "P2025") return { message: "Товар уже видалено." };
    throw error;
  }

  refresh();
  return { ok: true, message: rawId ? "Збережено." : "Товар створено." };
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  // Order history keeps its copy of the name and price (OrderItem.productId becomes null).
  await db.product.delete({ where: { id: id.data } }).catch(() => {});
  refresh();
}

const statusSchema = z.object({ id: idSchema, status: z.enum(ORDER_STATUSES) });

export async function setOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = statusSchema.safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  await db.order.updateMany({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
  revalidatePath("/admin");
  revalidatePath("/account");
}
