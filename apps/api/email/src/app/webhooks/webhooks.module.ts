import { Module } from '@nestjs/common';
import { MailgunWebhookController } from './mailgun-webhook.controller';
import { SendGridWebhookController } from './sendgrid-webhook.controller';
import { WebhookVerificationService } from './webhook-verification.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [MailgunWebhookController, SendGridWebhookController],
  providers: [WebhookVerificationService],
  exports: [WebhookVerificationService],
})
export class WebhooksModule {}
