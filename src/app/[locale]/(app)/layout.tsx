import { Header } from "@/components/layout/header";

// App layout - WITH Header navigation
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
