import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground border-border",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20",
        outline:
          "border border-border text-foreground",
        success:
          "bg-green-500/10 text-green-500 border-green-500/20",
        warning:
          "bg-amber-500/10 text-amber-500 border-amber-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Badge = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }>(
  ({ className, variant = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span"
    return (
      <Comp
        ref={ref}
        data-slot="badge"
        data-variant={variant}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
