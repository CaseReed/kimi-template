"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Constants defined outside component to avoid recreation
const DEFAULT_GLOW_COLOR = "rgba(0, 217, 255, 0.3)"

const intensityMap = {
  low: "0 0 15px",
  medium: "0 0 30px",
  high: "0 0 50px",
} as const

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string
  glowIntensity?: "low" | "medium" | "high"
  animated?: boolean
}

const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, glowColor, glowIntensity = "medium", animated = false, ...props }, ref) => {
    const shadowColor = glowColor ?? DEFAULT_GLOW_COLOR
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg bg-background p-6",
          "border border-primary/40 ring-1 ring-primary/20",
          animated && "animate-pulse-glow",
          className
        )}
        style={{
          boxShadow: `${intensityMap[glowIntensity]} ${shadowColor}`,
        }}
        {...props}
      />
    )
  }
)

GlowCard.displayName = "GlowCard"

export { GlowCard, type GlowCardProps }
