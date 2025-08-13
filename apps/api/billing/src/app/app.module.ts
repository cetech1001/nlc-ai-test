import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {DatabaseModule} from "@nlc-ai/api-database";
import { PaymentsModule } from './payments/payments.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TransactionsModule } from './transactions/transactions.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { EmailService } from './email/email.service';
import {HealthModule} from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forRoot(),
    HealthModule,
    InvoicesModule,
    PaymentMethodsModule,
    PaymentsModule,
    PlansModule,
    SubscriptionsModule,
    TransactionsModule,
  ],
  providers: [EmailService],
})
export class AppModule {}
