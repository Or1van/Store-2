import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/validation";

export const metadata: Metadata = { title: "Вхід" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthShell title="Вхід" lead="Кошик і замовлення збережені у вашому акаунті." kind="BOMBER" color="#6a694c">
      <AuthForm mode="login" next={next} />
    </AuthShell>
  );
}
