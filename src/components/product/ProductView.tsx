"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { addToCartAction, type CartState } from "@/app/actions/cart";
import { formatPrice } from "@/lib/format";
import { Garment, type GarmentKind } from "./Garment";
import styles from "@/app/product/[slug]/product.module.css";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    subtitle: string;
    description: string;
    priceCents: number;
    oldPriceCents: number | null;
    kind: GarmentKind;
    colorNames: string[];
    colorHexes: string[];
    sizes: string[];
    material: string;
    fit: string;
    care: string;
    image: string | null;
    isNew: boolean;
  };
};

export function ProductView({ product }: Props) {
  const router = useRouter();
  const [color, setColor] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [state, action, pending] = useActionState<CartState, FormData>(addToCartAction, {});
  const stage = useRef<HTMLDivElement>(null);
  const sale = product.oldPriceCents !== null && product.oldPriceCents > product.priceCents;

  useEffect(() => {
    if (state.needsLogin) router.push(`/login?next=${encodeURIComponent(`/product/${product.slug}`)}`);
  }, [state, router, product.slug]);

  // The garment leans toward the pointer, like turning a hanger to look at it.
  useEffect(() => {
    const el = stage.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const art = el.querySelector<HTMLElement>("[data-tilt]");
    if (!art) return;
    let frame = 0;
    const target = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };
    const loop = () => {
      now.x += (target.x - now.x) * 0.08;
      now.y += (target.y - now.y) * 0.08;
      art.style.transform = `rotateX(${now.y * -9}deg) rotateY(${now.x * 14}deg) translateZ(0)`;
      el.style.setProperty("--lx", `${50 + now.x * 30}%`);
      el.style.setProperty("--ly", `${40 + now.y * 30}%`);
      if (Math.abs(target.x - now.x) > 0.001 || Math.abs(target.y - now.y) > 0.001) frame = requestAnimationFrame(loop);
      else frame = 0;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width - 0.5;
      target.y = (e.clientY - r.top) / r.height - 0.5;
      kick();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const sizeError = state.errors?.size;

  return (
    <div className={styles.layout}>
      <div ref={stage} className={styles.stage}>
        <div className={styles.art} data-tilt>
          {product.image ? (
            <Image src={product.image} alt={product.name} fill preload sizes="(max-width: 900px) 100vw, 55vw" className={styles.photo} />
          ) : (
            <Garment
              kind={product.kind}
              color={product.colorHexes[color]}
              className={styles.garment}
              title={`${product.name}, колір ${product.colorNames[color].toLowerCase()}`}
            />
          )}
        </div>
        {(product.isNew || sale) && <span className={styles.badge}>{sale ? "Знижка" : "Новинка"}</span>}
      </div>

      <div className={styles.info}>
        <h1 className={styles.name}>{product.name}</h1>
        <p className={styles.subtitle}>{product.subtitle}</p>
        <p className={styles.price}>
          {formatPrice(product.priceCents)}
          {sale && (
            <s className={styles.old}>
              <span className="visually-hidden">Стара ціна: </span>
              {formatPrice(product.oldPriceCents!)}
            </s>
          )}
        </p>

        <form action={action} className={styles.form}>
          <input type="hidden" name="productId" value={product.id} />

          <fieldset className={styles.group}>
            <legend>
              Колір: <strong>{product.colorNames[color]}</strong>
            </legend>
            <div className={styles.colors}>
              {product.colorNames.map((name, i) => (
                <label key={name} className={styles.color} style={{ background: product.colorHexes[i] }} title={name}>
                  <input
                    type="radio"
                    name="color"
                    value={name}
                    checked={color === i}
                    onChange={() => setColor(i)}
                    className="visually-hidden"
                  />
                  <span className="visually-hidden">{name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group} aria-describedby={sizeError ? "size-error" : undefined}>
            <legend className={styles.sizeLegend}>
              <span>Розмір</span>
              <Link href="/help#sizes">Таблиця розмірів</Link>
            </legend>
            <div className={styles.sizes}>
              {product.sizes.map((s) => (
                <label key={s} className={styles.size}>
                  <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} className="visually-hidden" />
                  <span>{s}</span>
                </label>
              ))}
            </div>
            {sizeError && (
              <p id="size-error" className="field-error">
                {sizeError}
              </p>
            )}
          </fieldset>

          <button className="btn btn--dark btn--wide" disabled={pending}>
            {pending ? "Додаємо…" : size ? `Додати в кошик — ${size}` : "Додати в кошик"}
          </button>

          <p className="form-message" data-ok={Boolean(state.ok)} role="status">
            {state.message}
            {state.ok && (
              <>
                {" "}
                <Link href="/cart" className={styles.toCart}>
                  Перейти до кошика
                </Link>
              </>
            )}
          </p>
        </form>

        <p className={styles.description}>{product.description}</p>

        <dl className={styles.specs}>
          <div>
            <dt>Склад</dt>
            <dd>{product.material}</dd>
          </div>
          <div>
            <dt>Крій</dt>
            <dd>{product.fit}</dd>
          </div>
          {product.care && (
            <div>
              <dt>Догляд</dt>
              <dd>{product.care}</dd>
            </div>
          )}
          <div>
            <dt>Доставка</dt>
            <dd>Новою поштою за 1–3 дні. Від 2 500 ₴ — безкоштовно. Обмін і повернення — 14 днів.</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
