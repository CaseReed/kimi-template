"use client";

import Link from "next/link";

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * SkipLink - Provides a way for keyboard users to skip to main content
 * 
 * Accessibility features:
 * - Hidden by default, visible on focus
 * - First focusable element in the tab order
 * - Allows keyboard users to skip navigation
 * 
 * Usage: Place at the very beginning of the body content
 * 
 * @example
 * <SkipLink href="#main-content">Skip to main content</SkipLink>
 * <nav>...</nav>
 * <main id="main-content">...</main>
 */
export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <Link
      href={href}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground 
        focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 
        focus:ring-primary focus:ring-offset-2
        ${className || ""}
      `}
    >
      {children}
    </Link>
  );
}

/**
 * MainContent - Wrapper for main content with proper ID for skip link
 * 
 * @example
 * <MainContent>
 *   <h1>Page Title</h1>
 *   ...
 * </MainContent>
 */
interface MainContentProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  tabIndex?: number;
}

export function MainContent({
  children,
  id = "main-content",
  className,
  tabIndex = -1,
}: MainContentProps) {
  return (
    <main id={id} className={className} tabIndex={tabIndex}>
      {children}
    </main>
  );
}
