import { Module } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { DeliverySchedulerService } from './delivery-scheduler.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChannelsModule } from '../channels/channels.module';
import { DatabaseModule } from '@nlc-ai/api-database';

@Module({
  imports: [
    DatabaseModule,
    NotificationsModule,
    ChannelsModule,
  ],
  providers: [
    OrchestratorService,
    DeliverySchedulerService,
  ],
  exports: [
    OrchestratorService,
    DeliverySchedulerService,
  ],
})
export class OrchestratorModule {}
