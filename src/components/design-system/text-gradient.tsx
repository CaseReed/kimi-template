"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextGradientProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  gradient?: string
  animate?: boolean
}

const TextGradient = React.forwardRef<HTMLSpanElement, TextGradientProps>(
  ({ className, gradient = "from-cyan-400 to-blue-500", animate = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "bg-gradient-to-r bg-clip-text text-transparent",
          gradient,
          animate && "animate-gradient bg-[length:200%_auto]",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
TextGradient.displayName = "TextGradient"

export { TextGradient }
