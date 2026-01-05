// Centralized logger to minimize console output in production
// Only critical errors will be logged

type LogLevel = 'error' | 'warn';

const isDevelopment = process.env.NODE_ENV !== 'production';

class Logger {
    private criticalErrorsLogged = 0;
    private readonly MAX_CRITICAL_ERRORS = 5;

    error(message: string, error?: any) {
        // Only log critical errors in production, and limit total logs
        if (isDevelopment || this.criticalErrorsLogged < this.MAX_CRITICAL_ERRORS) {
            console.error(message, error || '');
            if (!isDevelopment) {
                this.criticalErrorsLogged++;
            }
        }
    }

    warn(message: string) {
        // Only show warnings in development
        if (isDevelopment) {
            console.warn(message);
        }
    }

    log(message: string) {
        // Only show logs in development
        if (isDevelopment) {
            console.log(message);
        }
    }
}

export const logger = new Logger();
