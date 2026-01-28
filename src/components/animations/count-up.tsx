"use client";

import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 2,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const shouldReduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(end);
      return;
    }

    const controls = animate(count, end, {
      duration,
      ease: "easeOut",
    });

    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, end, duration, rounded, shouldReduceMotion]);

  return (
    <motion.span className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  );
}
