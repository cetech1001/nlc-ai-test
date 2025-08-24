import { Module, forwardRef } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { DeliverySchedulerService } from './delivery-scheduler.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChannelsModule } from '../channels/channels.module';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { DatabaseModule } from '@nlc-ai/api-database';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => NotificationsModule),
    ChannelsModule,
  ],
  providers: [
    OrchestratorService,
    DeliverySchedulerService,
    NotificationsGateway,
  ],
  exports: [
    OrchestratorService,
    DeliverySchedulerService,
    NotificationsGateway,
  ],
})
export class OrchestratorModule {}
