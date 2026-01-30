"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================
// Tech Tooltip Props
// ============================================
export interface TechTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  variant?: "default" | "info" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  delayDuration?: number;
  className?: string;
  contentClassName?: string;
}

// ============================================
// Tech Tooltip Component
// ============================================
export function TechTooltip({
  children,
  content,
  side = "top",
  align = "center",
  variant = "default",
  size = "md",
  delayDuration = 200,
  className,
  contentClassName,
}: TechTooltipProps) {
  const variants = {
    default: {
      bg: "bg-popover",
      border: "border-border",
      text: "text-popover-foreground",
      accent: "",
    },
    info: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      text: "text-primary",
      accent: "border-l-2 border-l-primary",
    },
    success: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-500",
      accent: "border-l-2 border-l-green-500",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-500",
      accent: "border-l-2 border-l-amber-500",
    },
    error: {
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      text: "text-destructive",
      accent: "border-l-2 border-l-destructive",
    },
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-sm",
  };

  const selectedVariant = variants[variant];

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "border shadow-lg backdrop-blur-sm",
            selectedVariant.bg,
            selectedVariant.border,
            selectedVariant.text,
            selectedVariant.accent,
            sizes[size],
            contentClassName
          )}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// Tech Info Badge - Icon with tooltip
// ============================================
import { Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface TechInfoBadgeProps {
  content: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  size?: "sm" | "md";
  side?: "top" | "right" | "bottom" | "left";
}

export function TechInfoBadge({
  content,
  variant = "info",
  size = "sm",
  side = "top",
}: TechInfoBadgeProps) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const Icon = icons[variant];

  const sizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
  };

  return (
    <TechTooltip content={content} variant={variant} side={side}>
      <span className="inline-flex items-center justify-center cursor-help">
        <Icon
          className={cn(
            sizes[size],
            variant === "info" && "text-primary",
            variant === "success" && "text-green-500",
            variant === "warning" && "text-amber-500",
            variant === "error" && "text-destructive"
          )}
        />
      </span>
    </TechTooltip>
  );
}

// ============================================
// Tech Keyboard Shortcut - Tooltip with keyboard shortcut
// ============================================
interface TechKeyboardShortcutProps {
  children: React.ReactNode;
  shortcut: string;
  description?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function TechKeyboardShortcut({
  children,
  shortcut,
  description,
  side = "bottom",
}: TechKeyboardShortcutProps) {
  return (
    <TechTooltip
      side={side}
      content={
        <div className="flex items-center gap-2">
          {description && <span className="text-muted-foreground">{description}</span>}
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-background border border-border rounded">
            {shortcut}
          </kbd>
        </div>
      }
    >
      {children}
    </TechTooltip>
  );
}

// ============================================
// Tech Label - Label with optional tooltip
// ============================================
interface TechLabelProps {
  children: React.ReactNode;
  tooltip?: React.ReactNode;
  tooltipVariant?: "info" | "success" | "warning" | "error";
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export function TechLabel({
  children,
  tooltip,
  tooltipVariant = "info",
  required,
  htmlFor,
  className,
}: TechLabelProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {children}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {tooltip && <TechInfoBadge content={tooltip} variant={tooltipVariant} />}
    </div>
  );
}

// Import Label for TechLabel
import { Label } from "@/components/ui/label";
