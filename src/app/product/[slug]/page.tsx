import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cardSelect, ProductCard } from "@/components/product/ProductCard";
import { ProductView } from "@/components/product/ProductView";
import { db } from "@/lib/db";
import styles from "./product.module.css";

async function getProduct(slug: string) {
  return db.product.findFirst({
    where: { slug, active: true },
    include: { category: { select: { slug: true, name: true } } },
  });
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return product ? { title: product.name, description: product.subtitle } : {};
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const related = await db.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    orderBy: { sortOrder: "asc" },
    take: 4,
    select: cardSelect,
  });

  return (
    <main className="page">
      <div className="container">
        <nav className={styles.crumbs} aria-label="Ви тут">
          <Link href="/catalog">Каталог</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/catalog?category=${product.category.slug}`}>{product.category.name}</Link>
        </nav>

        <ProductView
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            subtitle: product.subtitle,
            description: product.description,
            priceCents: product.priceCents,
            oldPriceCents: product.oldPriceCents,
            kind: product.kind,
            colorNames: product.colorNames,
            colorHexes: product.colorHexes,
            sizes: product.sizes,
            material: product.material,
            fit: product.fit,
            care: product.care,
            image: product.image,
            isNew: product.isNew,
          }}
        />

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="related-title">
            <h2 id="related-title" className={styles.relatedTitle}>
              З цієї ж полиці
            </h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
