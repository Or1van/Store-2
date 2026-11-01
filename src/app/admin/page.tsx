import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { setOrderStatusAction } from "@/app/actions/admin";
import styles from "@/components/admin/admin.module.css";
import { ProductForm } from "@/components/admin/ProductForm";
import { Garment } from "@/components/product/Garment";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatPrice, ORDER_STATUS } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/validation";

export const metadata: Metadata = { title: "Адмін-панель", robots: { index: false, follow: false } };

const TABS = [
  { key: "products", label: "Товари" },
  { key: "orders", label: "Замовлення" },
  { key: "subscribers", label: "Підписники" },
] as const;
type Tab = (typeof TABS)[number]["key"];

async function listImages() {
  try {
    const files = await readdir(join(process.cwd(), "public", "images"));
    return files.filter((f) => /^[a-z0-9-]+\.(jpg|jpeg|png|webp|avif)$/.test(f)).map((f) => `/images/${f}`);
  } catch {
    return [];
  }
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const requested = (await searchParams).tab;
  const tab: Tab = TABS.some((t) => t.key === requested) ? (requested as Tab) : "products";

  const [paid, users, subscribers] = await Promise.all([
    db.order.aggregate({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } }, _sum: { totalCents: true }, _count: true }),
    db.user.count({ where: { role: "USER" } }),
    db.subscriber.count(),
  ]);

  return (
    <main className="page">
      <div className="container">
        <p className="muted">Вітаємо, {admin.name}</p>
        <h1 className="page-title">Адмін-панель</h1>

        <dl className={styles.stats}>
          <div>
            <dt>Виручка</dt>
            <dd>{formatPrice(paid._sum.totalCents ?? 0)}</dd>
          </div>
          <div>
            <dt>Оплачених замовлень</dt>
            <dd>{paid._count}</dd>
          </div>
          <div>
            <dt>Покупців</dt>
            <dd>{users}</dd>
          </div>
          <div>
            <dt>Підписників</dt>
            <dd>{subscribers}</dd>
          </div>
        </dl>

        <nav className={styles.tabs} aria-label="Розділи">
          {TABS.map((t) => (
            <Link key={t.key} href={`/admin?tab=${t.key}`} aria-current={t.key === tab ? "page" : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>

        {tab === "orders" ? <Orders /> : tab === "subscribers" ? <Subscribers /> : <Products />}
      </div>
    </main>
  );
}

async function Products() {
  const [products, categories, images] = await Promise.all([
    db.product.findMany({ orderBy: { sortOrder: "asc" }, include: { category: { select: { name: true } } } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    listImages(),
  ]);

  return (
    <div className={styles.list}>
      <p className={styles.note}>
        Без фото товар малюється як ілюстрація в першому кольорі. Щоб додати фото, покладіть файл у public/images і оберіть
        його в полі «Фото».
      </p>
      {products.map((p) => (
        <details key={p.id} className={styles.item}>
          <summary>
            <Garment kind={p.kind} color={p.colorHexes[0] ?? "#9b9c99"} className={styles.thumb} />
            <span className={styles.itemName}>{p.name}</span>
            <span className="muted">{p.category.name}</span>
            <span>{formatPrice(p.priceCents)}</span>
            {!p.active && <em>приховано</em>}
          </summary>
          <ProductForm product={p} categories={categories} images={images} />
        </details>
      ))}
      <details className={`${styles.item} ${styles.new}`}>
        <summary>
          <span className={styles.itemName}>+ Додати товар</span>
        </summary>
        <ProductForm categories={categories} images={images} />
      </details>
    </div>
  );
}

async function Orders() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true } }, items: { select: { id: true, name: true, size: true, color: true, quantity: true } } },
  });
  if (orders.length === 0) return <p className={styles.note}>Замовлень ще немає.</p>;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>№</th>
            <th>Дата</th>
            <th>Покупець</th>
            <th>Доставка</th>
            <th>Склад</th>
            <th>Сума</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id.slice(-8).toUpperCase()}</td>
              <td>{formatDate(o.createdAt)}</td>
              <td>
                {o.fullName}
                <br />
                <span className="muted">
                  {o.phone}, {o.user.email}
                </span>
              </td>
              <td>
                {o.city}, {o.branch}
                {o.comment && (
                  <>
                    <br />
                    <span className="muted">«{o.comment}»</span>
                  </>
                )}
              </td>
              <td>{o.items.map((i) => `${i.name} (${i.color}, ${i.size}) × ${i.quantity}`).join("; ")}</td>
              <td className={styles.nowrap}>{formatPrice(o.totalCents)}</td>
              <td>
                <form key={o.status} action={setOrderStatusAction} className={styles.statusForm}>
                  <input type="hidden" name="id" value={o.id} />
                  <label htmlFor={`status-${o.id}`} className="visually-hidden">
                    Статус замовлення {o.id.slice(-8).toUpperCase()}
                  </label>
                  <select id={`status-${o.id}`} name="status" defaultValue={o.status} className="input">
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS[s]}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn--dark">Зберегти</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function Subscribers() {
  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  if (subscribers.length === 0) return <p className={styles.note}>Підписників ще немає.</p>;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Пошта</th>
            <th>Дата підписки</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((s) => (
            <tr key={s.id}>
              <td>{s.email}</td>
              <td>{formatDate(s.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
