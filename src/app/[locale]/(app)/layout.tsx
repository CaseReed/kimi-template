import { Header } from "@/components/layout/header";
import { SkipLink } from "@/components/a11y";

// App layout - WITH Header navigation
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <Header />
      <div id="main-content">
        {children}
      </div>
    </>
  );
}
