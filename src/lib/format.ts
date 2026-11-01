const price = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("uk-UA", { dateStyle: "medium", timeStyle: "short" });

/** 289000 → "2 890 ₴". Prices are stored in kopiyky; the shop never charges fractions. */
export function formatPrice(cents: number) {
  return `${price.format(Math.round(cents / 100))} ₴`;
}

export function formatDate(value: Date) {
  return date.format(value);
}

export const ORDER_STATUS: Record<string, string> = {
  PENDING: "Очікує оплати",
  PAID: "Оплачено",
  SHIPPED: "Відправлено",
  DELIVERED: "Доставлено",
  CANCELLED: "Скасовано",
};

/** Ukrainian plural: plural(3, ["товар", "товари", "товарів"]) → "товари". */
export function plural(n: number, [one, few, many]: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
