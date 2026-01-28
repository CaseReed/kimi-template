import type { Metadata } from "next";

// This is the root layout that wraps all locales
// The actual layout with providers is in [locale]/layout.tsx

export const metadata: Metadata = {
  title: "Dashboard Demo",
  description: "Dashboard interactif avec TanStack Query, Motion et shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
