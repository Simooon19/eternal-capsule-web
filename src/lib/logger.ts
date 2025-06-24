// Structured logging system for Eternal Capsule
interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  requestId?: string;
  userId?: string;
  memorialId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LoggerConfig {
  level: LogLevel;
  environment: string;
  service: string;
  version: string;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  sensitiveFields: string[];
}

class StructuredLogger {
  private config: LoggerConfig;
  private logQueue: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
  };

  constructor() {
    this.config = {
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
      environment: process.env.NODE_ENV || 'development',
      service: 'eternal-capsule',
      version: process.env.npm_package_version || '0.1.0',
      enableConsole: process.env.ENABLE_CONSOLE_LOGS !== 'false',
      enableFile: process.env.ENABLE_FILE_LOGS === 'true',
      enableRemote: process.env.ENABLE_REMOTE_LOGS === 'true',
      remoteEndpoint: process.env.REMOTE_LOG_ENDPOINT,
      sensitiveFields: [
        'password', 'token', 'secret', 'key', 'credential',
        'authorization', 'cookie', 'session', 'email', 'phone'
      ]
    };

    // Start flush interval for remote logging
    if (this.config.enableRemote) {
      this.flushInterval = setInterval(() => {
        this.flushLogs();
      }, 5000); // Flush every 5 seconds
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.LOG_LEVELS[level] >= this.LOG_LEVELS[this.config.level];
  }

  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context };
    
    const sanitizeObject = (obj: any, path = ''): any => {
      if (obj === null || obj === undefined) return obj;
      
      if (typeof obj === 'string') {
        // Check if field name contains sensitive keywords
        if (this.config.sensitiveFields.some(field => 
          path.toLowerCase().includes(field.toLowerCase())
        )) {
          return '***REDACTED***';
        }
        return obj;
      }
      
      if (Array.isArray(obj)) {
        return obj.map((item, index) => sanitizeObject(item, `${path}[${index}]`));
      }
      
      if (typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          const newPath = path ? `${path}.${key}` : key;
          result[key] = sanitizeObject(value, newPath);
        }
        return result;
      }
      
      return obj;
    };

    return sanitizeObject(sanitized);
  }

  private formatLogEntry(entry: LogEntry): string {
    const baseEntry: any = {
      timestamp: entry.timestamp,
      level: entry.level.toUpperCase(),
      service: this.config.service,
      version: this.config.version,
      environment: this.config.environment,
      message: entry.message,
      ...entry.context
    };

    // Add optional fields
    if (entry.requestId) baseEntry.requestId = entry.requestId;
    if (entry.userId) baseEntry.userId = entry.userId;
    if (entry.memorialId) baseEntry.memorialId = entry.memorialId;
    if (entry.sessionId) baseEntry.sessionId = entry.sessionId;
    if (entry.userAgent) baseEntry.userAgent = entry.userAgent;
    if (entry.ip) baseEntry.ip = entry.ip;

    // Add error details
    if (entry.error) {
      baseEntry.error = {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
        cause: entry.error.cause
      };
    }

    return JSON.stringify(baseEntry);
  }

  private async writeLog(entry: LogEntry) {
    const formattedEntry = this.formatLogEntry(entry);
    
    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry, formattedEntry);
    }

    // File logging (in production environments)
    if (this.config.enableFile && typeof process !== 'undefined') {
      this.logToFile(formattedEntry);
    }

    // Queue for remote logging
    if (this.config.enableRemote) {
      this.logQueue.push(entry);
    }
  }

  private logToConsole(entry: LogEntry, formattedEntry: string) {
    const colorMap = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
      fatal: '\x1b[35m'  // Magenta
    };

    const resetColor = '\x1b[0m';
    const color = colorMap[entry.level] || '';

    if (this.config.environment === 'development') {
      // Pretty print for development
      console.log(
        `${color}[${entry.level.toUpperCase()}]${resetColor} ${entry.message}`,
        entry.context ? entry.context : '',
        entry.error ? entry.error : ''
      );
    } else {
      // JSON format for production
      console.log(formattedEntry);
    }
  }

  private async logToFile(formattedEntry: string) {
    // In a real implementation, you'd write to a file
    // For now, we'll just append to a simple log array
    if (typeof global !== 'undefined') {
      if (!(global as any).fileLogs) {
        (global as any).fileLogs = [];
      }
      (global as any).fileLogs.push(formattedEntry);
      
      // Keep only last 1000 entries to prevent memory issues
      if ((global as any).fileLogs.length > 1000) {
        (global as any).fileLogs = (global as any).fileLogs.slice(-1000);
      }
    }
  }

  private async flushLogs() {
    if (this.logQueue.length === 0 || !this.config.remoteEndpoint) return;

    const logsToFlush = [...this.logQueue];
    this.logQueue = [];

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${this.config.service}/${this.config.version}`
        },
        body: JSON.stringify({
          logs: logsToFlush.map(entry => this.formatLogEntry(entry)),
          service: this.config.service,
          version: this.config.version,
          environment: this.config.environment
        })
      });

      if (!response.ok) {
        console.warn('Failed to send logs to remote endpoint:', response.statusText);
        // Re-queue failed logs (with a limit to prevent infinite growth)
        if (this.logQueue.length < 100) {
          this.logQueue.unshift(...logsToFlush);
        }
      }
    } catch (error) {
      console.warn('Remote logging error:', error);
      // Re-queue failed logs
      if (this.logQueue.length < 100) {
        this.logQueue.unshift(...logsToFlush);
      }
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
    metadata?: {
      requestId?: string;
      userId?: string;
      memorialId?: string;
      sessionId?: string;
      userAgent?: string;
      ip?: string;
    }
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? this.sanitizeContext(context) : undefined,
      error,
      ...metadata
    };
  }

  // Public logging methods
  debug(message: string, context?: LogContext, metadata?: any) {
    if (!this.shouldLog('debug')) return;
    const entry = this.createLogEntry('debug', message, context, undefined, metadata);
    this.writeLog(entry);
  }

  info(message: string, context?: LogContext, metadata?: any) {
    if (!this.shouldLog('info')) return;
    const entry = this.createLogEntry('info', message, context, undefined, metadata);
    this.writeLog(entry);
  }

  warn(message: string, context?: LogContext, metadata?: any) {
    if (!this.shouldLog('warn')) return;
    const entry = this.createLogEntry('warn', message, context, undefined, metadata);
    this.writeLog(entry);
  }

  error(message: string, error?: Error, context?: LogContext, metadata?: any) {
    if (!this.shouldLog('error')) return;
    const entry = this.createLogEntry('error', message, context, error, metadata);
    this.writeLog(entry);
  }

  fatal(message: string, error?: Error, context?: LogContext, metadata?: any) {
    if (!this.shouldLog('fatal')) return;
    const entry = this.createLogEntry('fatal', message, context, error, metadata);
    this.writeLog(entry);
  }

  // Memorial-specific logging
  memorial(action: string, memorialId: string, context?: LogContext, metadata?: any) {
    this.info(`Memorial ${action}`, context, { memorialId, ...metadata });
  }

  // User action logging
  userAction(action: string, userId: string, context?: LogContext, metadata?: any) {
    this.info(`User ${action}`, context, { userId, ...metadata });
  }

  // Performance logging
  performance(metric: string, value: number, context?: LogContext, metadata?: any) {
    this.debug(`Performance metric: ${metric}`, { ...context, value }, metadata);
  }

  // Security logging
  security(event: string, context?: LogContext, metadata?: any) {
    this.warn(`Security event: ${event}`, context, metadata);
  }

  // Business event logging
  business(event: string, context?: LogContext, metadata?: any) {
    this.info(`Business event: ${event}`, context, metadata);
  }

  // Get recent logs (for debugging)
  getRecentLogs(count: number = 100): string[] {
    if (typeof global === 'undefined') return [];
    
    const logs = (global as any).fileLogs || [];
    return logs.slice(-count);
  }

  // Cleanup method
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Final flush
    this.flushLogs();
  }
}

// Export singleton instance
export const logger = new StructuredLogger();

// Convenience exports
export const logDebug = (message: string, context?: LogContext, metadata?: any) => {
  logger.debug(message, context, metadata);
};

export const logInfo = (message: string, context?: LogContext, metadata?: any) => {
  logger.info(message, context, metadata);
};

export const logWarn = (message: string, context?: LogContext, metadata?: any) => {
  logger.warn(message, context, metadata);
};

export const logError = (message: string, error?: Error, context?: LogContext, metadata?: any) => {
  logger.error(message, error, context, metadata);
};

export const logFatal = (message: string, error?: Error, context?: LogContext, metadata?: any) => {
  logger.fatal(message, error, context, metadata);
};

// Specialized logging functions
export const logMemorialEvent = (action: string, memorialId: string, context?: LogContext, metadata?: any) => {
  logger.memorial(action, memorialId, context, metadata);
};

export const logUserAction = (action: string, userId: string, context?: LogContext, metadata?: any) => {
  logger.userAction(action, userId, context, metadata);
};

export const logPerformance = (metric: string, value: number, context?: LogContext, metadata?: any) => {
  logger.performance(metric, value, context, metadata);
};

export const logSecurity = (event: string, context?: LogContext, metadata?: any) => {
  logger.security(event, context, metadata);
};

export const logBusiness = (event: string, context?: LogContext, metadata?: any) => {
  logger.business(event, context, metadata);
};

export default logger; 