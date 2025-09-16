import { Module } from '@nestjs/common';
import { MailgunWebhookController } from './mailgun-webhook.controller';
import {WebhookHandlerService} from "./handlers/webhook-handler.service";

@Module({
  controllers: [MailgunWebhookController],
  providers: [WebhookHandlerService],
  exports: [WebhookHandlerService],
})
export class WebhooksModule {}
