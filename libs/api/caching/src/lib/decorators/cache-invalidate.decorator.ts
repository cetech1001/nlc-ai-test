export interface CacheInvalidateOptions {
  keys?: string[];
  patterns?: string[];
  tags?: string[];
  keyGenerator?: (...args: any[]) => string[];
}

export function CacheInvalidate(options: CacheInvalidateOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      const cacheService = (this as any).cacheService;

      if (!cacheService) {
        console.warn(`CacheService not found on ${target.constructor.name}`);
        return result;
      }

      try {
        if (options.keys && options.keys.length > 0) {
          await cacheService.delMany(options.keys);
        }

        if (options.patterns && options.patterns.length > 0) {
          for (const pattern of options.patterns) {
            await cacheService.delByPattern(pattern);
          }
        }

        if (options.tags && options.tags.length > 0) {
          for (const tag of options.tags) {
            await cacheService.delByTag(tag);
          }
        }

        if (options.keyGenerator) {
          const keysToInvalidate = options.keyGenerator(...args);
          await cacheService.delMany(keysToInvalidate);
        }
      } catch (error) {
        console.error('Cache invalidation failed:', error);
      }

      return result;
    };

    return descriptor;
  };
}
