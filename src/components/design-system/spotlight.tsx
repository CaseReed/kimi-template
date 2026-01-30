"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  spotlightColor?: string
}

const Spotlight = React.forwardRef<HTMLDivElement, SpotlightProps>(
  ({ className, spotlightColor = "rgba(0, 217, 255, 0.15)", children, ...props }, ref) => {
    const divRef = React.useRef<HTMLDivElement>(null)
    const [position, setPosition] = React.useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = React.useState(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return
      const rect = divRef.current.getBoundingClientRect()
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const handleMouseEnter = () => setOpacity(1)
    const handleMouseLeave = () => setOpacity(0)

    return (
      <div
        ref={(node) => {
          // Forward ref
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
          // Also set local ref
          ;(divRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        }}
        className={cn(
          "relative overflow-hidden rounded-lg border border-border bg-background p-6",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
          }}
        />
        {children}
      </div>
    )
  }
)
Spotlight.displayName = "Spotlight"

export { Spotlight }
