import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import {ConfigModule} from "@nestjs/config";
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [PaymentsController],
  providers: [PaymentsService, EmailService, PrismaService],
})
export class PaymentsModule {}
