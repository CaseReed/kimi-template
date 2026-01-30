import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("login.title"),
    description: t("login.description"),
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Check if user is already authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to dashboard if already logged in
  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <LoginForm locale={locale} />
    </main>
  );
}
