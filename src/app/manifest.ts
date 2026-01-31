import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/config";

/**
 * Web App Manifest
 * Enables PWA capabilities and provides app metadata
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description.en,
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#00D9FF",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
    categories: ["developer tools", "productivity", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
