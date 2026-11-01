import "server-only";
import { db } from "./db";

export const FREE_DELIVERY_CENTS = 2500_00;

/** The user's cart with prices from the database and each line's colour resolved to a hex. */
export async function getCart(userId: string) {
  const rows = await db.cartItem.findMany({
    where: { userId, product: { active: true } },
    orderBy: { id: "asc" },
    select: {
      id: true,
      quantity: true,
      size: true,
      color: true,
      product: {
        select: { slug: true, name: true, priceCents: true, kind: true, colorNames: true, colorHexes: true },
      },
    },
  });
  const items = rows.map((r) => ({
    ...r,
    colorHex: r.product.colorHexes[r.product.colorNames.indexOf(r.color)] ?? "#9b9c99",
  }));
  return {
    items,
    totalCents: items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0),
    count: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}
