/**
 * Environment Variable Validation
 * Validates all required environment variables on startup
 */

const requiredEnvVars = [
  'MYSQL_HOST',
  'MYSQL_DATABASE',
  'MYSQL_USER',
  'MYSQL_PASSWORD',
  'JWT_SECRET',
] as const;

const optionalEnvVars = [
  'MYSQL_PORT',
  'NODE_ENV',
] as const;

interface EnvVars {
  [key: string]: string | undefined;
}

let validated = false;

/**
 * Validate all required environment variables
 * Throws an error if any required variables are missing
 */
export function validateEnv(): void {
  if (validated) return;

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // If any required variables are missing, throw an error
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file and ensure all required variables are set.`
    );
  }

  // Production-specific warnings
  if (process.env.NODE_ENV === 'production') {
    // Warn about weak JWT secret
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      warnings.push(
        'WARNING: JWT_SECRET should be at least 32 characters long in production'
      );
    }

    // Warn about default/weak passwords
    const mysqlPassword = process.env.MYSQL_PASSWORD;
    if (mysqlPassword && (mysqlPassword === 'password' || mysqlPassword === 'root' || mysqlPassword === '')) {
      warnings.push(
        'WARNING: MySQL password appears to be weak. Use a strong password in production.'
      );
    }

    // Warn about missing HTTPS-related settings
    if (!process.env.NEXT_PUBLIC_API_URL && !process.env.VERCEL_URL) {
      warnings.push(
        'WARNING: NEXT_PUBLIC_API_URL or VERCEL_URL not set. This may cause issues in production.'
      );
    }
  }

  // Log warnings if any
  if (warnings.length > 0) {
    console.warn('\n' + '='.repeat(80));
    console.warn('PRODUCTION WARNINGS:');
    warnings.forEach(warning => console.warn('  - ' + warning));
    console.warn('='.repeat(80) + '\n');
  }

  validated = true;
  console.log('✅ Environment variables validated successfully');
}

/**
 * Get all environment variables (for debugging - never expose this in API responses)
 */
export function getEnvInfo(): { required: EnvVars; optional: EnvVars } {
  const required: EnvVars = {};
  const optional: EnvVars = {};

  for (const envVar of requiredEnvVars) {
    required[envVar] = process.env[envVar] ? '***SET***' : undefined;
  }

  for (const envVar of optionalEnvVars) {
    optional[envVar] = process.env[envVar];
  }

  return { required, optional };
}

/**
 * Validate environment on import
 * This will run automatically when the app starts
 */
try {
  validateEnv();
} catch (error) {
  // In development, allow the app to start with a warning
  // In production, this will cause the app to crash (which is desired)
  if (process.env.NODE_ENV === 'production') {
    throw error;
  } else {
    console.warn('⚠️  Environment validation failed:', error);
    console.warn('⚠️  App will start in development mode, but some features may not work correctly.');
  }
}

export default validateEnv;
