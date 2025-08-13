import {DynamicModule, Global, Module} from "@nestjs/common";
import {EventBusService, OutboxService} from "./services";
import {DatabaseModule} from "@nlc-ai/api-database";
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
          useFactory: (prisma, eventBus, configService) => {
            return new OutboxService(prisma, eventBus, configService, config);
          },
          inject: ['PrismaService', 'EventBusService', 'ConfigService'],
        },
        EventBusService,
      ],
      exports: [EventBusService, OutboxService],
    };
  }
}
