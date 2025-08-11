import { Injectable } from '@nestjs/common';

/**
 * Very lightweight in-memory replay cache.
 * Stores keys (e.g., signatures) with an expiration time to prevent reuse within a short window.
 * Note: This is per-instance memory; for multi-instance deployments, a shared store (e.g., Redis) is recommended.
 */
@Injectable()
export class ReplayCacheService {
  private readonly store = new Map<string, number>();
  private readonly sweepInterval: NodeJS.Timeout;

  constructor() {
    // Sweep every minute to remove expired entries
    this.sweepInterval = setInterval(() => this.sweep(), 60_000);
    this.sweepInterval.unref?.();
  }

  has(key: string): boolean {
    const exp = this.store.get(key);
    if (!exp) return false;
    if (Date.now() > exp) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  add(key: string, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, expiresAt);
  }

  private sweep() {
    const now = Date.now();
    for (const [k, exp] of this.store.entries()) {
      if (exp <= now) {
        this.store.delete(k);
      }
    }
  }
}
