"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================
// Tech Border Props
// ============================================
export interface TechBorderProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  variant?: "default" | "glow" | "gradient" | "neon" | "scan";
  intensity?: "low" | "medium" | "high";
  animated?: boolean;
  cornerAccent?: boolean;
  glowColor?: string;
}

// ============================================
// Tech Border Component
// ============================================
export function TechBorder({
  children,
  className,
  containerClassName,
  variant = "default",
  intensity = "medium",
  animated = false,
  cornerAccent = false,
  glowColor,
}: TechBorderProps) {
  const intensityMap = {
    low: "1px",
    medium: "2px",
    high: "3px",
  };

  const variants = {
    default: {
      border: "border border-border",
      glow: "",
      corner: "",
    },
    glow: {
      border: cn(
        "border border-primary/30",
        animated && "animate-pulse-glow"
      ),
      glow: cn(
        "shadow-[0_0_20px_rgba(0,217,255,0.15)]",
        intensity === "high" && "shadow-[0_0_40px_rgba(0,217,255,0.25)]",
        intensity === "low" && "shadow-[0_0_10px_rgba(0,217,255,0.1)]"
      ),
      corner: "",
    },
    gradient: {
      border: "relative before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-primary/50 before:via-primary before:to-primary/50 before:-z-10",
      glow: animated ? "before:animate-gradient before:bg-[length:200%_100%]" : "",
      corner: "",
    },
    neon: {
      border: cn(
        "border border-primary/50",
        "shadow-[0_0_5px_rgba(0,217,255,0.3),0_0_10px_rgba(0,217,255,0.2)]"
      ),
      glow: animated
        ? "animate-[neon-flicker_2s_ease-in-out_infinite]"
        : "",
      corner: "",
    },
    scan: {
      border: "border border-border relative overflow-hidden",
      glow: "",
      corner: "after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-primary/10 after:to-transparent after:h-[30%] after:w-full after:animate-scan",
    },
  };

  const selectedVariant = variants[variant];

  return (
    <div className={cn("relative", containerClassName)}>
      {/* Main container */}
      <div
        className={cn(
          "relative rounded-lg bg-background",
          selectedVariant.border,
          selectedVariant.glow,
          selectedVariant.corner,
          className
        )}
        style={glowColor ? { boxShadow: `0 0 20px ${glowColor}` } : undefined}
      >
        {children}

        {/* Corner accents */}
        {cornerAccent && (
          <>
            {/* Top-left corner */}
            <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-primary rounded-tl-sm" />
            {/* Top-right corner */}
            <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-primary rounded-tr-sm" />
            {/* Bottom-left corner */}
            <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-primary rounded-bl-sm" />
            {/* Bottom-right corner */}
            <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-primary rounded-br-sm" />
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// Tech Card with Border
// ============================================
export interface TechCardProps extends Omit<TechBorderProps, 'children'> {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export function TechCard({
  children,
  title,
  description,
  headerAction,
  footer,
  className,
  ...borderProps
}: TechCardProps) {
  return (
    <TechBorder className={cn("flex flex-col", className)} {...borderProps}>
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between p-6 pb-0">
          <div className="space-y-1">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={cn("flex-1", (title || description) && "p-6 pt-4")}>
        {children}
      </div>
      {footer && (
        <div className="border-t border-border p-4 bg-muted/30 rounded-b-lg">
          {footer}
        </div>
      )}
    </TechBorder>
  );
}

// ============================================
// Tech Frame - Decorative border frame
// ============================================
export function TechFrame({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div className={cn("relative", className)}>
      {/* Frame corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
      
      {/* Content */}
      <div className={cn(sizeMap[size], "border border-border/50 bg-background/50")}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// Tech Divider - Animated divider
// ============================================
export function TechDivider({
  className,
  animated = false,
  glow = false,
}: {
  className?: string;
  animated?: boolean;
  glow?: boolean;
}) {
  return (
    <div className={cn("relative h-px w-full", className)}>
      <div
        className={cn(
          "absolute inset-0 bg-border",
          animated && "animate-shimmer bg-gradient-to-r from-transparent via-primary/50 to-transparent bg-[length:200%_100%]",
          glow && !animated && "shadow-[0_0_10px_rgba(0,217,255,0.5)]"
        )}
      />
    </div>
  );
}
