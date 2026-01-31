// SEO Components - Server Components only
export {
  JsonLd,
  OrganizationJsonLd,
  WebSiteJsonLd,
  SoftwareApplicationJsonLd,
  BreadcrumbJsonLd,
} from "./JsonLd";

// Re-export utilities for convenience
export {
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  generateWebPageJsonLd,
  generateSoftwareApplicationJsonLd,
  generateBreadcrumbJsonLd,
  serializeJsonLd,
} from "@/lib/seo/json-ld";

export { siteConfig, getBaseUrl, getLocalizedDescription, getLocalizedTagline } from "@/lib/seo/config";
