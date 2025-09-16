import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailgunService } from './services/mailgun.service';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ProvidersController],
  providers: [
    MailgunService,
    {
      provide: 'EMAIL_PROVIDER',
      useClass: MailgunService,
    },
    ProvidersService,
  ],
  exports: [ProvidersService, 'EMAIL_PROVIDER'],
})
export class ProvidersModule {}
