import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

export interface DatabaseModuleOptions {
  schema?: string;
  connectionUrl?: string;
}

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: PrismaService,
          useFactory: (configService: ConfigService) => {
            return new PrismaService(configService);
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
