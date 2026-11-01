"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HangerMark } from "@/components/ui/icons";
import styles from "./header.module.css";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/catalog?category=hoodies", label: "Худі" },
  { href: "/catalog?category=outerwear", label: "Верхній одяг" },
  { href: "/catalog?category=bottoms", label: "Штани" },
  { href: "/catalog?sale=1", label: "Знижки" },
];

type Props = {
  user: { name: string; isAdmin: boolean } | null;
  cartCount: number;
};

export function HeaderClient({ user, cartCount }: Props) {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = pathname + (search.size ? `?${search}` : "");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y > 400 && y > last + 4) setHidden(true);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);
  // Over the dark hero the header is transparent with light text; everywhere else it is paper.
  const overHero = pathname === "/" && !scrolled && !open;

  return (
    <header className={styles.header} data-over-hero={overHero} data-hidden={hidden && !open} data-open={open}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} onClick={close} aria-label="Одяг — на головну">
          <HangerMark />
          <span>Одяг</span>
        </Link>

        <nav className={styles.nav} aria-label="Розділи магазину">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              aria-current={current === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link
            href={user ? (user.isAdmin ? "/admin" : "/account") : "/login"}
            className={styles.account}
            onClick={close}
          >
            {user ? (user.isAdmin ? "Адмін-панель" : "Кабінет") : "Увійти"}
          </Link>
          <Link href="/cart" className={styles.cart} onClick={close}>
            Кошик <span aria-label={`, товарів: ${cartCount}`}>({cartCount})</span>
          </Link>
          <button
            type="button"
            className={styles.burger}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Закрити меню" : "Відкрити меню"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={styles.mobile} hidden={!open}>
        <nav aria-label="Меню">
          {NAV.map((item, i) => (
            <Link key={item.href} href={item.href} onClick={close} style={{ animationDelay: `${60 + i * 45}ms` }}>
              {item.label}
            </Link>
          ))}
          <Link href={user ? (user.isAdmin ? "/admin" : "/account") : "/login"} onClick={close} style={{ animationDelay: "300ms" }}>
            {user ? (user.isAdmin ? "Адмін-панель" : "Кабінет") : "Увійти"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
