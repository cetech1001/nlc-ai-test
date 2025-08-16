import {DynamicModule, Global, Module} from "@nestjs/common";
import {EventBusService, OutboxService} from "./services";
import { DatabaseModule, PrismaService } from "@nlc-ai/api-database";
import { ConfigService } from "@nestjs/config";
import {OutboxConfig} from "./types";

@Global()
@Module({})
export class MessagingModule {
  static forRoot(config?: OutboxConfig): DynamicModule {
    return {
      module: MessagingModule,
      imports: [DatabaseModule],
      providers: [
        {
          provide: OutboxService,
          useFactory: (prisma: PrismaService, eventBus: EventBusService, configService: ConfigService) => {
            return new OutboxService(prisma, eventBus, configService, config);
          },
          inject: [PrismaService, EventBusService, ConfigService],
        },
        EventBusService,
      ],
      exports: [EventBusService, OutboxService],
    };
  }
}
