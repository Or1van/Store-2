import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/validation";

export const metadata: Metadata = { title: "Реєстрація" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthShell
      title="Новий акаунт"
      lead="Акаунт потрібен, щоб зберігати кошик і стежити за доставкою."
      kind="HOODIE"
      color="#9b9c99"
    >
      <AuthForm mode="register" next={next} />
    </AuthShell>
  );
}
