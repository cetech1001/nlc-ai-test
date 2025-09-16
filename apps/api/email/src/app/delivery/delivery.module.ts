import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DeliveryService } from './delivery.service';
import { DeliveryProcessor } from './processors/delivery.processor';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-delivery',
    }),
    ProvidersModule,
  ],
  providers: [DeliveryService, DeliveryProcessor],
  exports: [DeliveryService],
})
export class DeliveryModule {}
