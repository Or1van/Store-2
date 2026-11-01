import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { Newsletter } from "@/components/home/Newsletter";
import styles from "@/components/home/home.module.css";
import { Garment, type GarmentKind } from "@/components/product/Garment";
import { cardSelect, ProductCard } from "@/components/product/ProductCard";
import { ArrowUpRight } from "@/components/ui/icons";
import { db } from "@/lib/db";
import { plural } from "@/lib/format";

const FABRICS = [
  {
    name: "Тринитка 360 г/м²",
    text: "Петлі з виворту тримають тепло, а лицьова сторона не скочується навіть після сотні прань.",
    used: "Худі та світшоти",
    texture: "loop",
  },
  {
    name: "Ріп-стоп",
    text: "Посилена нитка кожні 5 мм. Якщо зачепитесь за гвіздок, дірка не поповзе далі.",
    used: "Карго та бомбери",
    texture: "grid",
  },
  {
    name: "Вовна з кашеміром",
    text: "Тепло без ваги. Тканина тримає лінію плеча й не мнеться в рюкзаку.",
    used: "Пальта",
    texture: "herringbone",
  },
] as const;

const CATEGORY_LOOK: Record<string, { kind: GarmentKind; color: string }> = {
  tees: { kind: "TEE", color: "#ecebe6" },
  hoodies: { kind: "HOODIE", color: "#9b9c99" },
  outerwear: { kind: "BOMBER", color: "#2a2b2e" },
  bottoms: { kind: "PANTS", color: "#6a694c" },
};

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    db.product.findMany({
      where: { active: true, featured: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
      select: cardSelect,
    }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, _count: { select: { products: { where: { active: true } } } } },
    }),
  ]);

  return (
    <main>
      <Hero />

      <section id="collection" className={styles.collection} aria-labelledby="collection-title">
        <div className="container">
          <div className={styles.collectionHead}>
            <h2 id="collection-title" className={styles.bigTitle}>
              Нова партія на&nbsp;осінь
            </h2>
            <p className={styles.collectionText}>
              Худі з тринитки, бомбер із водовідштовхувальним верхом і карго з ріп-стопу. Пошили 300 штук кожної моделі.
            </p>
            <Link href="/catalog" className="btn btn--dark">
              Усі моделі <ArrowUpRight />
            </Link>
          </div>

          <div className={styles.cards}>
            {featured.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i === 0} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.fabrics} aria-labelledby="fabrics-title">
        <div className={`container ${styles.fabricsGrid}`}>
          <div className={styles.fabricsHead}>
            <h2 id="fabrics-title" className={styles.bigTitle}>
              Носиться роками, а&nbsp;не&nbsp;сезон
            </h2>
            <p className={styles.fabricsText}>
              Ми починаємо з тканини, а не з ескізу. Кожне полотно перед партією проходить 50 циклів прання в нашій
              лабораторії.
            </p>
            <Link href="/help#care" className="btn btn--light">
              Як доглядати за речами <ArrowUpRight />
            </Link>
          </div>

          <ul className={styles.swatches}>
            {FABRICS.map((f) => (
              <li key={f.name} className={styles.swatchCard}>
                <div className={styles.swatch} data-texture={f.texture} aria-hidden="true" />
                <h3 className={styles.swatchName}>{f.name}</h3>
                <p className={styles.swatchText}>{f.text}</p>
                <p className={styles.swatchUsed}>{f.used}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.categories} aria-labelledby="categories-title">
        <div className="container">
          <h2 id="categories-title" className={styles.midTitle}>
            Що шукаєте?
          </h2>
          <ul className={styles.categoryGrid}>
            {categories.map((c) => {
              const look = CATEGORY_LOOK[c.slug] ?? { kind: "TEE" as const, color: "#9b9c99" };
              const n = c._count.products;
              return (
                <li key={c.slug}>
                  <Link href={`/catalog?category=${c.slug}`} className={styles.category}>
                    <Garment kind={look.kind} color={look.color} className={styles.categoryArt} />
                    <span className={styles.categoryName}>{c.name}</span>
                    <span className={styles.categoryCount}>
                      {n} {plural(n, ["модель", "моделі", "моделей"])}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <Newsletter />
    </main>
  );
}
