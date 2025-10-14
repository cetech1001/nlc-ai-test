export interface CacheConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTTL?: number;
  enableCompression?: boolean;
  compressionThreshold?: number;
}

export interface CacheModuleOptions {
  isGlobal?: boolean;
  config?: CacheConfig;
}
