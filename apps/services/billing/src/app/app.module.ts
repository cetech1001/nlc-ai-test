import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Enhanced Billing Modules
import { PaymentsModule } from './payments/payments.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TransactionsModule } from './transactions/transactions.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';

// Shared Services
import { PrismaService } from './prisma/prisma.service';
import { EmailService } from './email/email.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Legacy Payments module (can be deprecated after migration)
    PaymentsModule,
    // Enhanced Billing Modules
    PlansModule,
    SubscriptionsModule,
    TransactionsModule,
    InvoicesModule,
    PaymentMethodsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, EmailService],
  exports: [PrismaService, EmailService],
})
export class AppModule {}
