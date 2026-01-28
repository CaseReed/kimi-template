"use client";

import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query-keys";

import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

interface RefreshButtonProps {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}

export function RefreshButton({
  variant = "outline",
  size = "sm",
}: RefreshButtonProps) {
  const t = useTranslations("dashboard.actions");
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const shouldReduceMotion = useReducedMotion();

  const handleRefresh = () => {
    startTransition(async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all,
      });
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={isPending}
      aria-label={t("refreshAriaLabel")}
      aria-busy={isPending}
    >
      <motion.div
        animate={isPending && !shouldReduceMotion ? { rotate: 360 } : { rotate: 0 }}
        transition={{
          duration: 1,
          repeat: isPending && !shouldReduceMotion ? Infinity : 0,
          ease: "linear",
        }}
      >
        <RefreshCw className="h-4 w-4" />
      </motion.div>
      <span className="ml-2">{t("refresh")}</span>
    </Button>
  );
}
