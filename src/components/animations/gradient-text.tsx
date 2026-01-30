"use client";

import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function GradientText({
  children,
  className = "",
  animate = true,
}: GradientTextProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || !animate) {
    return (
      <span
        className={`bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={`bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] ${className}`}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        backgroundSize: "200% auto",
      }}
    >
      {children}
    </motion.span>
  );
}
