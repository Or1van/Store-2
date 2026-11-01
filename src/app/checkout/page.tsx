import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Garment } from "@/components/product/Garment";
import { requireUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import styles from "../pages.module.css";

export const metadata: Metadata = { title: "Оформлення замовлення" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const { items, totalCents } = await getCart(user.id);
  if (items.length === 0) redirect("/cart");

  return (
    <main className="page">
      <div className="container">
        <h1 className="page-title">Оформлення</h1>
        <div className={styles.split}>
          <CheckoutForm defaultName={user.name} demo={!process.env.STRIPE_SECRET_KEY} total={formatPrice(totalCents)} />

          <aside className={styles.summary} aria-label="Ваше замовлення">
            <h2 className={styles.summaryTitle}>Ваше замовлення</h2>
            <ul className={styles.mini}>
              {items.map((i) => (
                <li key={i.id}>
                  <Garment kind={i.product.kind} color={i.colorHex} className={styles.miniArt} />
                  <span>
                    {i.product.name}
                    <span className="muted">
                      {" "}
                      {i.color}, {i.size} × {i.quantity}
                    </span>
                  </span>
                  <span>{formatPrice(i.product.priceCents * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <hr className="stitch" />
            <p className={styles.total}>
              <span>Разом</span>
              {formatPrice(totalCents)}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
