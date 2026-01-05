import { NextResponse } from 'next/server';
import { execute } from '@/lib/mysql';

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Returns the health status of the application and its dependencies
 */
export async function GET() {
  const startTime = Date.now();
  const checks = {
    database: 'unknown',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    responseTime: 0,
  };

  try {
    // Check database connection
    await execute('SELECT 1');
    checks.database = 'connected';
  } catch (error) {
    console.error('Health check failed:', error);
    checks.database = 'disconnected';

    return NextResponse.json({
      status: 'error',
      ...checks,
      error: 'Database connection failed',
    }, { status: 503 });
  }

  checks.responseTime = Date.now() - startTime;

  return NextResponse.json({
    status: 'ok',
    ...checks,
  });
}
