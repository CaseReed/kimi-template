"use client";

import { motion, useReducedMotion } from "motion/react";

interface AnimatedLogoProps {
  className?: string;
}

export function AnimatedLogo({ className = "" }: AnimatedLogoProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`relative ${className}`}
      initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary"
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                rotate: [0, -10, 10, -10, 10, 0],
                scale: 1.05,
              }
        }
        transition={{ duration: 0.5 }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-primary-foreground"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </motion.div>
      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 blur-xl bg-gradient-to-br from-primary/50 to-secondary/50 rounded-xl" />
    </motion.div>
  );
}
