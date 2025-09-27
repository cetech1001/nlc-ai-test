import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class ReplayCacheService implements OnModuleDestroy {
  private readonly redis?: Redis;
  private readonly fallbackStore = new Map<string, number>();
  private readonly fallbackRateStore = new Map<string, number[]>();
  private readonly sweepInterval?: NodeJS.Timeout;
  private useRedis: boolean;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        retryStrategy(times) {
          return Math.min(times * 100, 2000);
        },
      });
      this.useRedis = true;

      this.redis.connect().catch(error => {
        console.warn('Failed to connect to Redis, falling back to in-memory cache:', error);
        this.useRedis = false;
      });
    } else {
      this.useRedis = false;
    }

    if (!this.useRedis) {
      this.sweepInterval = setInterval(() => this.sweepFallback(), 60_000);
      this.sweepInterval.unref?.();
    }
  }

  async has(key: string): Promise<boolean> {
    if (this.useRedis && this.redis) {
      try {
        const exists = await this.redis.exists(key);
        return exists === 1;
      } catch (error) {
        console.warn('Redis error in has(), falling back to memory:', error);
        return this.hasFallback(key);
      }
    }

    return this.hasFallback(key);
  }

  async add(key: string, ttlMs: number): Promise<void> {
    const ttlSeconds = Math.ceil(ttlMs / 1000);

    if (this.useRedis && this.redis) {
      try {
        await this.redis.setex(key, ttlSeconds, '1');
        return;
      } catch (error) {
        console.warn('Redis error in add(), falling back to memory:', error);
      }
    }

    this.addFallback(key, ttlMs);
  }

  async getRateLimitData(key: string): Promise<number[] | null> {
    if (this.useRedis && this.redis) {
      try {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.warn('Redis error in getRateLimitData(), falling back to memory:', error);
        return this.fallbackRateStore.get(key) || null;
      }
    }

    return this.fallbackRateStore.get(key) || null;
  }

  async setRateLimitData(key: string, data: number[], ttlMs: number): Promise<void> {
    const ttlSeconds = Math.ceil(ttlMs / 1000);

    if (this.useRedis && this.redis) {
      try {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
        return;
      } catch (error) {
        console.warn('Redis error in setRateLimitData(), falling back to memory:', error);
      }
    }

    this.fallbackRateStore.set(key, data);
    setTimeout(() => {
      this.fallbackRateStore.delete(key);
    }, ttlMs);
  }

  private hasFallback(key: string): boolean {
    const exp = this.fallbackStore.get(key);
    if (!exp) return false;
    if (Date.now() > exp) {
      this.fallbackStore.delete(key);
      return false;
    }
    return true;
  }

  private addFallback(key: string, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.fallbackStore.set(key, expiresAt);
  }

  private sweepFallback(): void {
    const now = Date.now();

    for (const [k, exp] of this.fallbackStore.entries()) {
      if (exp <= now) {
        this.fallbackStore.delete(k);
      }
    }

    for (const [k, timestamps] of this.fallbackRateStore.entries()) {
      const filtered = timestamps.filter(ts => ts > now - (15 * 60 * 1000));
      if (filtered.length === 0) {
        this.fallbackRateStore.delete(k);
      } else {
        this.fallbackRateStore.set(k, filtered);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
    }

    if (this.redis) {
      await this.redis.quit();
    }
  }
}
