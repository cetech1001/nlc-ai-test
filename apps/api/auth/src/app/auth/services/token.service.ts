import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as crypto from 'crypto';

interface StoredToken {
  email: string;
  code: string;
  type: 'verification' | 'reset';
  expiresAt: Date;
}

@Injectable()
export class TokenService implements OnModuleDestroy {
  private readonly redis?: Redis;
  private readonly fallbackTokens = new Map<string, StoredToken>();
  private readonly useRedis: boolean;
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('auth.redis.url');

    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          retryStrategy(times) {
            return Math.min(times * 100, 2000);
          },
        });
        this.useRedis = true;
      } catch (error) {
        console.warn('Failed to connect to Redis, falling back to in-memory storage:', error);
        this.useRedis = false;
      }
    } else {
      this.useRedis = false;
    }

    if (!this.useRedis) {
      this.cleanupInterval = setInterval(() => this.cleanupExpiredTokens(), 5 * 60 * 1000);
      this.cleanupInterval.unref?.();
    }
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeVerificationToken(
    email: string,
    code: string,
    type: 'verification' | 'reset' = 'verification'
  ): Promise<void> {
    const ttlSeconds = 10 * 60;
    const tokenKey = `token:${email}:${type}`;

    const tokenData = {
      email,
      code,
      type,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    };

    if (this.useRedis && this.redis) {
      try {
        await this.redis.setex(tokenKey, ttlSeconds, JSON.stringify(tokenData));
        return;
      } catch (error) {
        console.warn('Redis error in storeVerificationToken, falling back:', error);
      }
    }

    this.fallbackTokens.set(tokenKey, tokenData);
  }

  async verifyToken(
    email: string,
    code: string,
    type: 'verification' | 'reset' = 'verification'
  ): Promise<boolean> {
    const tokenKey = `token:${email}:${type}`;
    let storedToken: StoredToken | null = null;

    if (this.useRedis && this.redis) {
      try {
        const data = await this.redis.get(tokenKey);
        if (data) {
          storedToken = JSON.parse(data);
          await this.redis.del(tokenKey);
        }
      } catch (error) {
        console.warn('Redis error in verifyToken, falling back:', error);
        storedToken = this.fallbackTokens.get(tokenKey) || null;
        if (storedToken) {
          this.fallbackTokens.delete(tokenKey);
        }
      }
    } else {
      storedToken = this.fallbackTokens.get(tokenKey) || null;
      if (storedToken) {
        this.fallbackTokens.delete(tokenKey);
      }
    }

    if (!storedToken) {
      return false;
    }

    if (new Date(storedToken.expiresAt) < new Date()) {
      return false;
    }

    return storedToken.code === code;
  }

  async generateResetToken(email: string): Promise<string> {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const ttlSeconds = 60 * 60;
    const tokenKey = `reset:${resetToken}`;

    const tokenData = {
      email,
      code: resetToken,
      type: 'reset' as const,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    };

    if (this.useRedis && this.redis) {
      try {
        await this.redis.setex(tokenKey, ttlSeconds, JSON.stringify(tokenData));
        return resetToken;
      } catch (error) {
        console.warn('Redis error in generateResetToken, falling back:', error);
      }
    }

    this.fallbackTokens.set(tokenKey, tokenData);
    return resetToken;
  }

  async validateResetToken(token: string): Promise<string | null> {
    const tokenKey = `reset:${token}`;
    let storedToken: StoredToken | null = null;

    if (this.useRedis && this.redis) {
      try {
        const data = await this.redis.get(tokenKey);
        if (data) {
          storedToken = JSON.parse(data);
        }
      } catch (error) {
        console.warn('Redis error in validateResetToken, falling back:', error);
        storedToken = this.fallbackTokens.get(tokenKey) || null;
      }
    } else {
      storedToken = this.fallbackTokens.get(tokenKey) || null;
    }

    if (!storedToken) {
      return null;
    }

    if (new Date(storedToken.expiresAt) < new Date()) {
      if (this.useRedis && this.redis) {
        try {
          await this.redis.del(tokenKey);
        } catch (error) {
          console.warn('Redis error deleting expired token:', error);
        }
      } else {
        this.fallbackTokens.delete(tokenKey);
      }
      return null;
    }

    return storedToken.email;
  }

  async invalidateTokens(email: string): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        const pipeline = this.redis.pipeline();

        const verificationKey = `token:${email}:verification`;
        const resetKey = `token:${email}:reset`;
        pipeline.del(verificationKey);
        pipeline.del(resetKey);

        const resetKeys = await this.redis.keys('reset:*');
        for (const key of resetKeys) {
          const data = await this.redis.get(key);
          if (data) {
            const token = JSON.parse(data);
            if (token.email === email) {
              pipeline.del(key);
            }
          }
        }

        await pipeline.exec();
      } catch (error) {
        console.warn('Redis error in invalidateTokens, falling back:', error);
        this.invalidateTokensFallback(email);
      }
    } else {
      this.invalidateTokensFallback(email);
    }
  }

  private invalidateTokensFallback(email: string): void {
    const keysToDelete = [];
    for (const [key, token] of this.fallbackTokens.entries()) {
      if (token.email === email) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.fallbackTokens.delete(key));
  }

  private cleanupExpiredTokens(): void {
    const now = new Date();
    const keysToDelete = [];

    for (const [key, token] of this.fallbackTokens.entries()) {
      if (new Date(token.expiresAt) < now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.fallbackTokens.delete(key));
  }

  async onModuleDestroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.redis) {
      await this.redis.quit();
    }
  }
}
