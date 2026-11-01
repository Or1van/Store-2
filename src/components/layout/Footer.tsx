import Link from "next/link";
import styles from "./footer.module.css";

const COLUMNS = [
  {
    title: "Каталог",
    links: [
      { href: "/catalog?category=tees", label: "Футболки й лонгсліви" },
      { href: "/catalog?category=hoodies", label: "Худі та світшоти" },
      { href: "/catalog?category=outerwear", label: "Верхній одяг" },
      { href: "/catalog?category=bottoms", label: "Штани та шорти" },
    ],
  },
  {
    title: "Покупцям",
    links: [
      { href: "/help#delivery", label: "Доставка та оплата" },
      { href: "/help#returns", label: "Повернення й обмін" },
      { href: "/help#sizes", label: "Таблиця розмірів" },
      { href: "/help#care", label: "Догляд за речами" },
    ],
  },
  {
    title: "Акаунт",
    links: [
      { href: "/account", label: "Мої замовлення" },
      { href: "/cart", label: "Кошик" },
      { href: "/register", label: "Реєстрація" },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className={styles.title}>{col.title}</h2>
            <ul>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <h2 className={styles.title}>Оплата</h2>
          <ul className={styles.pay}>
            <li>Visa</li>
            <li>Mastercard</li>
            <li>Apple Pay</li>
            <li>Google Pay</li>
          </ul>
          <p className={styles.note}>Доставка Новою поштою по всій Україні, від 2 500 ₴ — безкоштовно.</p>
        </div>
      </div>

      <div className={`container ${styles.legal}`}>
        <p>© {new Date().getFullYear()} Одяг. Демонстраційний магазин.</p>
        <Link href="/help#privacy">Політика конфіденційності</Link>
      </div>

      <p className={styles.wordmark} aria-hidden="true">
        Одяг
      </p>
    </footer>
  );
}
