import type { Metadata } from "next";
import Link from "next/link";
import { updateCartItemAction } from "@/app/actions/cart";
import { Garment } from "@/components/product/Garment";
import { ArrowUpRight } from "@/components/ui/icons";
import { requireUser } from "@/lib/auth";
import { getCart, FREE_DELIVERY_CENTS } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { MAX_QTY } from "@/lib/validation";
import styles from "../pages.module.css";

export const metadata: Metadata = { title: "Кошик" };

export default async function CartPage({ searchParams }: PageProps<"/cart">) {
  const user = await requireUser("/cart");
  const params = await searchParams;
  const { items, totalCents, count } = await getCart(user.id);
  const left = FREE_DELIVERY_CENTS - totalCents;

  return (
    <main className="page">
      <div className="container">
        <h1 className="page-title">Кошик</h1>
        {params.cancelled && (
          <p className={styles.notice} role="status">
            Оплату скасовано. Речі лишилися в кошику — можна спробувати ще раз.
          </p>
        )}

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>У кошику поки порожньо. Почніть із базових футболок або подивіться нову партію.</p>
            <Link href="/catalog" className="btn btn--dark">
              Перейти до каталогу <ArrowUpRight />
            </Link>
          </div>
        ) : (
          <div className={styles.split}>
            <ul className={styles.items}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <Link href={`/product/${item.product.slug}`} className={styles.thumb} tabIndex={-1} aria-hidden="true">
                    <Garment kind={item.product.kind} color={item.colorHex} />
                  </Link>
                  <div className={styles.itemInfo}>
                    <h2 className={styles.itemName}>
                      <Link href={`/product/${item.product.slug}`}>{item.product.name}</Link>
                    </h2>
                    <p className="muted">
                      {item.color}, розмір {item.size}
                    </p>
                    <p className="muted">{formatPrice(item.product.priceCents)} за шт.</p>
                  </div>
                  <form action={updateCartItemAction} className={styles.qty}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button name="quantity" value={item.quantity - 1} aria-label="Зменшити кількість">
                      −
                    </button>
                    <span aria-label="Кількість">{item.quantity}</span>
                    <button name="quantity" value={item.quantity + 1} disabled={item.quantity >= MAX_QTY} aria-label="Збільшити кількість">
                      +
                    </button>
                  </form>
                  <p className={styles.lineTotal}>{formatPrice(item.product.priceCents * item.quantity)}</p>
                  <form action={updateCartItemAction} className={styles.removeForm}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button name="quantity" value="0" className={styles.remove}>
                      Прибрати
                    </button>
                  </form>
                </li>
              ))}
            </ul>

            <aside className={styles.summary} aria-label="Підсумок">
              <dl>
                <div>
                  <dt>Товари, {count} шт.</dt>
                  <dd>{formatPrice(totalCents)}</dd>
                </div>
                <div>
                  <dt>Доставка</dt>
                  <dd>{left <= 0 ? "Безкоштовно" : "За тарифом Нової пошти"}</dd>
                </div>
              </dl>
              <hr className="stitch" />
              <p className={styles.total}>
                <span>Разом</span>
                {formatPrice(totalCents)}
              </p>
              {left > 0 && <p className={styles.hint}>Ще {formatPrice(left)} — і доставка буде безкоштовною.</p>}
              <Link href="/checkout" className="btn btn--dark btn--wide">
                Оформити замовлення <ArrowUpRight />
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
