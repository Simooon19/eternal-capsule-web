// Uptime monitoring and health tracking system
import { logger } from './logger';
import { redis } from './redis';
import { reportError } from './sentry';

interface UptimeConfig {
  enabled: boolean;
  checkInterval: number; // milliseconds
  healthEndpoints: string[];
  webhookUrl?: string;
  alertThresholds: {
    errorRate: number; // percentage
    responseTime: number; // milliseconds
    memoryUsage: number; // percentage
  };
  externalServices?: {
    uptimeRobot?: {
      apiKey: string;
      monitors: string[];
    };
    pingdom?: {
      apiKey: string;
      checks: string[];
    };
    datadog?: {
      apiKey: string;
      appKey: string;
    };
  };
}

interface HealthCheckResult {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail';
      responseTime?: number;
      error?: string;
    };
  };
  metrics: {
    memoryUsage: number;
    cpuUsage?: number;
    activeConnections: number;
    requestCount: number;
    errorRate: number;
  };
}

interface UptimeAlert {
  type: 'down' | 'degraded' | 'recovered' | 'high_error_rate' | 'high_response_time';
  timestamp: string;
  message: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class UptimeMonitor {
  private config: UptimeConfig;
  private isRunning = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  private lastHealthCheck: HealthCheckResult | null = null;
  private uptimeStartTime: number;
  private requestCount = 0;
  private errorCount = 0;
  private responseTimeSum = 0;
  private alertHistory: UptimeAlert[] = [];

  constructor() {
    this.config = {
      enabled: process.env.UPTIME_MONITORING_ENABLED === 'true',
      checkInterval: parseInt(process.env.UPTIME_CHECK_INTERVAL || '30000'), // 30 seconds
      healthEndpoints: [
        '/api/health',
        '/api/metrics'
      ],
      webhookUrl: process.env.UPTIME_WEBHOOK_URL,
      alertThresholds: {
        errorRate: parseFloat(process.env.UPTIME_ERROR_THRESHOLD || '5'), // 5%
        responseTime: parseInt(process.env.UPTIME_RESPONSE_THRESHOLD || '5000'), // 5 seconds
        memoryUsage: parseFloat(process.env.UPTIME_MEMORY_THRESHOLD || '80'), // 80%
      },
      externalServices: {
        uptimeRobot: process.env.UPTIMEROBOT_API_KEY ? {
          apiKey: process.env.UPTIMEROBOT_API_KEY,
          monitors: (process.env.UPTIMEROBOT_MONITORS || '').split(',').filter(Boolean)
        } : undefined,
        pingdom: process.env.PINGDOM_API_KEY ? {
          apiKey: process.env.PINGDOM_API_KEY,
          checks: (process.env.PINGDOM_CHECKS || '').split(',').filter(Boolean)
        } : undefined,
        datadog: (process.env.DATADOG_API_KEY && process.env.DATADOG_APP_KEY) ? {
          apiKey: process.env.DATADOG_API_KEY,
          appKey: process.env.DATADOG_APP_KEY
        } : undefined
      }
    };

    this.uptimeStartTime = Date.now();

    if (this.config.enabled) {
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    logger.info('Uptime monitoring started', {
      interval: this.config.checkInterval,
      endpoints: this.config.healthEndpoints
    });

    // Start periodic health checks
    this.monitorInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkInterval);

    // Perform initial health check
    this.performHealthCheck();
  }

  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    logger.info('Uptime monitoring stopped');
  }

