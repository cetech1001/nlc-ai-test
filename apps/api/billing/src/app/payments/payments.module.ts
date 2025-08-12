import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, EmailService, PrismaService],
})
export class PaymentsModule {}
