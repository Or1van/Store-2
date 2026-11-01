import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { Garment } from "@/components/product/Garment";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatPrice, ORDER_STATUS } from "@/lib/format";
import styles from "../pages.module.css";

export const metadata: Metadata = { title: "Кабінет" };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <main className="page">
      <div className="container">
        <div className={styles.accountHead}>
          <div>
            <h1 className="page-title">Вітаємо, {user.name.split(" ")[0]}</h1>
            <p className="muted">{user.email}</p>
          </div>
          <div className={styles.row}>
            {user.role === "ADMIN" && (
              <Link href="/admin" className="btn btn--dark">
                Адмін-панель
              </Link>
            )}
            <form action={logoutAction}>
              <button className="btn btn--ghost">Вийти</button>
            </form>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Мої замовлення</h2>
        {orders.length === 0 ? (
          <div className={styles.empty}>
            <p>Замовлень ще немає. Коли оформите перше, тут з&apos;явиться його статус.</p>
            <Link href="/catalog" className="btn btn--dark">
              Перейти до каталогу
            </Link>
          </div>
        ) : (
          <ul className={styles.orders}>
            {orders.map((o) => (
              <li key={o.id} className={styles.order}>
                <div className={styles.orderHead}>
                  <span>№ {o.id.slice(-8).toUpperCase()}</span>
                  <span className="muted">{formatDate(o.createdAt)}</span>
                  <span className={styles.status} data-status={o.status}>
                    {ORDER_STATUS[o.status]}
                  </span>
                  <strong>{formatPrice(o.totalCents)}</strong>
                </div>
                <ul className={styles.mini}>
                  {o.items.map((i) => (
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
                <p className="muted">
                  {o.city}, {o.branch}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
