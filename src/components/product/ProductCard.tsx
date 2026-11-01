import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import { Garment, type GarmentKind } from "./Garment";
import styles from "./card.module.css";

export type CardProduct = {
  slug: string;
  name: string;
  subtitle: string;
  priceCents: number;
  oldPriceCents: number | null;
  kind: GarmentKind;
  colorNames: string[];
  colorHexes: string[];
  image: string | null;
  isNew: boolean;
};

export const cardSelect = {
  slug: true,
  name: true,
  subtitle: true,
  priceCents: true,
  oldPriceCents: true,
  kind: true,
  colorNames: true,
  colorHexes: true,
  image: true,
  isNew: true,
} as const;

export function ProductCard({ product, priority = false }: { product: CardProduct; priority?: boolean }) {
  const sale = product.oldPriceCents !== null && product.oldPriceCents > product.priceCents;
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {product.image ? (
          <Image src={product.image} alt="" fill sizes="(max-width: 760px) 90vw, 30vw" preload={priority} className={styles.photo} />
        ) : (
          <Garment kind={product.kind} color={product.colorHexes[0]} className={styles.garment} />
        )}
        {(product.isNew || sale) && <span className={styles.badge}>{sale ? "Знижка" : "Новинка"}</span>}
      </div>

      <div className={styles.body}>
        <div>
          <h3 className={styles.name}>
            <Link href={`/product/${product.slug}`} className={styles.link}>
              {product.name}
            </Link>
          </h3>
          <p className={styles.subtitle}>{product.subtitle}</p>
        </div>
        <span className={styles.go} aria-hidden="true">
          <ArrowUpRight size={12} />
        </span>
      </div>

      <div className={styles.foot}>
        <p className={styles.price}>
          {formatPrice(product.priceCents)}
          {sale && (
            <s className={styles.old}>
              <span className="visually-hidden">Стара ціна: </span>
              {formatPrice(product.oldPriceCents!)}
            </s>
          )}
        </p>
        <ul className={styles.colors} aria-label={`Кольори: ${product.colorNames.join(", ")}`}>
          {product.colorHexes.map((hex, i) => (
            <li key={hex + i} style={{ background: hex }} />
          ))}
        </ul>
      </div>
    </article>
  );
}
