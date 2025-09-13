import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './services';

export interface DatabaseModuleOptions {
  schema?: string;
  connectionUrl?: string;
  enableLogging?: boolean;
}

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions = {}): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'DATABASE_OPTIONS',
          useValue: options,
        },
        {
          provide: PrismaService,
          useFactory: (configService: ConfigService) => {
            return new PrismaService(configService, options);
          },
          inject: [ConfigService],
        },
      ],
      exports: [PrismaService],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [PrismaService],
      exports: [PrismaService],
    };
  }
}
