import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public client: Redis | null = null;
  public enabled: boolean;

  constructor() {
    this.enabled = !!process.env.REDIS_HOST || !!process.env.KV_URL;
    if (!this.enabled) {
      this.logger.warn('Redis disabled (REDIS_HOST not set)');
      return;
    }

    this.client = new Redis((process.env.KV_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`) as string, {
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      lazyConnect: true,
    });

    this.client.connect().catch(() => {
      this.logger.warn('Redis connection failed, running without cache');
      this.enabled = false;
    });

    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (err) => this.logger.warn('Redis error', err.message));
  }

  async get(key: string): Promise<string | null> {
    if (!this.enabled || !this.client) return null;
    return this.client.get(key);
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null> {
    if (!this.enabled || !this.client) return null;
    if (mode === 'EX' && duration) return this.client.set(key, value, 'EX', duration);
    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    if (!this.enabled || !this.client) return 0;
    return this.client.del(key);
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
  }
}
