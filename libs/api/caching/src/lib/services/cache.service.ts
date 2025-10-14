import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { promisify } from 'util';
import * as zlib from 'zlib';
import {
  CacheConfig,
  CacheSetOptions,
  CacheGetOptions,
  CacheScanResult,
  CacheStats,
} from '../types';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | undefined;
  private readonly logger = new Logger(CacheService.name);
  private readonly config: Required<CacheConfig>;
  private hits = 0;
  private misses = 0;

  constructor(
    private readonly configService: ConfigService,
    config?: CacheConfig
  ) {
    this.config = {
      host: config?.host ?? this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: config?.port ?? this.configService.get<number>('REDIS_PORT', 6379),
      password: config?.password ?? this.configService.get<string>('REDIS_PASSWORD', ''),
      db: config?.db ?? this.configService.get<number>('REDIS_DB', 0),
      keyPrefix: config?.keyPrefix ?? this.configService.get<string>('REDIS_KEY_PREFIX', 'nlc:'),
      defaultTTL: config?.defaultTTL ?? this.configService.get<number>('CACHE_DEFAULT_TTL', 3600),
      enableCompression: config?.enableCompression ?? this.configService.get<boolean>('CACHE_ENABLE_COMPRESSION', true),
      compressionThreshold: config?.compressionThreshold ?? this.configService.get<number>('CACHE_COMPRESSION_THRESHOLD', 1024),
    };
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      this.client = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password || undefined,
        db: this.config.db,
        keyPrefix: this.config.keyPrefix,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.client.on('connect', () => {
        this.logger.log('Connected to Redis successfully');
      });

      this.client.on('ready', () => {
        this.logger.log('Redis client ready');
      });

      await this.client.ping();
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit();
        this.client = undefined;
        this.logger.log('Redis connection closed');
      }
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }

  private ensureClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    return this.client;
  }

  private buildKey(key: string): string {
    return key;
  }

  private async compressData(data: string): Promise<Buffer> {
    return await gzip(Buffer.from(data, 'utf-8'));
  }

  private async decompressData(data: Buffer): Promise<string> {
    const decompressed = await gunzip(data);
    return decompressed.toString('utf-8');
  }

  async get<T>(key: string, options?: CacheGetOptions): Promise<T | null> {
    try {
      const client = this.ensureClient();
      const fullKey = this.buildKey(key);

      const value = await client.getBuffer(fullKey);

      if (!value) {
        this.misses++;
        return null;
      }

      this.hits++;

      let stringValue: string;

      if (options?.decompress !== false && this.config.enableCompression) {
        try {
          stringValue = await this.decompressData(value);
        } catch {
          stringValue = value.toString('utf-8');
        }
      } else {
        stringValue = value.toString('utf-8');
      }

      return JSON.parse(stringValue) as T;
    } catch (error) {
      this.logger.error(`Failed to get cache key: ${key}`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheSetOptions): Promise<void> {
    try {
      const client = this.ensureClient();
      const fullKey = this.buildKey(key);
      const ttl = options?.ttl ?? this.config.defaultTTL;

      const stringValue = JSON.stringify(value);
      const shouldCompress =
        (options?.compress !== false && this.config.enableCompression) &&
        stringValue.length > this.config.compressionThreshold;

      let dataToStore: string | Buffer = stringValue;

      if (shouldCompress) {
        dataToStore = await this.compressData(stringValue);
      }

      await client.setex(fullKey, ttl, dataToStore);

      if (options?.tags && options.tags.length > 0) {
        const tagPromises = options.tags.map(tag =>
          client.sadd(`tag:${tag}`, fullKey)
        );
        await Promise.all(tagPromises);
      }

      this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s, Compressed: ${shouldCompress})`);
    } catch (error) {
      this.logger.error(`Failed to set cache key: ${key}`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      const client = this.ensureClient();
      const fullKey = this.buildKey(key);
      await client.del(fullKey);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache key: ${key}`, error);
      throw error;
    }
  }

  async delMany(keys: string[]): Promise<void> {
    try {
      const client = this.ensureClient();
      const fullKeys = keys.map(key => this.buildKey(key));

      if (fullKeys.length > 0) {
        await client.del(...fullKeys);
        this.logger.debug(`Cache deleted ${fullKeys.length} keys`);
      }
    } catch (error) {
      this.logger.error('Failed to delete multiple cache keys', error);
      throw error;
    }
  }

  async delByPattern(pattern: string): Promise<number> {
    try {
      const client = this.ensureClient();
      const fullPattern = this.buildKey(pattern);

      let cursor = '0';
      let deletedCount = 0;

      do {
        const [newCursor, keys] = await client.scan(
          cursor,
          'MATCH',
          fullPattern,
          'COUNT',
          100
        );

        cursor = newCursor;

        if (keys.length > 0) {
          await client.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== '0');

      this.logger.debug(`Cache deleted ${deletedCount} keys matching pattern: ${pattern}`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Failed to delete cache keys by pattern: ${pattern}`, error);
      throw error;
    }
  }

  async delByTag(tag: string): Promise<number> {
    try {
      const client = this.ensureClient();
      const tagKey = `tag:${tag}`;

      const keys = await client.smembers(tagKey);

      if (keys.length > 0) {
        await client.del(...keys);
        await client.del(tagKey);
        this.logger.debug(`Cache deleted ${keys.length} keys with tag: ${tag}`);
        return keys.length;
      }

      return 0;
    } catch (error) {
      this.logger.error(`Failed to delete cache keys by tag: ${tag}`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const client = this.ensureClient();
      const fullKey = this.buildKey(key);
      const result = await client.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check cache key existence: ${key}`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const client = this.ensureClient();
      const fullKey = this.buildKey(key);
      return await client.ttl(fullKey);
    } catch (error) {
      this.logger.error(`Failed to get TTL for cache key: ${key}`, error);
      return -1;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      const client = this.ensureClient();
      const fullKey = this.buildKey(key);
      await client.expire(fullKey, seconds);
      this.logger.debug(`Cache expiration set: ${key} (${seconds}s)`);
    } catch (error) {
      this.logger.error(`Failed to set expiration for cache key: ${key}`, error);
      throw error;
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheSetOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);

    return value;
  }

  async flush(): Promise<void> {
    try {
      const client = this.ensureClient();
      await client.flushdb();
      this.logger.warn('Cache flushed - all keys deleted');
      this.hits = 0;
      this.misses = 0;
    } catch (error) {
      this.logger.error('Failed to flush cache', error);
      throw error;
    }
  }

  async scan(pattern: string, cursor = '0', count = 100): Promise<CacheScanResult> {
    try {
      const client = this.ensureClient();
      const fullPattern = this.buildKey(pattern);

      const [newCursor, keys] = await client.scan(
        cursor,
        'MATCH',
        fullPattern,
        'COUNT',
        count
      );

      return {
        keys: keys.map(key => key.replace(this.config.keyPrefix, '')),
        cursor: newCursor,
        done: newCursor === '0',
      };
    } catch (error) {
      this.logger.error(`Failed to scan cache with pattern: ${pattern}`, error);
      throw error;
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      const client = this.ensureClient();
      const info = await client.info('stats');
      const dbSize = await client.dbsize();

      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const uptimeMatch = info.match(/uptime_in_seconds:(\d+)/);

      return {
        hits: this.hits,
        misses: this.misses,
        keys: dbSize,
        memoryUsed: memoryMatch ? memoryMatch[1].trim() : undefined,
        uptime: uptimeMatch ? parseInt(uptimeMatch[1]) : undefined,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats', error);
      return {
        hits: this.hits,
        misses: this.misses,
        keys: 0,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const client = this.ensureClient();
      const result = await client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Cache health check failed', error);
      return false;
    }
  }
}
