import { CacheSetOptions } from '../types';

export interface CacheableOptions extends CacheSetOptions {
  keyGenerator?: (...args: any[]) => string;
}

export function Cacheable(baseKey: string, options?: CacheableOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = (this as any).cacheService;

      if (!cacheService) {
        console.warn(`CacheService not found on ${target.constructor.name}`);
        return originalMethod.apply(this, args);
      }

      const cacheKey = options?.keyGenerator
        ? `${baseKey}:${options.keyGenerator(...args)}`
        : `${baseKey}:${JSON.stringify(args)}`;

      try {
        const cached = await cacheService.get(cacheKey);

        if (cached !== null) {
          return cached;
        }

        const result = await originalMethod.apply(this, args);

        await cacheService.set(cacheKey, result, {
          ttl: options?.ttl,
          tags: options?.tags,
          compress: options?.compress,
        });

        return result;
      } catch (error) {
        console.error(`Cache operation failed for key ${cacheKey}:`, error);
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}
