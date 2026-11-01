import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Garment } from "@/components/product/Garment";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, ORDER_STATUS } from "@/lib/format";
import { idSchema } from "@/lib/validation";
import styles from "../../pages.module.css";

export const metadata: Metadata = { title: "Дякуємо за замовлення" };

export default async function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const user = await requireUser("/account");
  const id = idSchema.safeParse((await searchParams).order);
  if (!id.success) notFound();

  // Scoped by userId: another customer's order id shows a 404.
  const order = await db.order.findFirst({
    where: { id: id.data, userId: user.id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <main className="page">
      <div className={`container ${styles.narrow}`}>
        <p className="muted">Замовлення № {order.id.slice(-8).toUpperCase()}</p>
        <h1 className="page-title">Дякуємо, замовлення прийнято</h1>
        <p>
          {order.status === "PAID"
            ? `Оплату отримано. Відправимо протягом робочого дня на ${order.city}, ${order.branch}. Номер накладної надішлемо в SMS на ${order.phone}.`
            : `Статус: ${ORDER_STATUS[order.status].toLowerCase()}. Щойно Stripe підтвердить оплату, статус оновиться в кабінеті.`}
        </p>

        <ul className={styles.mini} style={{ marginTop: "2rem" }}>
          {order.items.map((i) => (
            <li key={i.id}>
              <Garment kind={i.kind} color={i.colorHex} className={styles.miniArt} />
              <span>
                {i.name}
                <span className="muted">
                  {" "}
                  {i.color}, {i.size} × {i.quantity}
                </span>
              </span>
              <span>{formatPrice(i.unitCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <hr className="stitch" />
        <p className={styles.total}>
          <span>Разом</span>
          {formatPrice(order.totalCents)}
        </p>

        <div className={styles.row}>
          <Link href="/account" className="btn btn--dark">
            Мої замовлення
          </Link>
          <Link href="/catalog" className="btn btn--ghost">
            Повернутися до каталогу
          </Link>
        </div>
      </div>
    </main>
  );
}
