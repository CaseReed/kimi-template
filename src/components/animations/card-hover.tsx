"use client";

import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

interface CardHoverProps {
  children: ReactNode;
  className?: string;
}

export function CardHover({ children, className }: CardHoverProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -8,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className={`rounded-xl overflow-hidden ${className || ""}`}
    >
      {children}
    </motion.div>
  );
}
