import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Задовга адреса.")
  .pipe(z.email("Перевірте адресу пошти."));

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ім'я — щонайменше 2 символи.").max(60, "Ім'я — до 60 символів."),
  email: emailSchema,
  password: z.string().min(10, "Пароль — щонайменше 10 символів.").max(128, "Пароль — до 128 символів."),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Введіть пароль.").max(128),
});

export const idSchema = z.string().regex(/^c[a-z0-9]{20,32}$/);

export const MAX_QTY = 9;

export const addToCartSchema = z.object({
  productId: idSchema,
  size: z.string().trim().min(1, "Оберіть розмір.").max(8),
  color: z.string().trim().min(1, "Оберіть колір.").max(40),
});

// Ukrainian mobile numbers: +380 and nine digits; spaces, dashes and brackets are ignored.
const phone = z
  .string()
  .transform((s) => s.replace(/[\s()-]/g, ""))
  .transform((s) => (s.startsWith("0") ? `+38${s}` : s.startsWith("380") ? `+${s}` : s))
  .pipe(z.string().regex(/^\+380\d{9}$/, "Формат: +380 XX XXX XX XX."));

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, "Вкажіть ім'я та прізвище.").max(80),
  phone,
  city: z.string().trim().min(2, "Вкажіть місто.").max(60),
  branch: z.string().trim().min(1, "Вкажіть відділення або поштомат.").max(120),
  comment: z.string().trim().max(500, "Коментар — до 500 символів.").default(""),
});

// Admin content. Photos are restricted to files already in /public/images, so the
// panel can never point the site at an external host. Empty means "draw the garment".
const imagePath = z
  .string()
  .trim()
  .transform((s) => s || null)
  .pipe(
    z
      .string()
      .regex(/^\/images\/[a-z0-9-]+\.(jpg|jpeg|png|webp|avif)$/, "Шлях має бути виду /images/name.jpg")
      .nullable(),
  );
const hryvnias = z.coerce.number().int("Ціна в гривнях, без копійок.").min(1).max(1_000_000);
const flag = z.preprocess((v) => v === "on" || v === "true", z.boolean());

export const GARMENT_KINDS = ["TEE", "LONGSLEEVE", "HOODIE", "SWEATSHIRT", "BOMBER", "COAT", "PANTS", "SHORTS"] as const;

export const productSchema = z
  .object({
    slug: z.string().trim().regex(/^[a-z0-9-]{2,60}$/, "Лише латиниця, цифри та дефіс."),
    name: z.string().trim().min(2, "Обов'язкове поле.").max(80),
    subtitle: z.string().trim().min(2, "Обов'язкове поле.").max(120),
    description: z.string().trim().min(10, "Опишіть товар хоча б одним реченням.").max(2000),
    price: hryvnias,
    oldPrice: z.preprocess((v) => (v === "" || v === undefined ? null : v), hryvnias.nullable()),
    kind: z.enum(GARMENT_KINDS, "Оберіть силует."),
    categoryId: idSchema,
    // One colour per line: "Графіт #2a2b2e".
    colors: z
      .string()
      .transform((s) => s.split("\n").map((l) => l.trim()).filter(Boolean))
      .pipe(
        z
          .array(z.string().regex(/^.{1,30}\s#[0-9a-fA-F]{6}$/, "Кожен рядок: «Назва #rrggbb»."))
          .min(1, "Додайте хоча б один колір.")
          .max(8),
      ),
    sizes: z
      .string()
      .transform((s) => s.split(/[,\s]+/).map((l) => l.trim().toUpperCase()).filter(Boolean))
      .pipe(z.array(z.string().max(8)).min(1, "Додайте хоча б один розмір.").max(12)),
    material: z.string().trim().min(2, "Обов'язкове поле.").max(200),
    fit: z.string().trim().min(2, "Обов'язкове поле.").max(40),
    care: z.string().trim().max(300).default(""),
    image: imagePath,
    sortOrder: z.coerce.number().int().min(0).max(999),
    isNew: flag,
    featured: flag,
    active: flag,
  })
  .refine((p) => p.oldPrice === null || p.oldPrice > p.price, {
    path: ["oldPrice"],
    message: "Стара ціна має бути більшою за нову.",
  })
  .transform(({ colors, price, oldPrice, ...rest }) => ({
    ...rest,
    priceCents: price * 100,
    oldPriceCents: oldPrice === null ? null : oldPrice * 100,
    colorNames: colors.map((c) => c.slice(0, c.lastIndexOf("#")).trim()),
    colorHexes: colors.map((c) => c.slice(c.lastIndexOf("#")).toLowerCase()),
  }));

export const ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

/** Only same-site relative paths; blocks `//evil.com` and `/\evil.com` open redirects. */
export function safeNext(value: unknown, fallback = "/") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Echo of submitted fields (never passwords): React resets forms after an action. */
  values?: Record<string, string>;
};

/** String fields from a FormData, minus anything secret. */
export function echo(formData: FormData, ...keys: string[]) {
  const out: Record<string, string> = {};
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === "string") out[key] = value.slice(0, 4000);
  }
  return out;
}
