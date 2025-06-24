// Redis client for production rate limiting and caching
// Note: Install redis package: npm install redis @types/redis
let createClient: any;
let RedisClientType: any;
let redisModule: any;

interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  enabled: boolean;
}

class RedisManager {
  private client: any | null = null;
  private config: RedisConfig;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.config = {
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      enabled: process.env.REDIS_ENABLED === 'true' || process.env.NODE_ENV === 'production',
    };

    if (this.config.enabled) {
      this.initPromise = this.loadRedisModule();
    }
  }

  private async loadRedisModule() {
    try {
      redisModule = await import('redis');
      createClient = redisModule.createClient;
      RedisClientType = redisModule.RedisClientType;
      await this.initializeClient();
    } catch (error) {
      // Redis not installed - will fall back to in-memory
      console.warn('Redis package not installed. Using in-memory fallback.');
      this.config.enabled = false;
    }
  }

  private async ensureRedisLoaded() {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private async initializeClient() {
    if (!createClient) {
      console.warn('Redis module not loaded');
      return;
    }

    try {
      const clientConfig = this.config.url ? {
        url: this.config.url
      } : {
        socket: {
          host: this.config.host,
          port: this.config.port,
        },
        password: this.config.password,
        database: this.config.db,
      };

      this.client = createClient(clientConfig);

      this.client.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis client connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.client.on('disconnect', () => {
        console.warn('Redis client disconnected');
        this.isConnected = false;
        this.handleReconnection();
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      this.isConnected = false;
      this.handleReconnection();
    }
  }

  private async handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Attempting Redis reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        this.initializeClient();
      }, delay);
    } else {
      console.error('Max Redis reconnection attempts reached. Falling back to in-memory storage.');
    }
  }

  async get(key: string): Promise<string | null> {
    await this.ensureRedisLoaded();
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, expireInSeconds?: number): Promise<boolean> {
    await this.ensureRedisLoaded();
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      if (expireInSeconds) {
        await this.client.setEx(key, expireInSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async incr(key: string): Promise<number | null> {
    await this.ensureRedisLoaded();
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return null;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    await this.ensureRedisLoaded();
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    await this.ensureRedisLoaded();
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    await this.ensureRedisLoaded();
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Rate limiting specific methods
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean;
    count: number;
    resetTime: number;
  }> {
    await this.ensureRedisLoaded();
    if (!this.isConnected || !this.client) {
      // Fallback to allow if Redis is unavailable
      return { allowed: true, count: 0, resetTime: Date.now() + windowSeconds * 1000 };
    }

    try {
      const multi = this.client.multi();
      const now = Date.now();
      const windowStart = now - (windowSeconds * 1000);

      // Remove old entries and count current
      multi.zRemRangeByScore(key, 0, windowStart);
      multi.zCard(key);
      multi.zAdd(key, { score: now, value: now.toString() });
      multi.expire(key, windowSeconds);

      const results = await multi.exec();
      const count = results[1] as number;

      return {
        allowed: count < limit,
        count: count + 1,
        resetTime: now + windowSeconds * 1000,
      };
    } catch (error) {
      console.error('Redis rate limit check error:', error);
      // Fallback to allow if Redis fails
      return { allowed: true, count: 0, resetTime: Date.now() + windowSeconds * 1000 };
    }
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.disconnect();
      } catch (error) {
        console.error('Error disconnecting Redis client:', error);
      }
    }
  }
}

// Export singleton instance
export const redis = new RedisManager();

// Rate limiting with Redis fallback
export async function checkRedisRateLimit(
  key: string, 
  limit: number, 
  windowSeconds: number = 60
): Promise<{ allowed: boolean; count: number; resetTime: number }> {
  if (redis.isEnabled() && redis.isHealthy()) {
    return redis.checkRateLimit(key, limit, windowSeconds);
  }

  // Fallback to in-memory rate limiting
  const memoryKey = `rate_limit:${key}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Simple in-memory implementation (should be replaced with Redis in production)
  if (typeof global === 'undefined') {
    (global as any).rateLimitCache = {};
  }

  const cache = (global as any).rateLimitCache;
  const current = cache[memoryKey];

  if (!current || current.resetTime <= now) {
    cache[memoryKey] = { count: 1, resetTime: now + windowMs };
    return { allowed: true, count: 1, resetTime: now + windowMs };
  }

  if (current.count >= limit) {
    return { allowed: false, count: current.count, resetTime: current.resetTime };
  }

  current.count++;
  return { allowed: true, count: current.count, resetTime: current.resetTime };
}

export default redis; 