import { Injectable, Inject, Logger } from '@nestjs/common';
import type {IEmailProvider, EmailDeliveryResult, SendEmailRequest} from '@nlc-ai/types';
import {TemplateEngineService} from "../templates/services/template-engine.service";

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(
    @Inject('EMAIL_PROVIDER') private provider: IEmailProvider,
    private readonly templateEngine: TemplateEngineService,
  ) {}

  async sendEmail(message: SendEmailRequest, from?: string, userID?: string): Promise<EmailDeliveryResult> {
    let processedMessage = { ...message };

    if (message.templateID) {
      const template = await this.templateEngine.renderEmailFromTemplate(
        message.templateID,
        message.templateVariables || {},
        userID,
      );

      processedMessage.subject = template.subject;
      processedMessage.html = template.html;
    }

    this.logger.log(`Sending email to: ${processedMessage.to}`);
    return this.provider.sendEmail(processedMessage, from);
  }
}
