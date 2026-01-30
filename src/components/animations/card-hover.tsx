"use client";

import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

interface CardHoverProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card hover animation with theme-aware shadow
 * Uses CSS variables for shadows that adapt to light/dark mode
 */
export function CardHover({ children, className }: CardHoverProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -8,
            }
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className={`rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-xl ${className || ""}`}
    >
      {children}
    </motion.div>
  );
}
