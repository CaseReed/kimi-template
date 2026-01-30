"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string
  glowIntensity?: "low" | "medium" | "high"
  animated?: boolean
}

// Moved outside component to avoid recreation on each render
const intensityMap = {
  low: "0 0 20px",
  medium: "0 0 30px",
  high: "0 0 50px",
}

const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, glowColor = "rgba(0, 217, 255, 0.3)", glowIntensity = "medium", animated = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg border border-primary/20 bg-background p-6",
          animated && "animate-pulse-glow",
          className
        )}
        style={{
          boxShadow: `${intensityMap[glowIntensity]} ${glowColor}`,
        }}
        {...props}
      />
    )
  }
)
GlowCard.displayName = "GlowCard"

export { GlowCard }
