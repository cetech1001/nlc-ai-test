import {Module} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {JwtModule} from "@nestjs/jwt";
import {APP_FILTER, APP_GUARD, APP_PIPE} from "@nestjs/core";
import {ScheduleModule} from "@nestjs/schedule";
import {ValidationPipe, HttpExceptionFilter, AllExceptionsFilter} from "@nlc-ai/api-validation";
import {ServiceAuthGuard} from "@nlc-ai/api-auth";
import {DatabaseModule} from "@nlc-ai/api-database";
import { PaymentsModule } from './payments/payments.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TransactionsModule } from './transactions/transactions.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { EmailService } from './email/email.service';
import {HealthModule} from "./health/health.module";
import billingConfig from "./config/billing.config";
import {MessagingModule} from "@nlc-ai/api-messaging";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [billingConfig],
      cache: true,
      expandVariables: true,
    }),
    JwtModule.registerAsync({
      useFactory: (config) => ({
        secret: config.get('JWT_SECRET') || 'fallback-secret',
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN') || '24h',
          audience: 'billing-service',
          issuer: 'nlc-ai',
        },
      }),
      inject: [ConfigModule],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forFeature(),
    MessagingModule.forRoot(),
    HealthModule,
    InvoicesModule,
    PaymentMethodsModule,
    PaymentsModule,
    PlansModule,
    SubscriptionsModule,
    TransactionsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },

    // Global authentication guard
    {
      provide: APP_GUARD,
      useClass: ServiceAuthGuard,
    },

    // Global exception filters (order matters - most specific first)
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    EmailService
  ],
})
export class AppModule {}
