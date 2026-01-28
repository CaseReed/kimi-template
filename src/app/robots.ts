import { MetadataRoute } from "next";

/**
 * Generate robots.txt configuration
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Disallow admin or private routes if needed in the future
      // disallow: ['/admin', '/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    // Add host for search engine guidance
    host: baseUrl,
  };
}
