import { Module } from '@nestjs/common';
import { MailgunService } from './services/mailgun.service';
import { ProvidersService } from './providers.service';

@Module({
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
