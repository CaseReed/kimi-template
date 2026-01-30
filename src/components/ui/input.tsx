import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-md border border-border bg-background-2 px-3 py-2 text-foreground",
          // File input styling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Placeholder
          "placeholder:text-muted-foreground",
          // Focus state - Tech Noir cyan glow
          "focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:outline-none",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Error state
          "data-[error=true]:border-destructive data-[error=true]:ring-destructive/20",
          // Transition
          "transition-colors",
          className
        )}
        ref={ref}
        suppressHydrationWarning
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
