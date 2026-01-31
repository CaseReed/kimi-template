import { SkipLink, MainContent } from "@/components/accessibility";

/**
 * Auth Layout - Shared layout for login/register pages
 * 
 * Accessibility features:
 * - SkipLink for keyboard navigation
 * - MainContent landmark for main content area
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink href="#auth-main-content">Skip to main content</SkipLink>
      <MainContent 
        id="auth-main-content" 
        className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
      >
        {children}
      </MainContent>
    </>
  );
}
