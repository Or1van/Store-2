import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { cardSelect, ProductCard } from "@/components/product/ProductCard";
import { db } from "@/lib/db";
import { plural } from "@/lib/format";
import styles from "./catalog.module.css";

export const metadata: Metadata = { title: "Каталог" };

const SORTS = {
  popular: { label: "Спершу популярні", orderBy: [{ featured: "desc" }, { sortOrder: "asc" }] },
  new: { label: "Спершу нові", orderBy: [{ isNew: "desc" }, { createdAt: "desc" }] },
  cheap: { label: "Дешевші", orderBy: [{ priceCents: "asc" }] },
  expensive: { label: "Дорожчі", orderBy: [{ priceCents: "desc" }] },
} satisfies Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput[] }>;
type Sort = keyof typeof SORTS;

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];

function one(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  const params = await searchParams;
  const category = one(params.category);
  const sort: Sort = (one(params.sort) ?? "") in SORTS ? (one(params.sort) as Sort) : "popular";
  const size = SIZES.includes(one(params.size) ?? "") ? one(params.size) : undefined;
  const sale = one(params.sale) === "1";
  const q = one(params.q)?.trim().slice(0, 60) ?? "";

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(category && { category: { slug: category } }),
    ...(size && { sizes: { has: size } }),
    ...(sale && { oldPriceCents: { not: null } }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { subtitle: { contains: q, mode: "insensitive" } },
        { material: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
    db.product.findMany({ where, orderBy: SORTS[sort].orderBy, select: cardSelect }),
  ]);
  const current = categories.find((c) => c.slug === category);

  // Builds a catalog URL from the current filters with some of them changed.
  const href = (change: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { category, sort: sort === "popular" ? undefined : sort, size, sale: sale ? "1" : undefined, q: q || undefined, ...change };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `/catalog?${s}` : "/catalog";
  };

  return (
    <main className="page">
      <div className="container">
        <div className={styles.head}>
          <h1 className="page-title">{sale ? "Знижки" : (current?.name ?? "Каталог")}</h1>
          <p className="muted">
            {products.length} {plural(products.length, ["модель", "моделі", "моделей"])}
          </p>
        </div>

        <div className={styles.filters}>
          <nav className={styles.pills} aria-label="Категорії">
            <Link href={href({ category: undefined })} aria-current={!category ? "page" : undefined}>
              Усе
            </Link>
            {categories.map((c) => (
              <Link key={c.slug} href={href({ category: c.slug })} aria-current={c.slug === category ? "page" : undefined}>
                {c.name}
              </Link>
            ))}
            <Link href={href({ sale: sale ? undefined : "1" })} aria-current={sale ? "page" : undefined}>
              Зі знижкою
            </Link>
          </nav>

          <form action="/catalog" className={styles.search} role="search">
            {category && <input type="hidden" name="category" value={category} />}
            <label htmlFor="catalog-q" className="visually-hidden">
              Пошук у каталозі
            </label>
            <input id="catalog-q" name="q" type="search" className="input" placeholder="Худі, льон, бомбер…" defaultValue={q} />
          </form>
        </div>

        <div className={styles.secondary}>
          <div className={styles.sizes} role="group" aria-label="Розмір">
            <span className="muted">Розмір</span>
            {SIZES.map((s) => (
              <Link key={s} href={href({ size: s === size ? undefined : s })} aria-pressed={s === size} className={styles.size}>
                {s}
              </Link>
            ))}
          </div>
          <nav className={styles.sort} aria-label="Сортування">
            {(Object.keys(SORTS) as Sort[]).map((key) => (
              <Link key={key} href={href({ sort: key === "popular" ? undefined : key })} aria-current={key === sort ? "true" : undefined}>
                {SORTS[key].label}
              </Link>
            ))}
          </nav>
        </div>

        {products.length === 0 ? (
          <div className={styles.empty}>
            <p>Нічого не знайшли за цими фільтрами.</p>
            <Link href="/catalog" className="btn btn--dark">
              Скинути фільтри
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
