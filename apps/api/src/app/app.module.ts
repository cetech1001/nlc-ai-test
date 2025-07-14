import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import {ConfigModule} from "@nestjs/config";
import { CoachesModule } from './coaches/coaches.module';
import { AuthModule } from './auth/auth.module';
import {APP_GUARD} from "@nestjs/core";
import {JwtAuthGuard} from "./auth/guards/jwt-auth.guard";
import { EmailModule } from './email/email.module';
import {PlansModule} from "./plans/plans.module";
import { TransactionsModule } from './transactions/transactions.module';
import {CleanupModule} from "./cleanup/cleanup.module";
import { LeadsModule } from './leads/leads.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    CoachesModule,
    EmailModule,
    PlansModule,
    TransactionsModule,
    CleanupModule,
    LeadsModule,
    SystemSettingsModule,
    PaymentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
