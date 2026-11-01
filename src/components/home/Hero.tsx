"use client";

import gsap from "gsap";
import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import type { ClothHandle, Fabric } from "./cloth-scene";
import styles from "./hero.module.css";

const FABRICS: (Fabric & { name: string })[] = [
  { name: "Графіт", color: "#2c2d31", ink: "#ecebe6" },
  { name: "Пісок", color: "#c9b89b", ink: "#2a2a2a" },
  { name: "Олива", color: "#5b6046", ink: "#ecebe6" },
  { name: "Індиго", color: "#353e6c", ink: "#ecebe6" },
  { name: "Крейда", color: "#e9e8e2", ink: "#1d1e20" },
];

const LINES = ["Щільна", "тканина.", "Точні", "лекала."];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cloth = useRef<ClothHandle | null>(null);
  const [fabric, setFabric] = useState(0);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    // Three.js loads after first paint, so the headline never waits for it.
    import("./cloth-scene").then(({ createCloth }) => {
      if (cancelled) return;
      try {
        cloth.current = createCloth(el, FABRICS[0], reduced);
        el.dataset.ready = "true";
      } catch {
        el.hidden = true;
      }
    });
    return () => {
      cancelled = true;
      cloth.current?.dispose();
      cloth.current = null;
    };
  }, []);

  // The page's one orchestrated entrance: lines rise out of their masks, then the details.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(
        "[data-line]",
        { yPercent: 70, clipPath: "inset(0% -10% 100% -10%)" },
        { yPercent: 0, clipPath: "inset(-40% -10% -20% -10%)", duration: 1.4, stagger: 0.08, clearProps: "clipPath,transform" },
      )
        .from("[data-after]", { opacity: 0, y: 18, duration: 1, stagger: 0.08 }, "-=0.9");
    }, root);
    return () => ctx.revert();
  }, []);

  const choose = (i: number) => {
    setFabric(i);
    cloth.current?.setFabric(FABRICS[i]);
  };

  return (
    <section ref={root} className={styles.hero} aria-labelledby="hero-title">
      <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <h1 id="hero-title" className={styles.title}>
          {LINES.map((line) => (
            <span key={line} className={styles.line} data-line>
              {line}
            </span>
          ))}
        </h1>

        <p className={styles.lead} data-after>
          Базовий одяг на щодень із тканин, що витримують сотні прань. Шиємо невеликими партіями в Україні.
        </p>

        <div className={styles.actions} data-after>
          <Link href="/catalog" className="btn btn--light">
            Перейти до каталогу <ArrowUpRight />
          </Link>

          <fieldset className={styles.swatches}>
            <legend>Спробуйте тканину</legend>
            <div>
              {FABRICS.map((f, i) => (
                <button
                  key={f.name}
                  type="button"
                  className={styles.swatch}
                  style={{ "--swatch": f.color } as CSSProperties}
                  aria-pressed={fabric === i}
                  aria-label={f.name}
                  title={f.name}
                  onClick={() => choose(i)}
                />
              ))}
            </div>
            <span className={styles.swatchName} aria-live="polite">
              {FABRICS[fabric].name}
            </span>
          </fieldset>
        </div>
      </div>

      <a href="#collection" className={styles.scroll} data-after>
        Новинки сезону
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M6 1v13M1 9l5 5 5-5" />
        </svg>
      </a>
    </section>
  );
}
