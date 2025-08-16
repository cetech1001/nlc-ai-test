import { Injectable, Logger } from '@nestjs/common';

interface RateLimitData {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly store = new Map<string, RateLimitData>();
  private readonly windowMs = 60000; // 1 minute
  private readonly maxRequests = 100;

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const key = `rate_limit:${identifier}`;

    let data = this.store.get(key);

    if (!data || now > data.resetTime) {
      // Reset or create new window
      data = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.store.set(key, data);
      return false;
    }

    data.count++;

    if (data.count > this.maxRequests) {
      this.logger.warn(`Rate limit exceeded for ${identifier}: ${data.count} requests`);
      return true;
    }

    return false;
  }

  getRemainingRequests(identifier: string): number {
    const key = `rate_limit:${identifier}`;
    const data = this.store.get(key);

    if (!data || Date.now() > data.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - data.count);
  }

  getResetTime(identifier: string): number {
    const key = `rate_limit:${identifier}`;
    const data = this.store.get(key);

    return data?.resetTime || Date.now() + this.windowMs;
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key);
      }
    }
  }
}
