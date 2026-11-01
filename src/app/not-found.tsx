import Link from "next/link";
import { Garment } from "@/components/product/Garment";

export default function NotFound() {
  return (
    <main className="page">
      <div className="container" style={{ display: "grid", justifyItems: "start", gap: "1.4rem", maxWidth: 720 }}>
        <div style={{ width: 200 }}>
          <Garment kind="TEE" color="#c9b89b" />
        </div>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Такої сторінки немає
        </h1>
        <p className="muted">Можливо, модель зняли з продажу або посилання застаріло. Решта речей на місці.</p>
        <Link href="/catalog" className="btn btn--dark">
          Перейти до каталогу
        </Link>
      </div>
    </main>
  );
}
