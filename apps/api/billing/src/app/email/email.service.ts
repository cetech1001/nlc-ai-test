import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendPaymentRequestEmail(data: {
    to: string;
    coachName: string;
    planName: string;
    planDescription?: string;
    amount: number;
    paymentLink: string;
    description?: string;
  }): Promise<void> {
    // Minimal stub for Billing extraction: log-only behavior
    this.logger.log(`sendPaymentRequestEmail -> to: ${data.to}, coach: ${data.coachName}, plan: ${data.planName}, amount: $${data.amount}`);
    this.logger.log(`Payment link: ${data.paymentLink}`);
  }
}
