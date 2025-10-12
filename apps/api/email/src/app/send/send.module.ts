import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SendService } from './send.service';
import { SendProcessor } from './processors/send.processor';
import { SmtpService } from './services/smtp.service';
import { SendController } from './send.controller';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-delivery',
    }),
    ProvidersModule,
  ],
  controllers: [SendController],
  providers: [
    SendService,
    SendProcessor,
    SmtpService,
  ],
  exports: [SendService],
})
export class SendModule {}
