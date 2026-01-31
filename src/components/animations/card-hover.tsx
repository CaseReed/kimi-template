"use client";

import { motion, useReducedMotion } from "motion/react";
import { CSSProperties, ReactNode } from "react";

interface CardHoverProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Card hover animation with theme-aware shadow
 * Uses CSS variables for shadows that adapt to light/dark mode
 */
export function CardHover({ children, className = "", style }: CardHoverProps) {
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
      className={`h-full rounded-lg transition-shadow duration-300 hover:shadow-xl ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}
