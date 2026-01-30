"use client";

import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
}

export function AnimatedButton({
  children,
  className = "",
  onClick,
  href,
  variant = "primary",
}: AnimatedButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  const baseStyles =
    "inline-flex items-center justify-center rounded-lg px-8 py-3 text-sm font-medium transition-colors";

  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    outline:
      "border border-border bg-background text-foreground hover:bg-muted",
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      whileHover={
        shouldReduceMotion
          ? undefined
          : { scale: 1.03, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }
      }
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </Component>
  );
}
