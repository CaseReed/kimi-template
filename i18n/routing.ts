import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Supported locales
  locales: ["en", "fr"],

  // Default locale when no match
  defaultLocale: "en",

  // Use prefix-based routing (e.g., /en/, /fr/)
  localePrefix: "always",
});
