/**
 * Health Check API Endpoint
 * 
 * Used by Docker health checks and monitoring systems to verify
 * the application is running correctly.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/route-handlers
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '0.1.0',
  };

  // You can add additional checks here:
  // - Database connectivity
  // - External API availability
  // - Memory usage
  // - etc.

  return Response.json(health, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}
