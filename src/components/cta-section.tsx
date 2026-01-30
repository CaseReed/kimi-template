"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ScrollReveal } from "@/components/animations";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  className?: string;
}

export function CTASection({
  title,
  description,
  buttonText,
  buttonHref,
  className,
}: CTASectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className={cn("py-24 sm:py-32", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary opacity-90" />
            
            {/* Subtle pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />

            {/* Content */}
            <div className="relative z-10 px-6 py-16 sm:px-16 sm:py-20 text-center">
              <motion.h2
                className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-4"
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: shouldReduceMotion ? 0 : 0.6, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                {title}
              </motion.h2>
              
              <motion.p
                className="mx-auto max-w-xl text-lg text-primary-foreground/80 mb-8"
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: shouldReduceMotion ? 0 : 0.6, 
                  delay: 0.1,
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                {description}
              </motion.p>

              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: shouldReduceMotion ? 0 : 0.6, 
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className={cn(
                    "border-2 border-white text-white bg-transparent hover:bg-white/10",
                    "shadow-lg shadow-black/20",
                    "transition-all duration-200"
                  )}
                >
                  <Link href={buttonHref}>
                    {buttonText}
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Decorative corner glows */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
