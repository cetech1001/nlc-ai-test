import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { EmailService } from '../email/email.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, EmailService],
})
export class PaymentsModule {}
