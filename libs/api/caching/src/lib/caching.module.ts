import {DynamicModule, Global, Module} from '@nestjs/common';
import { CacheService } from './services';
import { CacheModuleOptions } from './types';
import {ConfigService} from "@nestjs/config";

@Global()
@Module({})
export class CachingModule {
  static forRoot(options?: CacheModuleOptions): DynamicModule {
    return {
      module: CachingModule,
      global: options?.isGlobal ?? true,
      providers: [
        {
          provide: CacheService,
          useFactory: (configService: ConfigService) => {
            return new CacheService(
              configService,
              options?.config
            );
          },
          inject: [ConfigService],
        },
      ],
      exports: [CacheService],
    };
  }
}
