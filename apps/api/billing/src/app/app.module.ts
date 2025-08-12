import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {DatabaseModule} from "@nlc-ai/api-database";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TransactionsModule } from './transactions/transactions.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { EmailService } from './email/email.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forRoot(),
    InvoicesModule,
    PaymentMethodsModule,
    PaymentsModule,
    PlansModule,
    SubscriptionsModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
