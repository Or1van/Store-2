import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import { connection } from "next/server";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";

// Both families are Ukrainian-designed and cover Cyrillic fully.
const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin", "cyrillic"], weight: ["600", "800"] });
const onest = Onest({ variable: "--font-onest", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: { default: "Одяг — базовий одяг на щодень", template: "%s · Одяг" },
  description: "Футболки, худі, верхній одяг і штани з щільних тканин. Доставка Новою поштою по Україні.",
};

export const viewport: Viewport = {
  themeColor: "#1d1e20",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Render per request: the CSP nonce from src/proxy.ts is new for every response.
  await connection();

  return (
    <html lang="uk" className={`${unbounded.variable} ${onest.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Перейти до вмісту
        </a>
        <SmoothScroll />
        <Header />
        <div id="main">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
