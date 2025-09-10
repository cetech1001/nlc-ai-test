import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailgunService } from './services/mailgun.service';
import { EmailProviderService } from './services/email-provider.service';
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
    EmailProviderService,
  ],
  exports: [EmailProviderService, 'EMAIL_PROVIDER'],
})
export class ProvidersModule {}
