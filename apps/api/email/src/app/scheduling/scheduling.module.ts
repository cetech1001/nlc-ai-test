import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SchedulingService } from './scheduling.service';
import { SchedulingProcessor } from './processors/scheduling.processor';
import { SchedulingRepository } from './repositories/scheduling.repository';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-scheduling',
    }),
    DeliveryModule,
  ],
  providers: [
    SchedulingService,
    SchedulingProcessor,
    SchedulingRepository,
  ],
  exports: [SchedulingService],
})
export class SchedulingModule {}