  // Track request metrics
  trackRequest(responseTime: number, isError: boolean = false) {
    this.requestCount++;
    this.responseTimeSum += responseTime;
    
    if (isError) {
      this.errorCount++;
    }

    // Check thresholds
    const errorRate = (this.errorCount / this.requestCount) * 100;
    const avgResponseTime = this.responseTimeSum / this.requestCount;

    if (errorRate > this.config.alertThresholds.errorRate) {
      this.sendAlert({
        type: 'high_error_rate',
        timestamp: new Date().toISOString(),
        message: `High error rate detected: ${errorRate.toFixed(2)}%`,
        details: { errorRate, errorCount: this.errorCount, totalRequests: this.requestCount },
        severity: 'high'
      });
    }

    if (avgResponseTime > this.config.alertThresholds.responseTime) {
      this.sendAlert({
        type: 'high_response_time',
        timestamp: new Date().toISOString(),
        message: `High response time detected: ${avgResponseTime.toFixed(0)}ms`,
        details: { avgResponseTime, threshold: this.config.alertThresholds.responseTime },
        severity: 'medium'
      });
    }
  }

  private async performHealthCheck(): Promise<HealthCheckResult> {
    const checkStart = Date.now();
    const timestamp = new Date().toISOString();
    
    const result: HealthCheckResult = {
      timestamp,
      status: 'healthy',
      uptime: Date.now() - this.uptimeStartTime,
      checks: {},
      metrics: {
        memoryUsage: 0,
        activeConnections: 0,
        requestCount: this.requestCount,
        errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0
      }
    };

    try {
      // Check memory usage
      if (typeof process !== 'undefined') {
        const memUsage = process.memoryUsage();
        const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        result.metrics.memoryUsage = memoryUsagePercent;

        if (memoryUsagePercent > this.config.alertThresholds.memoryUsage) {
          result.status = 'degraded';
          result.checks.memory = {
            status: 'fail',
            error: `Memory usage ${memoryUsagePercent.toFixed(1)}% exceeds threshold`
          };
        } else {
          result.checks.memory = { status: 'pass' };
        }
      }

      // Check health endpoints
      for (const endpoint of this.config.healthEndpoints) {
        await this.checkEndpoint(endpoint, result);
      }

      // Check database connectivity (via Redis if available)
      if (redis.isEnabled()) {
        const redisStart = Date.now();
        try {
          await redis.set('uptime_check', timestamp, 10);
          result.checks.redis = {
            status: 'pass',
            responseTime: Date.now() - redisStart
          };
        } catch (error) {
          result.checks.redis = {
            status: 'fail',
            error: error instanceof Error ? error.message : 'Redis check failed'
          };
          result.status = 'degraded';
        }
      }

      // Determine overall status
      const failedChecks = Object.values(result.checks).filter(check => check.status === 'fail');
      if (failedChecks.length > 0) {
        result.status = failedChecks.length > 1 ? 'unhealthy' : 'degraded';
      }

      // Check for status changes
      if (this.lastHealthCheck && this.lastHealthCheck.status !== result.status) {
        await this.handleStatusChange(this.lastHealthCheck.status, result.status, result);
      }

      this.lastHealthCheck = result;

      // Log health check results
      logger.debug('Health check completed', {
        status: result.status,
        duration: Date.now() - checkStart,
        failedChecks: failedChecks.length
      });

      // Send metrics to external services
      await this.sendMetricsToExternalServices(result);

      return result;

    } catch (error) {
      const errorToLog = error instanceof Error ? error : new Error('Health check failed');
      logger.error('Health check failed', errorToLog);
      result.status = 'unhealthy';
      result.checks.general = {
        status: 'fail',
        error: errorToLog.message
      };
      return result;
    }
  }

