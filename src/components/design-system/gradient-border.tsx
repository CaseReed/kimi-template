"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  gradient?: string
}

const GradientBorder = React.forwardRef<HTMLDivElement, GradientBorderProps>(
  ({ className, gradient = "from-cyan-500 via-blue-500 to-cyan-500", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg p-[1px] bg-gradient-to-r",
          gradient,
          className
        )}
        {...props}
      >
        <div className="relative rounded-lg bg-background p-6 h-full">
          {children}
        </div>
      </div>
    )
  }
)
GradientBorder.displayName = "GradientBorder"

export { GradientBorder }
