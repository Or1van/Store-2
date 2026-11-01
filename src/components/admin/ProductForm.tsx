"use client";

import { useActionState } from "react";
import { deleteProductAction, saveProductAction } from "@/app/actions/admin";
import { GARMENT_LABEL, type GarmentKind } from "@/components/product/Garment";
import { GARMENT_KINDS, type FormState } from "@/lib/validation";
import styles from "./admin.module.css";

type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  priceCents: number;
  oldPriceCents: number | null;
  kind: GarmentKind;
  categoryId: string;
  colorNames: string[];
  colorHexes: string[];
  sizes: string[];
  material: string;
  fit: string;
  care: string;
  image: string | null;
  sortOrder: number;
  isNew: boolean;
  featured: boolean;
  active: boolean;
};

type Props = {
  product?: Product;
  categories: { id: string; name: string }[];
  images: string[];
};

/** Initial form values as strings, the same shape the form submits. */
function toValues(p?: Product): Record<string, string> {
  if (!p) return { sortOrder: "0", sizes: "XS S M L XL XXL", active: "on" };
  return {
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    description: p.description,
    price: String(p.priceCents / 100),
    oldPrice: p.oldPriceCents ? String(p.oldPriceCents / 100) : "",
    kind: p.kind,
    categoryId: p.categoryId,
    colors: p.colorNames.map((n, i) => `${n} ${p.colorHexes[i]}`).join("\n"),
    sizes: p.sizes.join(" "),
    material: p.material,
    fit: p.fit,
    care: p.care,
    image: p.image ?? "",
    sortOrder: String(p.sortOrder),
    ...(p.isNew && { isNew: "on" }),
    ...(p.featured && { featured: "on" }),
    ...(p.active && { active: "on" }),
  };
}

export function ProductForm({ product, categories, images }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProductAction, {});
  const err = state.errors ?? {};
  const v = state.values ?? toValues(product);
  const id = (name: string) => `${product?.id ?? "new"}-${name}`;

  const text = (name: string, label: string, hint?: string, type = "text") => (
    <div className="field">
      <label htmlFor={id(name)}>{label}</label>
      <input id={id(name)} name={name} type={type} className="input" defaultValue={v[name] ?? ""} aria-invalid={Boolean(err[name])} />
      {err[name] ? <p className="field-error">{err[name]}</p> : hint && <p className="field-hint">{hint}</p>}
    </div>
  );
  const area = (name: string, label: string, rows: number, hint?: string) => (
    <div className={`field ${styles.wide}`}>
      <label htmlFor={id(name)}>{label}</label>
      <textarea id={id(name)} name={name} className="input" rows={rows} defaultValue={v[name] ?? ""} aria-invalid={Boolean(err[name])} />
      {err[name] ? <p className="field-error">{err[name]}</p> : hint && <p className="field-hint">{hint}</p>}
    </div>
  );
  const check = (name: string, label: string) => (
    <label className={styles.check}>
      <input type="checkbox" name={name} defaultChecked={name in v} />
      {label}
    </label>
  );

  return (
    <div className={styles.formWrap}>
      {/* key: React resets uncontrolled fields after an action; remount with the echoed values. */}
      <form key={JSON.stringify(state.values ?? null)} action={action} className={styles.form}>
        {product && <input type="hidden" name="id" value={product.id} />}
        {text("name", "Назва")}
        {text("slug", "Slug (адреса сторінки)", "латиниця, цифри, дефіс")}
        {text("subtitle", "Підзаголовок")}
        <div className="field">
          <label htmlFor={id("categoryId")}>Категорія</label>
          <select id={id("categoryId")} name="categoryId" className="input" defaultValue={v.categoryId ?? categories[0]?.id}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {err.categoryId && <p className="field-error">{err.categoryId}</p>}
        </div>
        {text("price", "Ціна, ₴", undefined, "number")}
        {text("oldPrice", "Стара ціна, ₴", "порожньо — без знижки", "number")}
        <div className="field">
          <label htmlFor={id("kind")}>Силует ілюстрації</label>
          <select id={id("kind")} name="kind" className="input" defaultValue={v.kind ?? "TEE"}>
            {GARMENT_KINDS.map((k) => (
              <option key={k} value={k}>
                {GARMENT_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={id("image")}>Фото</label>
          <select id={id("image")} name="image" className="input" defaultValue={v.image ?? ""}>
            <option value="">Без фото (ілюстрація)</option>
            {images.map((img) => (
              <option key={img} value={img}>
                {img}
              </option>
            ))}
          </select>
          {err.image && <p className="field-error">{err.image}</p>}
        </div>
        {area("description", "Опис", 4)}
        {area("colors", "Кольори", 3, "по одному в рядку: Графіт #2a2b2e")}
        {text("sizes", "Розміри", "через пробіл: XS S M L XL")}
        {text("material", "Склад")}
        {text("fit", "Крій")}
        {text("sortOrder", "Порядок у каталозі", undefined, "number")}
        {area("care", "Догляд", 2)}
        <div className={styles.checks}>
          {check("active", "У продажу")}
          {check("featured", "На головній")}
          {check("isNew", "Новинка")}
        </div>

        <div className={styles.formActions}>
          <button className="btn btn--dark" disabled={pending}>
            {pending ? "Збереження…" : product ? "Зберегти" : "Створити товар"}
          </button>
          {state.message && (
            <span className="form-message" data-ok={Boolean(state.ok)} role="status">
              {state.message}
            </span>
          )}
        </div>
      </form>

      {product && (
        <form
          action={deleteProductAction}
          className={styles.deleteForm}
          onSubmit={(e) => {
            if (!confirm(`Видалити «${product.name}» назавжди? Історія замовлень збережеться.`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={product.id} />
          <button className={styles.delete}>Видалити товар</button>
        </form>
      )}
    </div>
  );
}
