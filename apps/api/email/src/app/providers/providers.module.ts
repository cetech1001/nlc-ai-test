import { Module } from '@nestjs/common';
import { MailgunService } from './services/mailgun.service';
import { ProvidersService } from './providers.service';
import {TemplatesModule} from "../templates/templates.module";

@Module({
  imports: [TemplatesModule],
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
