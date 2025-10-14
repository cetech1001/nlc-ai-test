export interface CacheSetOptions {
  ttl?: number;
  tags?: string[];
  compress?: boolean;
}

export interface CacheGetOptions {
  decompress?: boolean;
}

export interface CacheKeyPattern {
  pattern: string;
  cursor?: string;
}

export interface CacheScanResult {
  keys: string[];
  cursor: string;
  done: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memoryUsed?: string;
  uptime?: number;
}
