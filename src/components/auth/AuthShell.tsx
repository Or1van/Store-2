import type { ReactNode } from "react";
import { Garment, type GarmentKind } from "@/components/product/Garment";
import styles from "./auth.module.css";

type Props = { title: string; lead: string; kind: GarmentKind; color: string; children: ReactNode };

export function AuthShell({ title, lead, kind, color, children }: Props) {
  return (
    <main className={styles.shell}>
      <div className={styles.art} aria-hidden="true">
        <Garment kind={kind} color={color} className={styles.garment} />
      </div>
      <div className={styles.panel}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lead}>{lead}</p>
        {children}
      </div>
    </main>
  );
}
