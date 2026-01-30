"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  children,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  children?: React.ReactNode
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        "data-[orientation=horizontal]:h-[1px] data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-[1px]",
        children && "relative flex items-center justify-center",
        className
      )}
      {...props}
    >
      {children && (
        <span className="bg-background px-2 text-xs text-muted-foreground">
          {children}
        </span>
      )}
    </SeparatorPrimitive.Root>
  )
}
Separator.displayName = "Separator"

export { Separator }
