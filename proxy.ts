import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all routes except:
  // - API routes (/api/*)
  // - Static files (files with extensions)
  // - _next (Next.js internals)
  // - _vercel (Vercel internals)
  matcher: [
    "/",
    "/(en|fr)/:path*"
  ],
};