  private async checkEndpoint(endpoint: string, result: HealthCheckResult) {
    const startTime = Date.now();
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
             const controller = new AbortController();
       const timeoutId = setTimeout(() => controller.abort(), 10000);
       
       const response = await fetch(`${baseUrl}${endpoint}`, {
         method: 'GET',
         signal: controller.signal
       });
       
       clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        result.checks[endpoint] = {
          status: 'pass',
          responseTime
        };
      } else {
        result.checks[endpoint] = {
          status: 'fail',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
        result.status = 'degraded';
      }
    } catch (error) {
      result.checks[endpoint] = {
        status: 'fail',
        error: error instanceof Error ? error.message : 'Endpoint check failed'
      };
      result.status = 'degraded';
    }
  }

  private async handleStatusChange(oldStatus: string, newStatus: string, result: HealthCheckResult) {
    const alert: UptimeAlert = {
      type: newStatus === 'healthy' ? 'recovered' : 
            newStatus === 'degraded' ? 'degraded' : 'down',
      timestamp: result.timestamp,
      message: `Service status changed from ${oldStatus} to ${newStatus}`,
      details: result,
      severity: newStatus === 'unhealthy' ? 'critical' : 
               newStatus === 'degraded' ? 'high' : 'low'
    };

    await this.sendAlert(alert);
  }

  private async sendAlert(alert: UptimeAlert) {
    try {
      // Add to alert history
      this.alertHistory.push(alert);
      if (this.alertHistory.length > 100) {
        this.alertHistory = this.alertHistory.slice(-100);
      }

      // Log alert
      logger.warn('Uptime alert', {
        type: alert.type,
        severity: alert.severity,
        message: alert.message
      });

      // Send to webhook if configured
      if (this.config.webhookUrl) {
        await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'eternal-capsule',
            alert,
            timestamp: alert.timestamp
          })
        });
      }

      // Send to Sentry
      await reportError(new Error(`Uptime Alert: ${alert.message}`), {
        alert,
        severity: alert.severity
      });

    } catch (error) {
      const errorToLog = error instanceof Error ? error : new Error('Failed to send uptime alert');
      logger.error('Failed to send uptime alert', errorToLog);
    }
  }

  private async sendMetricsToExternalServices(result: HealthCheckResult) {
    try {
      // Send to Datadog
      if (this.config.externalServices?.datadog) {
        await this.sendToDatadog(result);
      }

      // Additional external service integrations can be added here
      
    } catch (error) {
      logger.debug('Failed to send metrics to external services', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async sendToDatadog(result: HealthCheckResult) {
    if (!this.config.externalServices?.datadog) return;

    const { apiKey } = this.config.externalServices.datadog;
    
    const metrics = [
      {
        metric: 'eternal_capsule.uptime',
        points: [[Math.floor(Date.now() / 1000), result.uptime]],
        tags: [`environment:${process.env.NODE_ENV}`]
      },
      {
        metric: 'eternal_capsule.memory_usage',
        points: [[Math.floor(Date.now() / 1000), result.metrics.memoryUsage]],
        tags: [`environment:${process.env.NODE_ENV}`]
      },
      {
        metric: 'eternal_capsule.error_rate',
        points: [[Math.floor(Date.now() / 1000), result.metrics.errorRate]],
        tags: [`environment:${process.env.NODE_ENV}`]
      }
    ];

    await fetch('https://api.datadoghq.com/api/v1/series', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': apiKey
      },
      body: JSON.stringify({ series: metrics })
    });
  }

  // Public methods
  getLastHealthCheck(): HealthCheckResult | null {
    return this.lastHealthCheck;
  }

  getAlertHistory(limit: number = 10): UptimeAlert[] {
    return this.alertHistory.slice(-limit);
  }

  getUptime(): number {
    return Date.now() - this.uptimeStartTime;
  }

  isHealthy(): boolean {
    return this.lastHealthCheck?.status === 'healthy';
  }

  // Reset counters (useful for testing or periodic resets)
  resetCounters() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimeSum = 0;
  }
}

// Export singleton instance
export const uptimeMonitor = new UptimeMonitor();

// Convenience functions
export const trackRequest = (responseTime: number, isError?: boolean) => {
  uptimeMonitor.trackRequest(responseTime, isError);
};

export const getUptimeStatus = () => {
  return {
    uptime: uptimeMonitor.getUptime(),
    isHealthy: uptimeMonitor.isHealthy(),
    lastCheck: uptimeMonitor.getLastHealthCheck(),
    recentAlerts: uptimeMonitor.getAlertHistory(5)
  };
};

export const getHealthCheck = () => {
  return uptimeMonitor.getLastHealthCheck();
};

export default uptimeMonitor; 