"use client";

import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  className,
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 0, ...directions[direction] }
      }
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
